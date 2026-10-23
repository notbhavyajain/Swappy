'use client'

import { useConnect, useConnection, useConnectors, useDisconnect } from 'wagmi'
import { shortAddress } from '@/lib/format'

export function WalletButton() {
  const { address, isConnected } = useConnection()
  const connectors = useConnectors()
  const connect = useConnect()
  const disconnect = useDisconnect()

  if (isConnected && address) {
    return (
      <button className="btn ghost" onClick={() => disconnect.mutate()}>
        {shortAddress(address)} · disconnect
      </button>
    )
  }

  const injected = connectors[0]
  return (
    <button
      className="btn"
      disabled={!injected || connect.isPending}
      onClick={() => injected && connect.mutate({ connector: injected })}
    >
      {connect.isPending ? 'Connecting…' : 'Connect wallet'}
    </button>
  )
}
