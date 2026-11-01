export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '')

export const DEFAULT_CODING_TIME_LIMIT = 30

export const CODING_ROUND_KEYWORDS = [
  'coding',
  'technical',
  'programming',
  'code',
  'algorithm',
  'data structure',
  'system design',
]

export const COMPANY_SUGGESTIONS = [
  'Google',
  'Stripe',
  'OpenAI',
  'Amazon',
  'Meta',
  'Netflix',
]

export const ROLE_SUGGESTIONS = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'ML Engineer',
]

export const SCORE_DIMENSIONS = [
  { key: 'technical_skills', label: 'Technical skills' },
  { key: 'communication', label: 'Communication' },
  { key: 'problem_solving', label: 'Problem solving' },
  { key: 'culture_fit', label: 'Culture fit' },
]

export const RECOMMENDATIONS = {
  'strong hire': {
    label: 'Strong hire',
    tone: 'emerald',
    description: 'Outstanding signal — move forward with confidence.',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-400/25',
    dot: 'bg-emerald-400',
    bar: 'from-emerald-400 to-teal-300',
    glow: 'shadow-[0_0_40px_-14px_rgba(52,211,153,0.7)]',
  },
  hire: {
    label: 'Hire',
    tone: 'sky',
    description: 'Positive signal — a solid yes from the panel.',
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-400/25',
    dot: 'bg-sky-400',
    bar: 'from-sky-400 to-blue-400',
    glow: 'shadow-[0_0_40px_-14px_rgba(56,189,248,0.65)]',
  },
  borderline: {
    label: 'Borderline',
    tone: 'amber',
    description: 'Mixed signal — worth another conversation.',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-400/25',
    dot: 'bg-amber-400',
    bar: 'from-amber-400 to-orange-300',
    glow: 'shadow-[0_0_40px_-14px_rgba(251,191,36,0.6)]',
  },
  'no hire': {
    label: 'No hire',
    tone: 'rose',
    description: 'Not enough signal for this role right now.',
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-400/25',
    dot: 'bg-rose-400',
    bar: 'from-rose-400 to-red-400',
    glow: 'shadow-[0_0_40px_-14px_rgba(251,113,133,0.6)]',
  },
}

export const LANGUAGES = [
  {
    value: 'python',
    label: 'Python',
    extension: 'py',
    starter: `def solution():\n    pass\n`,
  },
  {
    value: 'javascript',
    label: 'JavaScript',
    extension: 'js',
    starter: `function solution() {\n  \n}\n`,
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    extension: 'ts',
    starter: `function solution(): void {\n  \n}\n`,
  },
  {
    value: 'java',
    label: 'Java',
    extension: 'java',
    starter: `class Solution {\n    public static void main(String[] args) {\n        \n    }\n}\n`,
  },
  {
    value: 'cpp',
    label: 'C++',
    extension: 'cpp',
    starter: `#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n`,
  },
  {
    value: 'go',
    label: 'Go',
    extension: 'go',
    starter: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("hello")\n}\n`,
  },
]
