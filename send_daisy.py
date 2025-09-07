#!/usr/bin/env python3
import os
from algosdk import transaction, mnemonic, account
from algosdk.v2client import algod

# ---- Network config (env or defaults for LocalNet) ----
ALGOD_ADDR  = os.getenv("ALGOD_ADDR",  "http://localhost:4001")
ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

# ---- Required environment variables ----
# DEPLOYER_MNEMONIC : 25 words of the ASA creator (holds the DAISY supply)
# USER_MNEMONIC     : 25 words of the receiver (user to opt-in + receive)
# TOKEN_ID          : DAISY ASA id (int)
#
# ---- Optional ----
# AMOUNT            : how many DAISY to send (default 2000; DAISY has decimals=0)
# FUND_ALGOS        : how many ALGOs to fund the user for fees (default 0.0)

def has_asset(acct_info: dict, asset_id: int) -> bool:
    for a in acct_info.get("assets", []):
        if a.get("asset-id") == asset_id:
            return True
    return False

def wait_tx(client: algod.AlgodClient, txid: str, timeout: int = 6):
    return transaction.wait_for_confirmation(client, txid, timeout)

def main():
    # --- Read env ---
    try:
        DEPLOYER_MNEMONIC = os.environ["DEPLOYER_MNEMONIC"]
        USER_MNEMONIC = os.environ["USER_MNEMONIC"]
        TOKEN_ID = int(os.environ["TOKEN_ID"])
    except KeyError as e:
        missing = e.args[0]
        raise SystemExit(
            f"Missing env var: {missing}\n"
            "Required: DEPLOYER_MNEMONIC, USER_MNEMONIC, TOKEN_ID\n"
            "Optional: AMOUNT (default 2000), FUND_ALGOS (default 0.0)\n"
        )

    AMOUNT = int(os.environ.get("AMOUNT", "2000"))
    FUND_ALGOS = float(os.environ.get("FUND_ALGOS", "0"))

    client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDR)

    # --- Keys + addresses ---
    deployer_sk = mnemonic.to_private_key(DEPLOYER_MNEMONIC)
    deployer_addr = account.address_from_private_key(deployer_sk)

    user_sk = mnemonic.to_private_key(USER_MNEMONIC)
    user_addr = account.address_from_private_key(user_sk)

    print("Deployer:", deployer_addr)
    print("User    :", user_addr)
    print("ASA ID  :", TOKEN_ID)

    # --- Optional: fund user with ALGO for fees ---
    if FUND_ALGOS > 0:
        sp = client.suggested_params()
        pay = transaction.PaymentTxn(
            sender=deployer_addr,
            sp=sp,
            receiver=user_addr,
            amt=int(FUND_ALGOS * 1_000_000),  # ALGO -> microAlgos
        )
        stx = pay.sign(deployer_sk)
        txid = client.send_transaction(stx)
        wait_tx(client, txid)
        print(f"✅ Funded user with {FUND_ALGOS} ALGO | txid: {txid}")

    # --- Ensure USER is opted-in to DAISY (0-amount self xfer) ---
    info = client.account_info(user_addr)
    if not has_asset(info, TOKEN_ID):
        print(f"ℹ️  User not opted into ASA {TOKEN_ID}; sending 0-amount self-transfer to opt-in...")
        sp = client.suggested_params()
        optin = transaction.AssetTransferTxn(
            sender=user_addr,
            sp=sp,
            receiver=user_addr,
            amt=0,
            index=TOKEN_ID,
        )
        stx = optin.sign(user_sk)
        txid = client.send_transaction(stx)
        wait_tx(client, txid)
        print(f"✅ User opted-in to ASA {TOKEN_ID} | txid: {txid}")
    else:
        print(f"ℹ️  User already opted-in to ASA {TOKEN_ID}")

    # --- Send DAISY from ASA creator (deployer) to USER ---
    sp = client.suggested_params()
    axfer = transaction.AssetTransferTxn(
        sender=deployer_addr,
        sp=sp,
        receiver=user_addr,
        amt=AMOUNT,          # DAISY has decimals=0 → whole tokens
        index=TOKEN_ID,
    )
    stx = axfer.sign(deployer_sk)
    txid = client.send_transaction(stx)
    wait_tx(client, txid)
    print(f"✅ Sent {AMOUNT} DAISY (asset {TOKEN_ID}) to {user_addr} | txid: {txid}")

if __name__ == "__main__":
    main()
