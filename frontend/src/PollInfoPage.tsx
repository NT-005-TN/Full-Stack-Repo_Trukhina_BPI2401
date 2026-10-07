import { Link, Navigate, useParams } from 'react-router-dom'
import { Alert, Button, Chip } from '@mui/material'
import { Poll } from './types'

type PollInfoPageProps = {
  polls: Poll[]
  isLoggedIn: boolean
}

// Показывает описание и правила перед началом выбранного опроса.
export default function PollInfoPage({ polls, isLoggedIn }: PollInfoPageProps) {
  const { pollId } = useParams()
  const poll = polls.find((item) => item.id === Number(pollId))

  if (!poll) {
    return <main><h1>Опрос не найден</h1></main>
  }

  // Закрытый опрос перенаправляет гостя на страницу входа.
  if (poll.access === 'После входа' && !isLoggedIn) {
    return <Navigate replace to="/login" />
  }

  return (
    <main className="small-page">
      <Chip color={poll.status === 'Активен' ? 'success' : 'default'} label={poll.status} />
      <h1>{poll.title}</h1>
      <p>{poll.description}</p>

      <section className="card poll-info">
        <h2>Перед началом</h2>
        <p>Вопросов: {poll.questions.length}</p>
        <p>Выберите один вариант ответа в каждом вопросе.</p>
        <p>После заполнения можно проверить и изменить ответы.</p>
        <Alert severity="info">
          Опрос анонимный. Создатель увидит только общую статистику.
        </Alert>
      </section>

      <div className="actions">
        <Button component={Link} to="/">
          Назад
        </Button>
        <Button disabled={poll.status !== 'Активен'} component={Link} to={`/polls/${poll.id}/vote`} variant="contained">
          Начать опрос
        </Button>
      </div>
    </main>
  )
}
