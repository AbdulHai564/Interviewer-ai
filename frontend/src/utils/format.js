export function cn(...values) {
  return values.filter(Boolean).join(' ')
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

export function normalizeScore(value) {
  if (value === null || value === undefined || value === '') return null
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return null
  return Math.round(clamp(numeric, 0, 100))
}

export function formatClock(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  const minutes = Math.floor(safeSeconds / 60)
  const seconds = safeSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function formatLongDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export function initials(name = '') {
  const parts = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AI'
}

export function truncate(value = '', max = 42) {
  const text = String(value)
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
