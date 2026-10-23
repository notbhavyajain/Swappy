import { createConfig, http, injected } from 'wagmi'
import { arbitrum, base, mainnet, optimism, polygon } from 'wagmi/chains'

const rpc = (url: string | undefined) => http(url || undefined)

export const wagmiConfig = createConfig({
  chains: [mainnet, arbitrum, optimism, base, polygon],
  connectors: [injected()],
  transports: {
    [mainnet.id]: rpc(process.env.NEXT_PUBLIC_RPC_MAINNET),
    [arbitrum.id]: rpc(process.env.NEXT_PUBLIC_RPC_ARBITRUM),
    [optimism.id]: rpc(process.env.NEXT_PUBLIC_RPC_OPTIMISM),
    [base.id]: rpc(process.env.NEXT_PUBLIC_RPC_BASE),
    [polygon.id]: rpc(process.env.NEXT_PUBLIC_RPC_POLYGON),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
