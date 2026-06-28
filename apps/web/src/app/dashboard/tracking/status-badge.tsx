import type { TickerStatus } from './ticker-types'

type StatusBadgeProps = {
  status: TickerStatus
}

function getStatusStyles(status: TickerStatus) {
  switch (status) {
    case 'live':
      return 'border-green-500/20 bg-green-500/10 text-green-600'
    case 'error':
      return 'border-red-500/20 bg-red-500/10 text-red-600'
    default:
      return 'border-muted bg-muted/40 text-muted-foreground'
  }
}

function getStatusLabel(status: TickerStatus) {
  switch (status) {
    case 'live':
      return 'Live'
    case 'error':
      return 'Reconnecting'
    default:
      return 'Waiting'
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusStyles(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  )
}