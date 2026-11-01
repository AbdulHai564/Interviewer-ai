import { Code2 } from 'lucide-react'
import { cn } from '../utils/format.js'

export default function Logo({ showWordmark = true, size = 'md', className }) {
  const box = size === 'lg' ? 'h-10 w-10 rounded-xl' : 'h-8 w-8 rounded-lg'
  const icon = size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'relative grid place-items-center overflow-hidden bg-gradient-to-br from-accent-400 via-electric to-sky-400 shadow-glow-sm',
          box,
        )}
      >
        <div className="absolute inset-[1px] rounded-[inherit] bg-gradient-to-br from-white/20 to-transparent" />
        <Code2 className={cn('relative text-ink-950', icon)} strokeWidth={2.6} />
      </div>
      {showWordmark ? (
        <span
          className={cn(
            'font-semibold tracking-tight text-white',
            size === 'lg' ? 'text-xl' : 'text-[15px]',
          )}
        >
          interview<span className="text-accent-400">-ai</span>
        </span>
      ) : null}
    </div>
  )
}
