import { createClient } from '@lifi/sdk'
import { EthereumProvider } from '@lifi/sdk-provider-ethereum'
import { getConnectorClient, switchChain } from 'wagmi/actions'
import { wagmiConfig } from './wagmi'

// One LI.FI client for the whole app. The EVM provider borrows the
// connected wallet from wagmi, so LI.FI can sign and switch chains.
export const lifi = createClient({
  integrator: 'swappy',
  providers: [
    EthereumProvider({
      getWalletClient: () => getConnectorClient(wagmiConfig),
      switchChain: async (chainId) => {
        const chain = await switchChain(wagmiConfig, {
          chainId: chainId as (typeof wagmiConfig)['chains'][number]['id'],
        })
        return getConnectorClient(wagmiConfig, { chainId: chain.id })
      },
    }),
  ],
})
