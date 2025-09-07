import { create } from 'zustand'
import { PeraWalletConnect } from '@perawallet/connect'

type WalletState = {
  address: string | null
  connected: boolean
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  signTransactions: (txns: Uint8Array[]) => Promise<Uint8Array[]>
}

const pera = new PeraWalletConnect()

export const useWallet = create<WalletState>((set, get) => ({
  address: null,
  connected: false,
  connect: async () => {
    const accounts = await pera.connect()
    const addr = accounts[0]
    set({ address: addr, connected: true })
    pera.connector?.on('disconnect', () => set({ address: null, connected: false }))
  },
  disconnect: async () => {
    await pera.disconnect()
    set({ address: null, connected: false })
  },
  signTransactions: async (txns) => {
    const toB64 = (u8: Uint8Array) => btoa(String.fromCharCode(...u8))
    const fromB64 = (b64: string) => new Uint8Array(atob(b64).split('').map((c) => c.charCodeAt(0)))
    const group = txns.map((t) => ({ txn: toB64(t) }))
    const signedGroups = (await pera.signTransaction([group])) as Array<Array<Uint8Array | string>>
    const signed = signedGroups[0].map((s) => (s instanceof Uint8Array ? s : fromB64(s)))
    return signed
  }
}))
