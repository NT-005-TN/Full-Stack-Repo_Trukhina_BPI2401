import { useParams } from 'react-router-dom'
import { LinearProgress } from '@mui/material'
import { polls } from './pollData'

const voteCounts = [18, 12, 10, 7]

export default function ResultsPage() {
  const { pollId } = useParams()
  const poll = polls.find((item) => item.id === Number(pollId))

  if (!poll) {
    return <main><h1>Результаты не найдены</h1></main>
  }

  return (
    <main>
      <h1>Результаты: {poll.title}</h1>
      <p>Показана только общая анонимная статистика.</p>

      <div className="results-list">
        {poll.questions.map((question, questionIndex) => {
          const counts = question.options.map((_, optionIndex) =>
            voteCounts[(questionIndex + optionIndex) % voteCounts.length],
          )
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
