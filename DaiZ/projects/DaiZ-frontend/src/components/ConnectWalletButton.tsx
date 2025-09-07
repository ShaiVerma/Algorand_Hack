import { useWallet } from '../modules/wallet/wallet.store'

export function ConnectWalletButton() {
  const { connected, address, connect, disconnect } = useWallet()
  if (!connected)
    return (
      <button className="rounded-xl border px-3 py-1.5 text-sm hover:bg-secondary" onClick={() => void connect()}>
        Connect Wallet
      </button>
    )
  const short = address ? address.slice(0, 6) + '…' + address.slice(-4) : 'Connected'
  return (
    <button className="rounded-xl bg-secondary px-3 py-1.5 text-sm" onClick={() => void disconnect()} title={address || ''}>
      {short}
    </button>
  )
}

