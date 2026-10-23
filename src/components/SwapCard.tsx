'use client'

import {
  executeRoute,
  getRoutes,
  getTokenBalance,
  type Route,
  type RouteExtended,
  type Token,
} from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { formatUnits, parseUnits } from 'viem'
import { useConnection } from 'wagmi'
import { mainnet, arbitrum } from 'wagmi/chains'
import { chainName } from '@/lib/chains'
import { formatAmount, formatDuration, formatUsd } from '@/lib/format'
import { lifi } from '@/lib/lifi'
import { useTokens } from '@/lib/useTokens'
import { TokenPicker } from './TokenPicker'
import { RouteList } from './RouteList'
import { ExecutionStatus } from './ExecutionStatus'

// Placeholder used for quotes before a wallet is connected.
const QUOTE_ADDRESS = '0x0000000000000000000000000000000000000001'

export function SwapCard() {
  const { address, isConnected } = useConnection()
  const { data: tokens, isLoading: tokensLoading, error: tokensError } = useTokens()

  const [fromChain, setFromChain] = useState<number>(mainnet.id)
  const [toChain, setToChain] = useState<number>(arbitrum.id)
  const [fromToken, setFromToken] = useState<Token>()
  const [toToken, setToToken] = useState<Token>()
  const [amount, setAmount] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selected, setSelected] = useState<Route>()
  const [running, setRunning] = useState<RouteExtended>()
  const [execError, setExecError] = useState<string>()

  const fromList = tokens?.[fromChain] ?? []
  const toList = tokens?.[toChain] ?? []

  // Default to the first token whenever the chain changes.
  useEffect(() => {
    if (fromList.length && !fromList.some((t) => t.address === fromToken?.address)) setFromToken(fromList[0])
  }, [fromList, fromToken])
  useEffect(() => {
    if (toList.length && !toList.some((t) => t.address === toToken?.address)) setToToken(toList[0])
  }, [toList, toToken])

  useEffect(() => {
    const id = setTimeout(() => setDebounced(amount), 500)
    return () => clearTimeout(id)
  }, [amount])

  const fromAmount = useMemo(() => {
    if (!fromToken || !debounced) return undefined
    try {
      const v = parseUnits(debounced, fromToken.decimals)
      return v > 0n ? v.toString() : undefined
    } catch {
      return undefined
    }
  }, [debounced, fromToken])

  const balance = useQuery({
    queryKey: ['balance', address, fromToken?.chainId, fromToken?.address],
    enabled: Boolean(address && fromToken),
    queryFn: () => getTokenBalance(lifi, address!, fromToken!),
  })

  const routes = useQuery({
    queryKey: ['routes', fromChain, toChain, fromToken?.address, toToken?.address, fromAmount, address],
    enabled: Boolean(fromToken && toToken && fromAmount) && !running,
    refetchInterval: 30_000,
    queryFn: async () => {
      const res = await getRoutes(lifi, {
        fromChainId: fromChain,
        toChainId: toChain,
        fromTokenAddress: fromToken!.address,
        toTokenAddress: toToken!.address,
        fromAmount: fromAmount!,
        fromAddress: address ?? QUOTE_ADDRESS,
        options: { slippage: 0.005, order: 'CHEAPEST' },
      })
      return res.routes
    },
  })

  // Keep the selection pointing at a fresh route.
  useEffect(() => {
    const list = routes.data ?? []
    setSelected((prev) => list.find((r) => r.id === prev?.id) ?? list[0])
  }, [routes.data])

  const notEnough =
    balance.data?.amount !== undefined && fromAmount !== undefined && balance.data.amount < BigInt(fromAmount)

  function flip() {
    setFromChain(toChain)
    setToChain(fromChain)
    setFromToken(toToken)
    setToToken(fromToken)
  }

  async function onExecute() {
    if (!selected || !address) return
    setExecError(undefined)
    try {
      const done = await executeRoute(lifi, selected, {
        updateRouteHook: (r) => setRunning({ ...r }),
      })
      setRunning({ ...done })
      balance.refetch()
    } catch (e) {
      setExecError(e instanceof Error ? e.message : String(e))
    }
  }

  const busy = running && !running.steps.every((s) => s.execution?.status === 'DONE' || s.execution?.status === 'FAILED')

  let cta = 'Swap'
  if (!isConnected) cta = 'Connect a wallet to swap'
  else if (!fromAmount) cta = 'Enter an amount'
  else if (notEnough) cta = `Not enough ${fromToken?.symbol}`
  else if (routes.isFetching && !selected) cta = 'Finding routes…'
  else if (!selected) cta = 'No route found'
  else if (busy) cta = 'Executing…'
  else cta = fromChain === toChain ? 'Swap' : `Bridge to ${chainName(toChain)}`

  return (
    <div className="card">
      {tokensError && <p className="error">Could not load tokens from LI.FI. Try refreshing.</p>}

      <TokenPicker
        label="From"
        chainId={fromChain}
        token={fromToken}
        tokens={fromList}
        onChain={setFromChain}
        onToken={setFromToken}
      />

      <div className="amount-row">
        <input
          inputMode="decimal"
          placeholder="0.0"
          value={amount}
          disabled={tokensLoading || Boolean(busy)}
          onChange={(e) => {
            const v = e.target.value.replace(',', '.')
            if (/^\d*\.?\d*$/.test(v)) setAmount(v)
          }}
        />
        {balance.data && fromToken && (
          <button
            className="link"
            onClick={() => setAmount(formatUnits(balance.data!.amount ?? 0n, fromToken.decimals))}
          >
            Balance: {formatAmount(balance.data.amount ?? 0n, fromToken.decimals)}
          </button>
        )}
      </div>

      <button className="flip" aria-label="Swap direction" onClick={flip} disabled={Boolean(busy)}>
        ↓↑
      </button>

      <TokenPicker
        label="To"
        chainId={toChain}
        token={toToken}
        tokens={toList}
        onChain={setToChain}
        onToken={setToToken}
      />

      {routes.error && <p className="error">{(routes.error as Error).message}</p>}

      {selected && toToken && (
        <div className="summary">
          <div>
            <span>You get (est.)</span>
            <strong>
              {formatAmount(selected.toAmount, selected.toToken.decimals)} {selected.toToken.symbol}
            </strong>
          </div>
          <div>
            <span>Minimum received</span>
            <span>
              {formatAmount(selected.toAmountMin, selected.toToken.decimals)} {selected.toToken.symbol}
            </span>
          </div>
          <div>
            <span>Gas</span>
            <span>{formatUsd(selected.gasCostUSD)}</span>
          </div>
          <div>
            <span>Time</span>
            <span>
              ~{formatDuration(selected.steps.reduce((s, st) => s + (st.estimate?.executionDuration ?? 0), 0))}
            </span>
          </div>
        </div>
      )}

      {(routes.data?.length ?? 0) > 1 && (
        <RouteList routes={routes.data!.slice(0, 5)} selectedId={selected?.id} onSelect={setSelected} />
      )}

      <button
        className="btn primary wide"
        disabled={!isConnected || !selected || notEnough || Boolean(busy)}
        onClick={onExecute}
      >
        {cta}
      </button>

      {execError && <p className="error">{execError}</p>}
      {running && <ExecutionStatus route={running} onReset={() => setRunning(undefined)} />}
    </div>
  )
}
