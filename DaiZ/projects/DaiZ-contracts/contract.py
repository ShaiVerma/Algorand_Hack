from algopy import (
    ARC4Contract,
    Account,
    Asset,
    BoxMap,
    Global,
    UInt64,
    Txn,
    arc4,
    itxn,
    gtxn,
)


# ABI-compatible struct for queries
class Query(arc4.Struct):
    submitter: arc4.Address
    query_text: arc4.String
    provider: arc4.Address
    response_text: arc4.String
    is_answered: arc4.Bool


class DecentralizedAiContract(ARC4Contract):
    def __init__(self) -> None:
        self.governor = Account()              # contract governor (manages config + opt-in)
        self.token = Asset(0)                  # ASA used for payments (DAISY token)
        self.query_fee = UInt64(0)             # fee required to post a query
        self.next_query_id = UInt64(1)         # incremental query counter
        self.queries = BoxMap(UInt64, Query, key_prefix="Q")  # storage for queries

    # Initialize contract with DAISY token ASA ID + posting fee
    @arc4.abimethod(create="require")
    def create(self, token_id: Asset, fee: UInt64) -> None:
        self.governor = Txn.sender
        self.token = token_id
        self.query_fee = fee
        self.next_query_id = UInt64(1)

    # Governor can change governor
    @arc4.abimethod
    def set_governor(self, new_governor: Account) -> None:
        assert Txn.sender == self.governor, "Only governor can change governor"
        self.governor = new_governor

    # Governor can change fee
    @arc4.abimethod
    def set_fee(self, new_fee: UInt64) -> None:
        assert Txn.sender == self.governor, "Only governor can set fee"
        self.query_fee = new_fee

    # Governor opts the contract into the DAISY token ASA
    @arc4.abimethod
    def opt_in_to_token(self) -> None:
        """
        Opts the contract into the DAISY ASA token.
        Required before the contract can receive/transfer DAISY.
        """
        assert Txn.sender == self.governor, "Only governor can opt-in"
        itxn.AssetTransfer(
            xfer_asset=self.token,
            asset_amount=UInt64(0),                          # opt-in requires 0 transfer
            asset_receiver=Global.current_application_address,
        ).submit()

    # Governor can withdraw DAISY tokens from contract
    @arc4.abimethod
    def withdraw_asset(self, amount: UInt64) -> None:
        assert Txn.sender == self.governor, "Only governor can withdraw"
        itxn.AssetTransfer(
            xfer_asset=self.token,
            asset_amount=amount,
            asset_receiver=self.governor,
            fee=0,
        ).submit()

    # User posts a query with a DAISY token payment
    @arc4.abimethod
    def post_query(self, query_text: arc4.String, payment: gtxn.AssetTransferTransaction) -> UInt64:
        # Validate payment
        assert payment.xfer_asset == self.token, "Wrong token"
        assert payment.asset_receiver == Global.current_application_address, "Payment must go to contract"
        assert payment.asset_amount == self.query_fee, "Wrong fee amount"
        assert payment.sender == Txn.sender, "Payment must be from caller"

        query_id = self.next_query_id

        new_query = Query(
            submitter=arc4.Address(Txn.sender.bytes),
            query_text=query_text,
            provider=arc4.Address(Global.zero_address),
            response_text=arc4.String(""),
            is_answered=arc4.Bool(False),
        )

        self.queries[query_id] = new_query.copy()
        self.next_query_id += UInt64(1)

        return query_id

    # Provider submits a response and gets rewarded in DAISY
    @arc4.abimethod
    def submit_response(self, query_id: UInt64, response_text: arc4.String) -> None:
        query = self.queries[query_id].copy()
        assert query.is_answered == arc4.Bool(False), "Already answered"

        query.provider = arc4.Address(Txn.sender.bytes)
        query.response_text = response_text
        query.is_answered = arc4.Bool(True)
        self.queries[query_id] = query.copy()

        # Pay provider in DAISY
        itxn.AssetTransfer(
            xfer_asset=self.token,
            asset_amount=self.query_fee,
            asset_receiver=Txn.sender,
            fee=0,
        ).submit()

    # Read-only method: returns a query by ID
    @arc4.abimethod(readonly=True)
    def get_query(self, query_id: UInt64) -> Query:
        return self.queries[query_id]
