import os
import time
import random
import logging
from algosdk.mnemonic import to_private_key
from algosdk.account import get_address_from_private_key
from algokit_utils import (
    Account,
    get_algod_client,
    get_localnet_default_account,
    opt_in,
)
# CHANGE: Import the new, generated client and the Query struct
from client import DecentralizedAiContractClient, Query

# --- Configuration ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

APP_ID = int(os.environ.get("APP_ID", 0))
if APP_ID == 0:
    raise ValueError("APP_ID environment variable not set or is zero.")

PROVIDER_MNEMONIC = os.environ.get("PROVIDER_MNEMONIC")
if not PROVIDER_MNEMONIC:
    raise ValueError("PROVIDER_MNEMONIC environment variable not set.")

# --- Client and Account Setup ---
algod_client = get_algod_client()

provider_private_key = to_private_key(PROVIDER_MNEMONIC)
provider_address = get_address_from_private_key(provider_private_key)
provider_account = Account(private_key=provider_private_key, address=provider_address)

logging.info(f"AI Provider Node started. Watching App ID: {APP_ID}")
logging.info(f"Provider Address: {provider_account.address}")

# Instantiate the generated client for the specific app
app_client = DecentralizedAiContractClient(
    algod_client,
    app_id=APP_ID,
    signer=provider_account.signer,
)

# --- AI Simulation ---
def get_ai_response(query: str) -> str:
    """Simulates a call to an LLM."""
    logging.info(f"Processing query: '{query}'")
    time.sleep(2)
    responses = [
        f"Regarding '{query}', the answer involves advanced cryptography and is quite elegant.",
        f"My analysis of '{query}' suggests it is a foundational concept in modern blockchain privacy.",
    ]
    return random.choice(responses)

# --- Main Loop ---
def main():
    last_processed_query_id = 0

    while True:
        try:
            # CHANGE: Access state through the new, clean client interface
            global_state = app_client.get_global_state()
            next_query_id = global_state.get('next_query_id', 1)
            daisy_token_id = global_state.get('token')

            if not daisy_token_id:
                logging.warning("Token ID not found in global state. Waiting...")
                time.sleep(10)
                continue

            for query_id in range(last_processed_query_id + 1, next_query_id):
                logging.info(f"Checking for new query with ID: {query_id}...")
                
                # CHANGE: Call get_query using the new client interface
                response = app_client.get_query(query_id=query_id)
                query_details: Query = response.return_value
                
                if not query_details.is_answered:
                    logging.info(f"Found new query (ID: {query_id}): '{query_details.query_text}'")
                    
                    try:
                        opt_in(algod_client, provider_account, [daisy_token_id])
                        logging.info(f"Successfully opted into DAISY token (ID: {daisy_token_id})")
                    except Exception as e:
                        if "already opted in" not in str(e):
                            logging.warning(f"Could not opt into asset, but continuing: {e}")

                    ai_answer = get_ai_response(query_details.query_text)
                    
                    # CHANGE: Call submit_response using the new client interface
                    logging.info(f"Submitting response for Query ID: {query_id}...")
                    app_client.submit_response(query_id=query_id, response_text=ai_answer)
                    logging.info(f"Successfully submitted response for Query ID: {query_id}. Payment received.")

                last_processed_query_id = query_id

        except Exception as e:
            logging.error(f"An error occurred: {e}", exc_info=True)

        time.sleep(10)

if __name__ == "__main__":
    main()

