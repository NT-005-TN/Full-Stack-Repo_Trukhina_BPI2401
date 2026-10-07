import { Navigate, useParams } from 'react-router-dom'
import { LinearProgress } from '@mui/material'
import { Poll } from './types'

type ResultsPageProps = {
  polls: Poll[]
  isLoggedIn: boolean
}

// Показывает агрегированную статистику без данных отдельных участников.
export default function ResultsPage({ polls, isLoggedIn }: ResultsPageProps) {
  const { pollId } = useParams()
  const poll = polls.find((item) => item.id === Number(pollId))

  if (!poll) {
    return <main><h1>Результаты не найдены</h1></main>
  }

  if (poll.access === 'После входа' && !isLoggedIn) {
    return <Navigate replace to="/login" />
  }

  if (poll.resultsAccess === 'hidden') {
    return <main><h1>Результаты не публикуются</h1></main>
  }

  if (poll.resultsAccess === 'after_finish' && poll.status !== 'Завершён') {
    return <main><h1>Результаты будут доступны после завершения опроса</h1></main>
  }

  return (
    <main>
      <h1>Результаты: {poll.title}</h1>
      <p>Показана только общая анонимная статистика.</p>

      <div className="results-list">
        {poll.questions.map((question, questionIndex) => {
          const counts = question.votes
          const totalVotes = counts.reduce((sum, votes) => sum + votes, 0)

          return (
            <section className="card" key={question.id}>
              <h2>{questionIndex + 1}. {question.text}</h2>

              {question.options.map((option, optionIndex) => {
                const votes = counts[optionIndex]
                const percent = Math.round((votes / totalVotes) * 100)

                return (
                  <div className="result-row" key={option}>
                    <div className="result-label">
                      <span>{option}</span>
                      <strong>{percent}% ({votes})</strong>
                    </div>
                    <LinearProgress variant="determinate" value={percent} />
                  </div>
                )
              })}
            </section>
          )
        })}
      </div>
    </main>
  )
}
