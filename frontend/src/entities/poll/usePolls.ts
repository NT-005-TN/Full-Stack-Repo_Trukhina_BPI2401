import { useEffect, useState } from 'react'
import { polls as demoPolls } from './data'
import { Poll } from './types'

type PollsState = {
  polls: Poll[]
  isLoading: boolean
  error: string
  retry: () => void
}

export function usePolls(): PollsState {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const shouldFail = searchParams.get('error') === '1' && attempt === 0
    const delay = Number(searchParams.get('delay')) || 400

    setIsLoading(true)
    setError('')

    const timer = window.setTimeout(() => {
      if (shouldFail) {
        setError('Не удалось загрузить опросы. Попробуйте ещё раз.')
      } else {
        setPolls(demoPolls)
      }
      setIsLoading(false)
    }, delay)

    return () => window.clearTimeout(timer)
  }, [attempt])

  return {
    polls,
    isLoading,
    error,
    retry: () => setAttempt((currentAttempt) => currentAttempt + 1),
  }
}
