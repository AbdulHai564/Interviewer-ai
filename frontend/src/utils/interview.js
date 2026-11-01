import {
  CODING_ROUND_KEYWORDS,
  DEFAULT_CODING_TIME_LIMIT,
  SCORE_DIMENSIONS,
} from './constants.js'
import { normalizeScore } from './format.js'

export function getRoundName(round) {
  if (!round) return ''
  if (typeof round === 'string') return round.trim()
  return String(
    round.name ??
      round.round ??
      round.title ??
      round.label ??
      round.round_name ??
      round.current_round ??
      '',
  ).trim()
}

export function getRoundTimeLimit(round) {
  if (!round || typeof round !== 'object') return null
  const raw =
    round.time_limit ??
    round.timeLimit ??
    round.duration_minutes ??
    round.duration ??
    null
  const numeric = Number(raw)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null
}

export function normalizeRound(round, index = 0) {
  const name = getRoundName(round) || `Round ${index + 1}`
  return {
    name,
    timeLimit: getRoundTimeLimit(round),
    raw: round,
  }
}

export function normalizeRounds(raw) {
  if (!Array.isArray(raw)) return []
  return raw
    .map((round, index) => normalizeRound(round, index))
    .filter((round) => Boolean(round.name))
}

export function isCodingRound(roundName) {
  const name = String(roundName ?? '').toLowerCase()
  return CODING_ROUND_KEYWORDS.some((keyword) => name.includes(keyword))
}

export function codingTimeLimit(rounds, roundName) {
  const match = rounds?.find((round) => round.name === roundName)
  return match?.timeLimit ?? DEFAULT_CODING_TIME_LIMIT
}

export function normalizeRecommendation(value) {
  const text = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')

  if (!text) return null
  if (text.includes('strong') && text.includes('hire')) return 'strong hire'
  if (text.includes('no hire') || text.includes('not hire') || text.includes('reject')) {
    return 'no hire'
  }
  if (text.includes('borderline')) return 'borderline'
  if (text.includes('hire')) return 'hire'
  return null
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
      .filter(Boolean)
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(/\n|•|;/)
      .map((item) => item.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean)
  }
  return []
}

function normalizeRoundReport(entry, index) {
  const source = entry && typeof entry === 'object' ? entry : {}
  return {
    name: getRoundName(source) || `Round ${index + 1}`,
    score: normalizeScore(
      source.score ?? source.overall_score ?? source.overallScore ?? source.rating,
    ),
    strengths: normalizeList(source.strengths),
    weaknesses: normalizeList(source.weaknesses ?? source.areas_for_improvement),
    notes: String(source.notes ?? source.feedback ?? source.summary ?? '').trim(),
  }
}

export function normalizeReport(raw) {
  const payload =
    raw?.report ??
    raw?.evaluation ??
    raw?.report_data ??
    (raw?.round_results && typeof raw.round_results === 'object'
      ? raw.round_results
      : raw) ??
    {}

  const roundsSource = payload.rounds ?? payload.round_results?.rounds ?? {}
  let rounds = []

  if (Array.isArray(roundsSource)) {
    rounds = roundsSource.map((round, index) => normalizeRoundReport(round, index))
  } else if (roundsSource && typeof roundsSource === 'object') {
    rounds = Object.entries(roundsSource).map(([name, value], index) =>
      normalizeRoundReport({ ...(value ?? {}), name }, index),
    )
  }

  return {
    overallScore: normalizeScore(
      payload.overall_score ?? payload.overallScore ?? payload.score,
    ),
    recommendation: normalizeRecommendation(payload.recommendation),
    summary: String(payload.summary ?? payload.overall_summary ?? '').trim(),
    dimensions: SCORE_DIMENSIONS.map((dimension) => ({
      ...dimension,
      score: normalizeScore(
        payload[dimension.key] ?? payload.dimensions?.[dimension.key],
      ),
    })),
    rounds,
    hiringDecision: String(
      payload.hiring_decision ??
        payload.hiringDecision ??
        payload.decision ??
        payload.final_decision ??
        '',
    ).trim(),
    raw: payload,
  }
}

export function scoreTone(score) {
  if (score === null || score === undefined) {
    return {
      text: 'text-slate-500',
      bar: 'from-slate-600 to-slate-500',
      track: 'bg-slate-800',
    }
  }
  if (score >= 80) {
    return {
      text: 'text-emerald-300',
      bar: 'from-emerald-400 to-teal-300',
      track: 'bg-emerald-950/60',
    }
  }
  if (score >= 65) {
    return {
      text: 'text-sky-300',
      bar: 'from-sky-400 to-blue-400',
      track: 'bg-sky-950/60',
    }
  }
  if (score >= 50) {
    return {
      text: 'text-amber-300',
      bar: 'from-amber-400 to-orange-300',
      track: 'bg-amber-950/60',
    }
  }
  return {
    text: 'text-rose-300',
    bar: 'from-rose-400 to-red-400',
    track: 'bg-rose-950/60',
  }
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
