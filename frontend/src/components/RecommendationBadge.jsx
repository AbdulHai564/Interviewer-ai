import {
  AlertTriangle,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { RECOMMENDATIONS } from '../utils/constants.js'
import { cn } from '../utils/format.js'

const ICONS = {
  'strong hire': Award,
  hire: CheckCircle2,
  borderline: AlertTriangle,
  'no hire': XCircle,
}

const FALLBACK = {
  label: 'Not rated',
  text: 'text-slate-300',
  bg: 'bg-slate-500/10',
  border: 'border-slate-400/20',
  dot: 'bg-slate-400',
}

export default function RecommendationBadge({
  recommendation,
  showIcon = true,
  size = 'md',
}) {
  const meta = RECOMMENDATIONS[recommendation] || FALLBACK
  const Icon = ICONS[recommendation] || AlertTriangle

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border font-semibold',
        meta.text,
        meta.bg,
        meta.border,
        size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-[11px]',
      )}
    >
      {showIcon ? (
        <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
      ) : (
        <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
      )}
      {meta.label}
    </span>
  )
}
