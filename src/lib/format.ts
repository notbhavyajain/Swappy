import { formatUnits } from 'viem'

export function formatAmount(raw: string | bigint | undefined, decimals: number, max = 6) {
  if (raw === undefined) return '0'
  const n = Number(formatUnits(BigInt(raw), decimals))
  if (n === 0) return '0'
  if (n < 0.000001) return '<0.000001'
  return n.toLocaleString('en-US', { maximumFractionDigits: max })
}

export function formatUsd(v: string | number | undefined) {
  const n = Number(v ?? 0)
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
}

export function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`
  return `${Math.round(seconds / 60)} min`
}

export function shortAddress(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`
}
