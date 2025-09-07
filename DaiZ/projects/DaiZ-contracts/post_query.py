#!/usr/bin/env python3
import os
import sys
import logging
from typing import Optional

from algosdk import transaction
from algosdk.mnemonic import to_private_key
from algosdk.account import address_from_private_key
from algosdk.atomic_transaction_composer import AccountTransactionSigner, TransactionWithSigner

from algokit_utils import AlgorandClient, SendParams, CommonAppCallParams
from client import DecentralizedAiContractClient  # generated client
from dotenv import load_dotenv

# Load variables from .env file into process environment
load_dotenv()

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("post_query_manual")


def _client_for_env() -> AlgorandClient:
    return AlgorandClient.from_environment()


def _get_asset_holding(acct_info: dict, asset_id: int) -> Optional[dict]:
    for h in acct_info.get("assets", []):
        if h.get("asset-id") == asset_id:
            return h
    return None


def _ensure_user_opted_in_and_funded(algorand: AlgorandClient, addr: str, sk: str, token_id: int, needed: int):
    """Opt-in USER to ASA if missing; verify balance >= needed."""
    algod = algorand.client.algod
    acct_info = algod.account_info(addr)

    holding = _get_asset_holding(acct_info, token_id)
    if holding is None:
        log.info("User not opted into ASA %s; submitting 0-amount self-transfer to opt-in...", token_id)
        sp = algod.suggested_params()
        optin = transaction.AssetTransferTxn(sender=addr, sp=sp, receiver=addr, amt=0, index=token_id)
        stx = optin.sign(sk)
        txid = algod.send_transaction(stx)
        transaction.wait_for_confirmation(algod, txid, 4)
        log.info("Opt-in confirmed: %s", txid)
        acct_info = algod.account_info(addr)
        holding = _get_asset_holding(acct_info, token_id)

    balance = int(holding.get("amount", 0)) if holding else 0
    if balance < needed:
        raise SystemExit(
            f"USER has {balance} DAISY but needs at least {needed} to pay the query fee.\n"
            f"Top up the USER with DAISY, then retry."
        )


def main(query_text):
    # if len(sys.argv) < 2:
    #     print('Usage: python post_query.py "your question here"')
    #     sys.exit(1)
    # query_text = sys.argv[1]

    APP_ID = os.environ.get("APP_ID")
    USER_MNEMONIC = os.environ.get("USER_MNEMONIC")
    if not APP_ID or not USER_MNEMONIC:
        print("Set env first:")
        print("  export APP_ID=<deployed app id>")
        print('  export USER_MNEMONIC="your 25-word mnemonic (payer of DAISY fee)"')
        sys.exit(1)

    app_id = int(APP_ID)
    sk = to_private_key(USER_MNEMONIC)
    addr = address_from_private_key(sk)
    signer = AccountTransactionSigner(sk)

    algorand = _client_for_env()

    # Client for deployed app
    app = DecentralizedAiContractClient(
        algorand=algorand,
        app_id=app_id,
        default_sender=addr,
        default_signer=signer,
    )

    # Read token + fee from chain
    gs = app.state.global_state
    token = int(gs.token)       # DAISY ASA id
    fee = int(gs.query_fee)     # whole tokens (ASA decimals=0)

    # Ensure USER is opted in and has enough DAISY to cover the fee
    _ensure_user_opted_in_and_funded(algorand, addr, sk, token, fee)

    # Build the grouped axfer (DAISY fee -> app) + app call post_query
    sp = algorand.client.algod.suggested_params()
    app_addr = app.app_address

    axfer_txn = transaction.AssetTransferTxn(
        sender=addr,
        sp=sp,
        receiver=app_addr,
        amt=fee,
        index=token,
    )
    axfer_tws = TransactionWithSigner(axfer_txn, signer)

    params = CommonAppCallParams()  # no inner fees in post_query
    send_params = SendParams(populate_app_call_resources=True)

    log.info("Posting query with grouped DAISY payment...")
    res = app.send.post_query(
        args=(query_text, axfer_tws),
        params=params,
        send_params=send_params,
    )

    print("✅ Posted query")
    print("   confirmed round:", res.confirmed_round)
    print("   tx id:", res.tx_id)


if __name__ == "__main__":
    main()
