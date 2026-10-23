'use client'

import type { RouteExtended } from '@lifi/sdk'

const LABEL: Record<string, string> = {
  CHECK_ALLOWANCE: 'Check allowance',
  SET_ALLOWANCE: 'Approve token',
  RESET_ALLOWANCE: 'Reset allowance',
  PERMIT: 'Sign permit',
  NATIVE_PERMIT: 'Sign permit',
  SWAP: 'Swap',
  CROSS_CHAIN: 'Bridge',
  RECEIVING_CHAIN: 'Receive on destination',
}

export function ExecutionStatus({ route, onReset }: { route: RouteExtended; onReset: () => void }) {
  const allDone = route.steps.every((s) => s.execution?.status === 'DONE')
  const failed = route.steps.some((s) => s.execution?.status === 'FAILED')

  return (
    <div className="exec">
      <div className="exec-head">
        <strong>{allDone ? 'Done ✓' : failed ? 'Failed' : 'In progress'}</strong>
        {(allDone || failed) && (
          <button className="link" onClick={onReset}>
            New swap
          </button>
        )}
      </div>
      {route.steps.map((step) => (
        <div key={step.id} className="exec-step">
          <div className="exec-tool">{step.toolDetails.name}</div>
          {(step.execution?.actions ?? []).map((a, i) => (
            <div key={i} className={`exec-action ${a.status.toLowerCase()}`}>
              <span>{LABEL[a.type] ?? a.type}</span>
              <span>
                {a.txLink ? (
                  <a href={a.txLink} target="_blank" rel="noreferrer">
                    view tx ↗
                  </a>
                ) : (
                  a.status.toLowerCase().replace('_', ' ')
                )}
              </span>
            </div>
          ))}
          {step.execution?.error && <p className="error">{step.execution.error.message}</p>}
        </div>
      ))}
    </div>
  )
}
