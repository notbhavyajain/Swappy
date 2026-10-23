'use client'

import { getTokens, type Token } from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { CHAIN_IDS, FEATURED_SYMBOLS } from './chains'
import { lifi } from './lifi'

// Fetch tokens for all supported chains once, keep only the featured ones.
export function useTokens() {
  return useQuery({
    queryKey: ['lifi-tokens', CHAIN_IDS],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const res = await getTokens(lifi, { chains: CHAIN_IDS })
      const byChain: Record<number, Token[]> = {}
      for (const id of CHAIN_IDS) {
        const list = res.tokens[id] ?? []
        const seen = new Set<string>()
        byChain[id] = FEATURED_SYMBOLS.flatMap((sym) => {
          const t = list.find((x) => x.symbol.toUpperCase() === sym)
          if (!t || seen.has(t.address)) return []
          seen.add(t.address)
          return [t]
        })
      }
      return byChain
    },
  })
}
