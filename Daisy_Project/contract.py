'''"""
ARC-4 smart contract logic for the Decentralized Blockchain Search (DAISY) protocol.

This file is part of the DAISY (Decentralized Blockchain Search) reference implementation.
It aims to demonstrate a trust-minimized query/answer AI powered engine on Algorand.

Notes
-----
- Keep API keys and node tokens off the client. Use a proxy or local environment variables.
- All interactions with Algorand should follow best practices for fee budgeting and grouping.
- See README.md for system architecture and end-to-end flow.
"""'''

from algopy import ARC4Contract, Account, Asset, BoxMap, Global, UInt64, Txn, arc4, itxn, gtxn, log, op


# ABI-compatible struct for queries
class Query(arc4.Struct):
    submitter: arc4.Address
    query_text: arc4.String
    provider: arc4.Address
    response_text: arc4.String
    is_answered: arc4.Bool


class DecentralizedAiContract(ARC4Contract):
    """
    DecentralizedAiContract class

    Purpose
    -------
    Encapsulates logic for the DAISY protocol with one node on LocalNet. Need to add further details about responsibilities, attributes, and usage examples for multiple nodes on TestNet
    """

    def __init__(self) -> None:
        """
        __init__ function

        Parameters
        ----------
        (none)

        Returns
        -------
        Any
        Description of the return value.
        """

        self.governor = Account()
        self.token = Asset(0)
        self.query_fee = UInt64(0)
        self.next_query_id = UInt64(1)

    @arc4.abimethod(create='require')
    def create(self, token_id: Asset, fee: UInt64) -> None:
        """
        create function

        Parameters
        ----------
        token_id: description
        fee: description

        Returns
        -------
        Any
        Description of the return value.
        """
        self.governor = Txn.sender
        self.token = token_id
        self.query_fee = fee
        self.next_query_id = UInt64(1)

    @arc4.abimethod
    def set_governor(self, new_governor: Account) -> None:
        """
        set_governor function.

        Parameters
        ----------
        new_governor: description

        Returns
        -------
        Any
        Description of the return value.
        """
        assert Txn.sender == self.governor, 'Only governor can change governor'
        self.governor = new_governor

    @arc4.abimethod
    def set_fee(self, new_fee: UInt64) -> None:
        """
        set_fee function.

        Parameters
        ----------
        new_fee: description

        Returns
        -------
        Any
            Description of the return value.
        """
        assert Txn.sender == self.governor, 'Only governor can set fee'
        self.query_fee = new_fee

    @arc4.abimethod
    def opt_in_to_token(self) -> None:
        """
        Opts the contract into the DAISY ASA token.
        Required before the contract can receive/transfer DAISY.
        """
        assert Txn.sender == self.governor, 'Only governor can opt-in'
        itxn.AssetTransfer(xfer_asset=self.token, asset_amount=UInt64(0), asset_receiver=Global.current_application_address).submit()

    @arc4.abimethod
    def withdraw_asset(self, amount: UInt64) -> None:
        """
        withdraw_asset function.

        Parameters
        ----------
        amount: description

        Returns
        -------
        Any
            Description of the return value.
        """
        assert Txn.sender == self.governor, 'Only governor can withdraw'
        itxn.AssetTransfer(xfer_asset=self.token, asset_amount=amount, asset_receiver=self.governor, fee=0).submit()

    @arc4.abimethod
    def post_query(self, query_text: arc4.String, payment: gtxn.AssetTransferTransaction) -> UInt64:
        """
        post_query function.

        Parameters
        ----------
        query_text: description
        payment: description

        Returns
        -------
        Any
            Description of the return value.
        """
        assert payment.xfer_asset == self.token, 'Wrong token'
        assert payment.asset_receiver == Global.current_application_address, 'Payment must go to contract'
        assert payment.asset_amount == self.query_fee, 'Wrong fee amount'
        assert payment.sender == Txn.sender, 'Payment must be from caller'
        query_id = self.next_query_id
        new_query = Query(submitter=arc4.Address(Txn.sender.bytes), query_text=query_text, provider=arc4.Address(Global.zero_address), response_text=arc4.String(''), is_answered=arc4.Bool(False))
        self.queries[query_id] = new_query.copy()
        self.next_query_id += UInt64(1)
        return query_id

    @arc4.abimethod
    def submit_response(self, query_id: UInt64, response_text: arc4.String) -> None:
        """
        submit_response function.

        Parameters
        ----------
        query_id: description
        response_text: description

        Returns
        -------
        Any
            Description of the return value.
        """
        query = self.queries[query_id].copy()
        assert query.is_answered == arc4.Bool(False), 'Already answered'
        query.provider = arc4.Address(Txn.sender.bytes)
        query.response_text = response_text
        query.is_answered = arc4.Bool(True)
        self.queries[query_id] = query.copy()
        itxn.AssetTransfer(xfer_asset=self.token, asset_amount=self.query_fee, asset_receiver=Txn.sender, fee=0).submit()

    @arc4.abimethod(readonly=True)
    def get_query(self, query_id: UInt64) -> Query:
        '''"""
        get_query function.

        Parameters
        ----------
        query_id: description

        Returns
        -------
        Any
        Description of the return value.
        """'''
        return self.queries[query_id]
