'use client'

import type { Token } from '@lifi/sdk'
import { SUPPORTED_CHAINS } from '@/lib/chains'

type Props = {
  label: string
  chainId: number
  token?: Token
  tokens: Token[]
  onChain: (id: number) => void
  onToken: (t: Token) => void
}

export function TokenPicker({ label, chainId, token, tokens, onChain, onToken }: Props) {
  return (
    <div className="picker">
      <span className="picker-label">{label}</span>
      <div className="picker-row">
        <select value={chainId} onChange={(e) => onChain(Number(e.target.value))}>
          {SUPPORTED_CHAINS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={token?.address ?? ''}
          onChange={(e) => {
            const t = tokens.find((x) => x.address === e.target.value)
            if (t) onToken(t)
          }}
        >
          {tokens.map((t) => (
            <option key={t.address} value={t.address}>
              {t.symbol}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
