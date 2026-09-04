import { LinearProgress } from '@mui/material'
import { poll } from './pollData'

const results = [
  [
    { option: 'Квиз', votes: 18 },
    { option: 'Спортивный турнир', votes: 12 },
    { option: 'Киноклуб', votes: 10 },
  ],
  [
    { option: 'Понедельник', votes: 8 },
    { option: 'Среда', votes: 20 },
    { option: 'Пятница', votes: 12 },
  ],
  [
    { option: 'Очно', votes: 25 },
    { option: 'Онлайн', votes: 15 },
  ],
]

export default function ResultsPage() {
  return (
    <main>
      <h1>Результаты: {poll.title}</h1>
      <p>Всего участников: 40. Показана только общая анонимная статистика.</p>

      <div className="results-list">
        {poll.questions.map((question, questionIndex) => {
          const questionResults = results[questionIndex]
          const totalVotes = questionResults.reduce((sum, item) => sum + item.votes, 0)

          return (
            <section className="card" key={question.id}>
              <h2>{questionIndex + 1}. {question.text}</h2>

              {questionResults.map((item) => {
                const percent = Math.round((item.votes / totalVotes) * 100)

                return (
                  <div className="result-row" key={item.option}>
                    <div className="result-label">
                      <span>{item.option}</span>
                      <strong>{percent}% ({item.votes})</strong>
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
