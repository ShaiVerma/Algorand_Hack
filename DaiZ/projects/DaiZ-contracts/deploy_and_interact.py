#!/usr/bin/env python3
import logging
import os

from algosdk.logic import get_application_address

from algokit_utils import (
    AlgorandClient,
    AlgoAmount,
    CommonAppCallParams,
    SendParams,
)
from algokit_utils.transactions import (
    AssetCreateParams,
    PaymentParams,
)

# ---- import your generated client module; DO NOT modify client.py ----
import client as client_mod

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)

from dotenv import load_dotenv

load_dotenv()


def get_deployer(algorand: AlgorandClient):
    """
    Use AlgoKit Utils v3 account helpers.
    - LocalNet: DEPLOYER is auto-created/funded.
    - TestNet/MainNet: set DEPLOYER_MNEMONIC in env.
    Returns a SigningAccount with `.address` and `.signer`.
    """
    mn = os.getenv("DEPLOYER_MNEMONIC")
    if mn:
        acct = algorand.account.from_mnemonic(mn)
    else:
        acct = algorand.account.from_environment("DEPLOYER")
    log.info("Deployer account: %s", acct.address)
    return acct


def create_daisy_asa(algorand: AlgorandClient, deployer):
    """
    Create an ASA using the dataclass params style in AlgoKit Utils v3.
    """
    log.info("--- Creating DAISY token ---")

    asa_params = AssetCreateParams(
        sender=deployer.address,
        total=1_000_000,
        decimals=0,
        unit_name="DAISY",
        asset_name="DAISY",
        default_frozen=False,
    )
    result = algorand.send.asset_create(asa_params)
    asset_id = result.confirmation["asset-index"]
    log.info("DAISY token created with ID: %s", asset_id)
    return asset_id


def deploy_app_via_factory(algorand: AlgorandClient, deployer, token_id: int, query_fee_microalgos: int):
    """
    Your generated client exposes a Factory for creation.
    We must use it to get both the DecentralizedAiContractClient and the new app_id.
    """
    # Find your exact Factory and CreateArgs types from client.py
    Factory = getattr(client_mod, "DecentralizedAiContractFactory")
    CreateArgs = getattr(client_mod, "CreateArgs")

    factory = Factory(
        algorand=algorand,
        default_sender=deployer.address,
        default_signer=deployer.signer,
    )

    # The ABI method is create(asset,uint64). Pass the ASA id and fee (your contract's query_fee).
    create_args = CreateArgs(token_id=token_id, fee=query_fee_microalgos)

    log.info("--- Deploying Smart Contract ---")
    app_client, create_result = factory.send.create.create(
        args=create_args,
        # You can also pass compilation_params=... if needed
        send_params=SendParams(populate_app_call_resources=True),
    )

    app_id = create_result.app_id
    log.info("Contract deployed with App ID: %s", app_id)
    return app_client, app_id


def fund_app_account_for_asa_opt_in(algorand: AlgorandClient, deployer, app_id: int):
    """
    ASA opt-in increases the app account's minimum balance; send a little ALGO first.
    """
    app_addr = get_application_address(app_id)
    pay = PaymentParams(
        sender=deployer.address,
        receiver=app_addr,
        amount=AlgoAmount.from_algo(0.30),  # headroom for MBR + fees
    )
    algorand.send.payment(pay)
    log.info("Funded app account %s with 0.30 ALGO", app_addr)


def opt_in_app_to_asa(app_client, *, cover_inner_fees: bool = True):
    """
    Call the generated `opt_in_to_token()` and make the outer tx pay inner fees.
    """
    log.info("--- Opting app account into DAISY ASA via inner transaction ---")

    send_params = SendParams(
        cover_app_call_inner_transaction_fees=True if cover_inner_fees else None,
        populate_app_call_resources=True,
    )
    # Optional: put a sensible ceiling on the fee for the parent call
    method_params = CommonAppCallParams(max_fee=AlgoAmount.from_micro_algo(5_000))

    # Your generated client exposes .send.opt_in_to_token(...)
    app_client.send.opt_in_to_token(params=method_params, send_params=send_params)

    log.info("Opt-in inner transaction submitted successfully.")


def main():
    algorand = AlgorandClient.from_environment()
    deployer = get_deployer(algorand)

    # 1) Create ASA
    asa_id = create_daisy_asa(algorand, deployer)

    # 2) Deploy app using the Factory (required by your client constructor)
    #    Choose a starting query fee for your contract, e.g. 1000 microAlgos:
    app_client, app_id = deploy_app_via_factory(algorand, deployer, token_id=asa_id, query_fee_microalgos=1_000)

    # 3) Fund the app address to cover the MBR bump caused by ASA opt-in
    fund_app_account_for_asa_opt_in(algorand, deployer, app_id)

    # 4) Perform the inner ASA opt-in and have the outer call cover the inner fees
    opt_in_app_to_asa(app_client, cover_inner_fees=True)

    log.info("All done. ASA %s, App %s", asa_id, app_id)


if __name__ == "__main__":
    main()
