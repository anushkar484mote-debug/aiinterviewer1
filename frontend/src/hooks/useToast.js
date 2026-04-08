/**
 * hooks/useToast.js
 * Lightweight toast notification system.
 */
import { useState, useCallback, useRef } from 'react'

let _setToasts = null

export function useToastProvider() {
  const [toasts, setToasts] = useState([])
  _setToasts = setToasts

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, remove }
}

export function toast(message, type = 'info', duration = 4000) {
  if (!_setToasts) return
  const id = Date.now() + Math.random()
  _setToasts((prev) => [...prev.slice(-4), { id, message, type }])
  setTimeout(() => {
    _setToasts((prev) => prev.filter((t) => t.id !== id))
  }, duration)
}

toast.success = (msg) => toast(msg, 'success')
toast.error   = (msg) => toast(msg, 'error', 5000)
toast.warn    = (msg) => toast(msg, 'warning')


/**
 * hooks/useAsync.js
 * Simple async state machine for data fetching.
 */
import { useState as _useState, useCallback as _useCallback } from 'react'

export function useAsync(fn, immediate = false) {
  const [state, setState] = _useState({
    data: null, loading: immediate, error: null,
  })
  const idRef = useRef(0)

  const execute = _useCallback(async (...args) => {
    const id = ++idRef.current
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const result = await fn(...args)
      if (id !== idRef.current) return
      const data = result?.data !== undefined ? result.data : result
      setState({ data, loading: false, error: null })
      return data
    } catch (err) {
      if (id !== idRef.current) return
      setState((s) => ({ ...s, loading: false, error: err.message }))
      throw err
    }
  }, [fn])

  const reset = _useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}
