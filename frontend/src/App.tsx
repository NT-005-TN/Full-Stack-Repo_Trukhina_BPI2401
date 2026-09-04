import { Link, Route, Routes } from 'react-router-dom'
import { Button, TextField } from '@mui/material'
import PollPage from './PollPage'

const polls = [
  { id: 1, title: 'Студенческие мероприятия', questions: 3 },
  { id: 2, title: 'Выбор формата занятий', questions: 4 },
]

function PollList() {
  return (
    <main>
      <h1>Доступные опросы</h1>
      <p>Выберите опрос, чтобы принять участие.</p>

      <div className="poll-list">
        {polls.map((poll) => (
          <article className="card" key={poll.id}>
            <h2>{poll.title}</h2>
            <p>Вопросов: {poll.questions}</p>
            <Button component={Link} to={`/polls/${poll.id}`} variant="contained">
              Пройти опрос
            </Button>
          </article>
        ))}
      </div>
    </main>
  )
}

function Login() {
  return (
    <main className="small-page">
      <h1>Вход</h1>
      <form className="card form">
        <TextField label="Электронная почта" type="email" />
        <TextField label="Пароль" type="password" />
        <Button type="submit" variant="contained">Войти</Button>
        <Button type="button" variant="outlined">Продолжить как гость</Button>
      </form>
    </main>
  )
}

function NotFound() {
  return (
    <main>
      <h1>Страница не найдена</h1>
      <Link to="/">Вернуться к опросам</Link>
    </main>
  )
}

export default function App() {
  return (
    <>
      <header>
        <Link className="logo" to="/">Опросы</Link>
        <nav>
          <Link to="/">Главная</Link>
          <Link to="/login">Войти</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PollList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/polls/:pollId" element={<PollPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
