from fastapi import FastAPI
from pydantic import BaseModel
from algokit_utils import AlgorandClient, ApplicationClient
from utils import save_env_var
from algosdk import account, mnemonic

app = FastAPI()

algorand = AlgorandClient.default_localnet()

APP_ID = 1009  # your deployed smart contract

class QueryRequest(BaseModel):
  sender: str # Wallet info
  prompt: str

@app.post("/post-query")
def post_query(req: QueryRequest):
  post_query(f"{req.prompt}")

  return {"txId": "success"} # not a tx id
