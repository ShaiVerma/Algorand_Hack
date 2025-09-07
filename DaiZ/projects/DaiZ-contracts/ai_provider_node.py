#!/usr/bin/env python3
import os
import time
import random
import logging
from typing import Optional

from algosdk.mnemonic import to_private_key
from algosdk.account import address_from_private_key as get_address_from_private_key
from algosdk.atomic_transaction_composer import AccountTransactionSigner

from algokit_utils import AlgorandClient, SendParams, CommonAppCallParams, AlgoAmount
from dotenv import load_dotenv

# Load variables from .env file into process environment
load_dotenv()

# Generated client (do not modify)
from client import DecentralizedAiContractClient, Query

# ------------ Config ------------
POLL_SECONDS = int(os.getenv("POLL_SECONDS", "6"))
APP_ID_ENV = "APP_ID"               # required
PROVIDER_MNEMONIC_ENV = "PROVIDER_MNEMONIC"  # required now to avoid version mismatches

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("ai_provider")

# ------------ Helpers ------------
def _build_algorand_client() -> AlgorandClient:
    """Return a concrete AlgorandClient instance across algokit-utils versions."""
    # Try the common factory; if it returns a callable (older API), call it
    factory = getattr(AlgorandClient, "default_local_net", None)
    if callable(factory):
        client = factory()
        if callable(client):
            client = client()
        return client
    # Fallback: some versions expose default_localnet
    factory = getattr(AlgorandClient, "default_localnet", None)
    if callable(factory):
        client = factory()
        if callable(client):
            client = client()
        return client
    raise SystemExit("Could not construct AlgorandClient; please upgrade algokit-utils or set up proper client.")

def _get_provider_account():
    """Require PROVIDER_MNEMONIC to avoid incompatible helper APIs."""
    m = os.getenv(PROVIDER_MNEMONIC_ENV)
    if not m:
        raise SystemExit(
            "Set PROVIDER_MNEMONIC to your 25-word mnemonic (TestNet/LocalNet). "
            "Example: export PROVIDER_MNEMONIC='word1 word2 ... word25'"
        )
    sk = to_private_key(m)
    addr = get_address_from_private_key(sk)
    signer = AccountTransactionSigner(sk)
    log.info("Using provider from PROVIDER_MNEMONIC: %s", addr)
    return addr, signer

def _init_client(algorand: AlgorandClient, app_id: int, provider_addr: str, provider_signer) -> DecentralizedAiContractClient:
    return DecentralizedAiContractClient(
        algorand=algorand,
        app_id=app_id,
        default_sender=provider_addr,
        default_signer=provider_signer,
    )

def _maybe_log_token_and_fee(app: DecentralizedAiContractClient):
    try:
        gs = app.state.global_state
        log.info("Contract token (ASA id): %s | query_fee (micro-units): %s | next_query_id: %s",
                 gs.token, gs.query_fee, gs.next_query_id)
    except Exception as e:
        log.warning("Could not read global state: %s", e)

def _produce_ai_answer(query_text: str) -> str:
    # TODO: Replace with real AI inference if desired; keep short to fit ABI arg limits
    canned = [
        f"Answer to '{query_text}': verify with sources and keep it concise.",
        f"My take on '{query_text}': decompose into steps and validate each.",
        f"For '{query_text}', rely on minimal, sufficient facts and cite where possible."
    ]
    time.sleep(random.uniform(0.2, 0.8))  # simulate work
    return random.choice(canned)

# ------------ Main loop ------------
def main():
    app_id_str = os.getenv(APP_ID_ENV)
    if not app_id_str:
        raise SystemExit(f"Environment variable {APP_ID_ENV} is required (your deployed contract app id).")
    try:
        app_id = int(app_id_str)
    except ValueError:
        raise SystemExit(f"Invalid {APP_ID_ENV}={app_id_str!r}; must be an integer.")

    algorand = _build_algorand_client()
    provider_addr, provider_signer = _get_provider_account()
    app = _init_client(algorand, app_id, provider_addr, provider_signer)

    _maybe_log_token_and_fee(app)

    last_processed = 0

    log.info("AI provider node started. Watching app_id=%s | provider=%s", app_id, provider_addr)
    while True:
        try:
            gs = app.state.global_state
            next_qid = gs.next_query_id

            # Handle any new query ids since last loop
            for qid in range(last_processed + 1, next_qid):
                # Read stored query (readonly ABI)
                result = app.send.get_query(args=(qid,))
                query: Optional[Query] = result.abi_return  # dataclass-like or None

                if query is None:
                    log.info("Query %s not found; skipping.", qid)
                    last_processed = qid
                    continue

                if query.is_answered:
                    log.info("Query %s already answered by %s; skipping.", qid, query.provider)
                    last_processed = qid
                    continue

                log.info("New query %s from %s: %s", qid, query.submitter, query.query_text)

                # Build answer
                ai_answer = _produce_ai_answer(query.query_text)

                # Submit response. Ensure we cover inner-txn fees and resource budgeting.
                method_params = CommonAppCallParams(max_fee=AlgoAmount.from_micro_algo(5_000))
                send_params = SendParams(
                    cover_app_call_inner_transaction_fees=True,
                    populate_app_call_resources=True,
                )

                log.info("Submitting response for query %s ...", qid)
                app.send.submit_response(args=(qid, ai_answer), params=method_params, send_params=send_params)
                log.info("Submitted response for query %s. If your provider account has opted into the DAISY ASA, "
                         "you should now receive the reward.", qid)

                last_processed = qid

        except Exception as e:
            log.error("Error in provider loop: %s", e, exc_info=True)

        time.sleep(POLL_SECONDS)


if __name__ == "__main__":
    main()
