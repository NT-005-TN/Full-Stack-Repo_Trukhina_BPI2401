import { Link } from 'react-router-dom'
import { Alert, Button, Chip } from '@mui/material'
import { poll } from './pollData'

export default function PollInfoPage() {
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
