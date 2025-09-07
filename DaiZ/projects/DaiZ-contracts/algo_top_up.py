# fund_user_algo.py
#!/usr/bin/env python3
import os
from algosdk import mnemonic, account, transaction
from algosdk.v2client import algod

from dotenv import load_dotenv

load_dotenv()

ALGOD_ADDR  = os.getenv("ALGOD_ADDR",  "http://localhost:4001")
ALGOD_TOKEN = os.getenv("ALGOD_TOKEN", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

DEPLOYER_MNEMONIC = os.environ["DEPLOYER_MNEMONIC"]  # the account that has ALGO
USER_ADDRESS      = os.environ["USER_ADDRESS"]       # the user to top-up
AMOUNT_ALGO       = float(os.environ.get("AMOUNT_ALGO", "6"))  # default 0.05 ALGO

client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDR)



def main():
    sk = mnemonic.to_private_key(DEPLOYER_MNEMONIC)
    addr = account.address_from_private_key(sk)

    sp = client.suggested_params()
    # Optional: force exact 1000 µALGO fee
    sp.flat_fee = True
    sp.fee = 1000

    pay = transaction.PaymentTxn(
        sender=addr,
        sp=sp,
        receiver=USER_ADDRESS,
        amt=int(AMOUNT_ALGO * 1_000_000),
    )
    stx = pay.sign(sk)
    txid = client.send_transaction(stx)
    transaction.wait_for_confirmation(client, txid, 4)
    print(f"✅ Funded {USER_ADDRESS} with {AMOUNT_ALGO} ALGO | txid {txid}")

if __name__ == "__main__":
    main()
