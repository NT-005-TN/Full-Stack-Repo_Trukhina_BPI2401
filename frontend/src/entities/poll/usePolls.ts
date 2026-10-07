import { useEffect, useState } from 'react'
import { Poll } from './types'
import { getPolls } from '../../shared/api/polls'

type PollsState = {
  polls: Poll[]
  isLoading: boolean
  error: string
  retry: () => void
}

// Загружает список опросов и предоставляет кнопку повторной попытки.
export function usePolls(): PollsState {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  // Новый номер попытки повторно запускает запрос к API.
  useEffect(() => {
    setIsLoading(true)
    setError('')
    getPolls()
      .then(setPolls)
      .catch((requestError) => setError(
        requestError instanceof Error ? requestError.message : 'Не удалось загрузить опросы.',
      ))
      .finally(() => setIsLoading(false))
  }, [attempt])

  return {
    polls,
    isLoading,
    error,
    retry: () => setAttempt((currentAttempt) => currentAttempt + 1),
  }
}
