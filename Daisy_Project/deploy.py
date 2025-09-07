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

import client as client_mod

logging.basicConfig(level=logging.INFO)
log = logging.getLogger(__name__)


from dotenv import load_dotenv

load_dotenv()

def get_deployer(algorand: AlgorandClient):
    """
    AlgoKit Utils v3:
    - LocalNet: DEPLOYER is auto-created/funded if not present.
    - TestNet/MainNet: set DEPLOYER_MNEMONIC in env.
    Returns a SigningAccount with `.address` and `.signer`.
    """
    mn = os.getenv("DEPLOYER_MNEMONIC")
    if mn:
        acct = algorand.account.from_mnemonic(mnemonic=mn)
    else:
        acct = algorand.account.from_environment("DEPLOYER")
    log.info("Deployer account: %s", acct.address)
    return acct


def create_daisy_asa(algorand: AlgorandClient, deployer):
    """
    Create the DAISY ASA (decimals=0). Returns asset id (int).
    """
    log.info("--- Creating DAISY token ---")
    asa_params = AssetCreateParams(
        sender=deployer.address,
        total=1_000_000,
        decimals=0,              # IMPORTANT: asset units are whole tokens
        unit_name="DAISY",
        asset_name="DAISY",
        default_frozen=False,
    )
    result = algorand.send.asset_create(asa_params)
    asset_id = result.confirmation["asset-index"]
    log.info("DAISY token created with ID: %s", asset_id)
    return asset_id


def deploy_app_via_factory(algorand: AlgorandClient, deployer, token_id: int, query_fee_tokens: int):
    """
    Use your generated Factory to deploy and get (app_client, app_id).
    """
    Factory = getattr(client_mod, "DecentralizedAiContractFactory")
    CreateArgs = getattr(client_mod, "CreateArgs")

    factory = Factory(
        algorand=algorand,
        default_sender=deployer.address,
        default_signer=deployer.signer,
    )

    create_args = CreateArgs(token_id=token_id, fee=query_fee_tokens)

    log.info("--- Deploying Smart Contract ---")
    app_client, create_result = factory.send.create.create(
        args=create_args,
        send_params=SendParams(populate_app_call_resources=True),
    )

    app_id = create_result.app_id
    log.info("Contract deployed with App ID: %s", app_id)
    return app_client, app_id


def fund_app_account_for_asa_opt_in(algorand: AlgorandClient, deployer, app_id: int):
    """
    Fund the app account to cover MBR increase from ASA opt-in.
    """
    app_addr = get_application_address(app_id)
    pay = PaymentParams(
        sender=deployer.address,
        receiver=app_addr,
        amount=AlgoAmount.from_algo(0.30),  # safe headroom
    )
    algorand.send.payment(pay)
    log.info("Funded app account %s with 0.30 ALGO", app_addr)


def opt_in_app_to_asa(app_client, *, cover_inner_fees: bool = True):
    """
    Call the app's `opt_in_to_token` and have outer tx pay inner fees.
    """
    log.info("--- Opting app account into DAISY ASA via inner transaction ---")

    send_params = SendParams(
        cover_app_call_inner_transaction_fees=True if cover_inner_fees else None,
        populate_app_call_resources=True,
    )
    method_params = CommonAppCallParams(max_fee=AlgoAmount.from_micro_algo(5_000))

    app_client.send.opt_in_to_token(params=method_params, send_params=send_params)
    log.info("Opt-in inner transaction submitted successfully.")


def main():
    # Choose network from environment (LOCAL: set ALGOD host/token via Algokit)
    algorand = AlgorandClient.from_environment()
    deployer = get_deployer(algorand)

    # 1) Create ASA
    asa_id = create_daisy_asa(algorand, deployer)

    # 2) Deploy app with initial fee; since DAISY has decimals=0, fee is in whole tokens
    app_client, app_id = deploy_app_via_factory(
        algorand, deployer, token_id=asa_id, query_fee_tokens=1_000
    )

    # 3) Fund app address for ASA opt-in
    fund_app_account_for_asa_opt_in(algorand, deployer, app_id)

    # 4) Inner opt-in to DAISY
    opt_in_app_to_asa(app_client, cover_inner_fees=True)

    log.info("All done. ASA %s, App %s", asa_id, app_id)
    print(f"\nExport this for interaction:\n  export APP_ID={app_id}\n")


if __name__ == "__main__":
    main()
