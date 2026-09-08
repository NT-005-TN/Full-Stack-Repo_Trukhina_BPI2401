import { useEffect, useState } from 'react'
import { getPoll } from '../../shared/api/polls'
import { Poll } from './types'

export function usePoll(id: number) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) { setError('Опрос не найден'); setIsLoading(false); return }
    getPoll(id).then(setPoll).catch((reason) => setError(reason.message)).finally(() => setIsLoading(false))
  }, [id])

  return { poll, isLoading, error }
}
