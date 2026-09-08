import { Link, Navigate, useParams } from 'react-router-dom'
import { Alert, Button, Chip } from '@mui/material'
import { usePoll } from '../entities/poll/usePoll'
import DataState from '../shared/ui/DataState'
import PageMessage from '../shared/ui/PageMessage'

type PollInfoPageProps = {
  isLoggedIn: boolean
}

export default function PollInfoPage({ isLoggedIn }: PollInfoPageProps) {
  const { pollId } = useParams()
  const { poll, isLoading, error } = usePoll(Number(pollId))

  if (isLoading) return <main><DataState type="loading" message="Загружаем опрос…" /></main>
  if (error || !poll) {
    return <PageMessage title={error || "Опрос не найден"} linkText="Вернуться к опросам" linkTo="/" />
  }

  if (poll.access === 'registered' && !isLoggedIn) {
    return <Navigate replace to="/login" />
  }

  return (
    <main className="small-page">
      <Chip color="success" label="Опрос активен" />
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
        <Button component={Link} to={`/polls/${poll.id}/vote`} variant="contained">
          Начать опрос
        </Button>
      </div>
    </main>
  )
}
