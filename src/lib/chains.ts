import { arbitrum, base, mainnet, optimism, polygon } from 'wagmi/chains'

export const SUPPORTED_CHAINS = [mainnet, arbitrum, optimism, base, polygon] as const

export type SupportedChainId = (typeof SUPPORTED_CHAINS)[number]['id']

export const CHAIN_IDS = SUPPORTED_CHAINS.map((c) => c.id)

export function chainName(id: number): string {
  return SUPPORTED_CHAINS.find((c) => c.id === id)?.name ?? `Chain ${id}`
}

// Only show the tokens people actually move around, keeps the picker short.
export const FEATURED_SYMBOLS = ['ETH', 'WETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'POL']
