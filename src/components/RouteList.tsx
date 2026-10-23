'use client'

import type { Route } from '@lifi/sdk'
import { formatAmount, formatDuration, formatUsd } from '@/lib/format'

type Props = { routes: Route[]; selectedId?: string; onSelect: (r: Route) => void }

export function RouteList({ routes, selectedId, onSelect }: Props) {
  return (
    <div className="routes">
      <span className="picker-label">{routes.length} routes</span>
      {routes.map((r) => {
        const tools = r.steps.map((s) => s.toolDetails.name).join(' → ')
        const time = r.steps.reduce((s, st) => s + (st.estimate?.executionDuration ?? 0), 0)
        return (
          <button
            key={r.id}
            className={`route ${r.id === selectedId ? 'active' : ''}`}
            onClick={() => onSelect(r)}
          >
            <div className="route-top">
              <strong>
                {formatAmount(r.toAmount, r.toToken.decimals)} {r.toToken.symbol}
              </strong>
              {r.tags?.map((t) => (
                <span key={t} className="tag">
                  {t.toLowerCase()}
                </span>
              ))}
            </div>
            <div className="route-meta">
              {tools} · gas {formatUsd(r.gasCostUSD)} · ~{formatDuration(time)}
            </div>
          </button>
        )
      })}
    </div>
  )
}
