import axios from 'axios'

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 180000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

function unwrap(response) {
  return response?.data
}

export const api = {
  startInterview(company, role) {
    return apiClient.post('/start', { company, role }).then(unwrap)
  },

  sendMessage(sessionId, message) {
    return apiClient
      .post('/chat', { session_id: sessionId, message })
      .then(unwrap)
  },

  getReport(sessionId) {
    return apiClient
      .get(`/report/${encodeURIComponent(sessionId)}`)
      .then(unwrap)
  },

  getHistory(sessionId) {
    return apiClient
      .get(`/history/${encodeURIComponent(sessionId)}`)
      .then(unwrap)
  },
}

function detailToText(detail) {
  if (!detail) return ''
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        return item?.msg ?? item?.message ?? JSON.stringify(item)
      })
      .join(' ')
  }
  if (typeof detail === 'object') {
    return detail.message ?? detail.msg ?? JSON.stringify(detail)
  }
  return String(detail)
}

export function getApiErrorMessage(error) {
  if (!error) return 'Something went wrong. Please try again.'

  if (error.code === 'ECONNABORTED') {
    return 'The interviewer took too long to respond. Please try again.'
  }

  if (!error.response) {
    return `Can't reach the interview server at ${API_BASE_URL}. Make sure the FastAPI backend is running on port 8000.`
  }

  const status = error.response.status
  const detail = detailToText(error.response.data?.detail)
  if (status === 404) {
    return (
      detail ||
      'That API endpoint was not found. Check that the FastAPI route is registered.'
    )
  }
  if (status === 422) {
    return detail || 'The request was missing or had invalid fields.'
  }
  if (status >= 500) {
    return detail || 'The interview server hit an error. Please try again.'
  }
  return detail || error.message || 'The request failed. Please try again.'
}
