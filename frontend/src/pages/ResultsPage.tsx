import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, LinearProgress } from '@mui/material'
import { getResults } from '../shared/api/polls'
import DataState from '../shared/ui/DataState'
import PageMessage from '../shared/ui/PageMessage'

type Results = {
  poll_id: number
  title: string
  questions: Array<{
    question_id: number
    text: string
    total_votes: number
    options: Array<{ option_id: number; text: string; votes: number }>
  }>
}

type ResultsPageProps = {
  isLoggedIn: boolean
}

export default function ResultsPage({ isLoggedIn: _isLoggedIn }: ResultsPageProps) {
  const { pollId } = useParams()
  const [results, setResults] = useState<Results | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getResults(Number(pollId)).then(setResults).catch((reason) => setError(reason.message)).finally(() => setIsLoading(false))
  }, [pollId])

  if (isLoading) return <main><DataState type="loading" message="Загружаем результаты…" /></main>
  if (error || !results) return <PageMessage title={error || "Результаты не найдены"} linkText="Вернуться к опросам" linkTo="/" />

  return (
    <main>
      <h1>Результаты: {results.title}</h1>
      <p>Показана только общая анонимная статистика.</p>

      <div className="results-list">
        {results.questions.map((question, questionIndex) => (
            <section className="card" key={question.question_id}>
              <h2>{questionIndex + 1}. {question.text}</h2>
              {question.total_votes === 0 && <Alert severity="info">Ответов пока нет.</Alert>}
              {question.options.map((option) => {
                const percent = question.total_votes ? Math.round((option.votes / question.total_votes) * 100) : 0

                return (
                  <div className="result-row" key={option.option_id}>
                    <div className="result-label">
                      <span>{option.text}</span>
                      <strong>{percent}% ({option.votes})</strong>
                    </div>
                    <LinearProgress variant="determinate" value={percent} />
                  </div>
                )
              })}
            </section>
          ))}
      </div>
    </main>
  )
}
