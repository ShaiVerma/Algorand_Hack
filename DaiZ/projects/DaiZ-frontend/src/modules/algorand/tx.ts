import algosdk from 'algosdk'

export function buildPostQueryTx({
  from,
  appId,
  suggestedParams,
  prompt
}: {
  from: string
  appId: number
  suggestedParams: any
  prompt: string
}) {
  const appArgs = [new TextEncoder().encode('post_query'), new TextEncoder().encode(prompt)]
  return algosdk.makeApplicationNoOpTxn(from, suggestedParams, appId, appArgs)
}

