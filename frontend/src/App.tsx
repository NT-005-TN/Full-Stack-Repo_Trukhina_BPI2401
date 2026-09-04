import { Link, Route, Routes } from 'react-router-dom'
import { Button } from '@mui/material'
import AuthPage from './AuthPage'
import CreatePollPage from './CreatePollPage'
import HistoryPage from './HistoryPage'
import PollPage from './PollPage'
import ResultsPage from './ResultsPage'

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
            {poll.id === 1 && (
              <Button component={Link} to={`/polls/${poll.id}/results`}>
                Результаты
              </Button>
            )}
          </article>
        ))}
      </div>
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
          <Link to="/create">Создать</Link>
          <Link to="/history">История</Link>
          <Link to="/login">Войти</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PollList />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/polls/:pollId" element={<PollPage />} />
        <Route path="/polls/:pollId/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
