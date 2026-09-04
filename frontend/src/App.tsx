import { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { Button, Chip, TextField } from '@mui/material'
import AuthPage from './AuthPage'
import CreatePollPage from './CreatePollPage'
import HistoryPage from './HistoryPage'
import ManagePollPage from './ManagePollPage'
import PollInfoPage from './PollInfoPage'
import PollPage from './PollPage'
import ResultsPage from './ResultsPage'
import { polls } from './pollData'
import { CreatedPoll, PollStatus } from './types'

function PollList() {
  const [search, setSearch] = useState('')
  const visiblePolls = polls.filter((poll) =>
    poll.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <main>
      <h1>Доступные опросы</h1>
      <p>Выберите опрос, чтобы принять участие.</p>

      <TextField
        className="search-field"
        fullWidth
        label="Поиск по названию"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      <div className="poll-list">
        {visiblePolls.map((poll) => (
          <article className="card" key={poll.id}>
            <h2>{poll.title}</h2>
            <p>Вопросов: {poll.questions.length}</p>
            <div className="poll-tags">
              <Chip color="success" label={poll.status} size="small" />
              <Chip label={poll.access} size="small" />
            </div>
            <Button component={Link} to={`/polls/${poll.id}`} variant="contained">
              Открыть опрос
            </Button>
            {poll.id === 1 && (
              <Button component={Link} to={`/polls/${poll.id}/results`}>
                Результаты
              </Button>
            )}
          </article>
        ))}
        {visiblePolls.length === 0 && <p>Опросы не найдены.</p>}
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
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem('isLoggedIn') === 'true',
  )
  const [createdPolls, setCreatedPolls] = useState<CreatedPoll[]>([
    { id: 1, title: 'Студенческие мероприятия', questionCount: 3, status: 'Черновик' },
  ])

  function login() {
    sessionStorage.setItem('isLoggedIn', 'true')
    setIsLoggedIn(true)
  }

  function logout() {
    sessionStorage.removeItem('isLoggedIn')
    setIsLoggedIn(false)
  }

  function addCreatedPoll(newPoll: CreatedPoll) {
    setCreatedPolls([...createdPolls, newPoll])
  }

  function changePollStatus(pollId: number, status: PollStatus) {
    setCreatedPolls(createdPolls.map((poll) =>
      poll.id === pollId ? { ...poll, status } : poll,
    ))
  }

  return (
    <>
      <header>
        <Link className="logo" to="/">Опросы</Link>
        <nav>
          <Link to="/">Главная</Link>
          {isLoggedIn && <Link to="/create">Создать</Link>}
          {isLoggedIn && <Link to="/history">История</Link>}
          {isLoggedIn ? (
            <Button color="inherit" component={Link} onClick={logout} to="/">
              Выйти
            </Button>
          ) : (
            <Link to="/login">Войти</Link>
          )}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<PollList />} />
        <Route
          path="/login"
          element={<AuthPage onGuest={logout} onLogin={login} />}
        />
        <Route
          path="/create"
          element={isLoggedIn
            ? <CreatePollPage onSave={addCreatedPoll} />
            : <Navigate replace to="/login" />}
        />
        <Route
          path="/history"
          element={isLoggedIn
            ? <HistoryPage createdPolls={createdPolls} />
            : <Navigate replace to="/login" />}
        />
        <Route
          path="/manage/:pollId"
          element={isLoggedIn
            ? <ManagePollPage polls={createdPolls} onStatusChange={changePollStatus} />
            : <Navigate replace to="/login" />}
        />
        <Route path="/polls/:pollId" element={<PollInfoPage />} />
        <Route path="/polls/:pollId/vote" element={<PollPage />} />
        <Route path="/polls/:pollId/results" element={<ResultsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
