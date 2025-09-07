from fastapi import FastAPI
import logging
logging.basicConfig(level=logging.DEBUG)
from pydantic import BaseModel
from algokit_utils import AlgorandClient, ApplicationClient
import post_query
app = FastAPI()

#algorand = AlgorandClient.default_localnet()

class QueryRequest(BaseModel):
  prompt: str

@app.post("/post-query")
async def post_query_endpoint(req: QueryRequest):
  #print(f"Prompt: {req.prompt}")
  #post_query.main(req.prompt) # post query
  # return whatever frontend expects
  return {"txId": "success"}




