import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { api, getApiErrorMessage } from '../lib/api.js'
import {
  DEFAULT_CODING_TIME_LIMIT,
} from '../utils/constants.js'
import {
  codingTimeLimit,
  getRoundName,
  isCodingRound,
  normalizeReport,
  normalizeRound,
  normalizeRounds,
} from '../utils/interview.js'

const InterviewContext = createContext(null)

let messageCounter = 0

function createMessage(sender, content, round) {
  messageCounter += 1
  return {
    id: `msg-${Date.now()}-${messageCounter}`,
    sender,
    content: String(content ?? ''),
    round: round || '',
    createdAt: Date.now(),
  }
}

function extractText(value) {
  if (!value) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'object') {
    return String(
      value.content ?? value.message ?? value.text ?? value.response ?? '',
    ).trim()
  }
  return String(value).trim()
}

function extractChatMessage(data) {
  return (
    extractText(data?.message) ||
    extractText(data?.response) ||
    extractText(data?.content)
  )
}

function pickEmbeddedReport(data) {
  const candidates = [data?.report, data?.evaluation, data?.round_results]
  return candidates.find(
    (candidate) =>
      candidate &&
      typeof candidate === 'object' &&
      Object.keys(candidate).length > 0,
  )
}

function timerConfigForRound(data, roundName, rounds) {
  const hasExplicitFlag = typeof data?.timer_active === 'boolean'
  const active = hasExplicitFlag
    ? data.timer_active
    : isCodingRound(roundName)

  const rawLimit =
    data?.time_limit ??
    data?.timeLimit ??
    codingTimeLimit(rounds, roundName)

  const minutes = Number(rawLimit)

  return {
    active,
    limit:
      Number.isFinite(minutes) && minutes > 0
        ? minutes
        : DEFAULT_CODING_TIME_LIMIT,
  }
}

export function InterviewProvider({ children }) {
  const [phase, setPhase] = useState('landing')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [rounds, setRounds] = useState([])
  const [currentRound, setCurrentRound] = useState('')
  const [messages, setMessages] = useState([])
  const [startedAt, setStartedAt] = useState(null)

  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatError, setChatError] = useState('')
  const [interviewComplete, setInterviewComplete] = useState(false)

  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')

  const [timer, setTimer] = useState({
    active: false,
    endsAt: null,
    totalSeconds: 0,
  })

  const sendingRef = useRef(false)

  const beginTimer = useCallback((minutes) => {
    const numeric = Number(minutes)
    const totalSeconds = Math.max(
      1,
      Math.round(
        (Number.isFinite(numeric) && numeric > 0
          ? numeric
          : DEFAULT_CODING_TIME_LIMIT) * 60,
      ),
    )
    setTimer({
      active: true,
      endsAt: Date.now() + totalSeconds * 1000,
      totalSeconds,
    })
  }, [])

  const stopTimer = useCallback(() => {
    setTimer({ active: false, endsAt: null, totalSeconds: 0 })
  }, [])

  const clearStartError = useCallback(() => setStartError(''), [])
  const clearChatError = useCallback(() => setChatError(''), [])

  const loadReport = useCallback(async (activeSessionId, embeddedReport) => {
    setPhase('report')
    setReportLoading(true)
    setReportError('')

    try {
      const payload = embeddedReport || (await api.getReport(activeSessionId))
      const normalized = normalizeReport(payload)
      setReport(normalized)
      return true
    } catch (error) {
      setReportError(getApiErrorMessage(error))
      return false
    } finally {
      setReportLoading(false)
    }
  }, [])

  const startInterview = useCallback(
    async ({ company: companyInput, role: roleInput }) => {
      const nextCompany = String(companyInput ?? '').trim()
      const nextRole = String(roleInput ?? '').trim()

      if (!nextCompany || !nextRole) {
        setStartError('Please enter both a company and a role.')
        return false
      }

      setStartError('')
      setIsStarting(true)

      try {
        const data = await api.startInterview(nextCompany, nextRole)
        if (!data || typeof data !== 'object') {
          throw new Error('The server returned an empty response.')
        }

        const nextSessionId = data.session_id ?? data.sessionId ?? data.id
        if (!nextSessionId) {
          throw new Error('The server did not return a session_id.')
        }

        const normalizedRounds = normalizeRounds(data.rounds)
        const nextRoundName =
          getRoundName(data.current_round ?? data.currentRound ?? data.round) ||
          normalizedRounds[0]?.name ||
          'Interview'

        const finalRounds = normalizedRounds.length
          ? normalizedRounds
          : [normalizeRound(nextRoundName)]

        const initialMessage = extractChatMessage(data)

        setCompany(nextCompany)
        setRole(nextRole)
        setSessionId(String(nextSessionId))
        setRounds(finalRounds)
        setCurrentRound(nextRoundName)
        setStartedAt(new Date())
        setMessages(
          initialMessage
            ? [createMessage('interviewer', initialMessage, nextRoundName)]
            : [],
        )
        setInterviewComplete(false)
        setReport(null)
        setReportError('')
        setChatError('')
        setPhase('interview')

        const config = timerConfigForRound(
          data,
          nextRoundName,
          finalRounds,
        )
        if (config.active) {
          beginTimer(config.limit)
        } else {
          stopTimer()
        }

        return true
      } catch (error) {
        setStartError(getApiErrorMessage(error))
        return false
      } finally {
        setIsStarting(false)
      }
    },
    [beginTimer, stopTimer],
  )

  const sendMessage = useCallback(
    async (rawMessage) => {
      const text = String(rawMessage ?? '').trim()
      if (
        !text ||
        !sessionId ||
        sendingRef.current ||
        interviewComplete
      ) {
        return false
      }

      sendingRef.current = true
      setIsSending(true)
      setChatError('')

      setMessages((previous) => [
        ...previous,
        createMessage('candidate', text, currentRound),
      ])

      try {
        const data = await api.sendMessage(sessionId, text)

        if (!data || typeof data !== 'object') {
          throw new Error('The server returned an empty response.')
        }

        const nextRoundName =
          getRoundName(data.current_round ?? data.currentRound ?? data.round) ||
          currentRound
        const roundChanged =
          Boolean(nextRoundName) && nextRoundName !== currentRound
        const responseMessage = extractChatMessage(data)

        if (responseMessage) {
          setMessages((previous) => [
            ...previous,
            createMessage('interviewer', responseMessage, nextRoundName),
          ])
        }

        if (nextRoundName) setCurrentRound(nextRoundName)

        const complete = Boolean(
          data.interview_complete ?? data.interviewComplete,
        )
        setInterviewComplete(complete)

        if (complete) {
          const embeddedReport = pickEmbeddedReport(data)
          stopTimer()
          await loadReport(sessionId, embeddedReport)
        } else {
          const config = timerConfigForRound(data, nextRoundName, rounds)

          if (roundChanged) {
            if (config.active) {
              beginTimer(config.limit)
            } else {
              stopTimer()
            }
          } else if (typeof data.timer_active === 'boolean') {
            if (data.timer_active) {
              if (!timer.active) beginTimer(config.limit)
            } else {
              stopTimer()
            }
          }
        }

        return true
      } catch (error) {
        setChatError(getApiErrorMessage(error))
        return false
      } finally {
        sendingRef.current = false
        setIsSending(false)
      }
    },
    [
      sessionId,
      interviewComplete,
      currentRound,
      rounds,
      timer.active,
      beginTimer,
      stopTimer,
      loadReport,
    ],
  )

  const retryReport = useCallback(() => {
    if (!sessionId) return Promise.resolve(false)
    return loadReport(sessionId)
  }, [sessionId, loadReport])

  const resetInterview = useCallback(() => {
    sendingRef.current = false
    setPhase('landing')
    setCompany('')
    setRole('')
    setSessionId(null)
    setRounds([])
    setCurrentRound('')
    setMessages([])
    setStartedAt(null)
    setIsStarting(false)
    setStartError('')
    setIsSending(false)
    setChatError('')
    setInterviewComplete(false)
    setReport(null)
    setReportLoading(false)
    setReportError('')
    setTimer({ active: false, endsAt: null, totalSeconds: 0 })
  }, [])

  const value = useMemo(
    () => ({
      phase,
      company,
      role,
      sessionId,
      rounds,
      currentRound,
      messages,
      startedAt,
      isStarting,
      startError,
      isSending,
      chatError,
      interviewComplete,
      report,
      reportLoading,
      reportError,
      timerActive: timer.active,
      timerEndsAt: timer.endsAt,
      timerTotalSeconds: timer.totalSeconds,
      startInterview,
      sendMessage,
      retryReport,
      resetInterview,
      clearStartError,
      clearChatError,
    }),
    [
      phase,
      company,
      role,
      sessionId,
      rounds,
      currentRound,
      messages,
      startedAt,
      isStarting,
      startError,
      isSending,
      chatError,
      interviewComplete,
      report,
      reportLoading,
      reportError,
      timer.active,
      timer.endsAt,
      timer.totalSeconds,
      startInterview,
      sendMessage,
      retryReport,
      resetInterview,
      clearStartError,
      clearChatError,
    ],
  )

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  )
}

export function useInterview() {
  const context = useContext(InterviewContext)
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider')
  }
  return context
}
