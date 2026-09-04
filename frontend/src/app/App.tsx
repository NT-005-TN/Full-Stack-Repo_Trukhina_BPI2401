import { useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { Button } from '@mui/material'
import { CreatedPoll, PollStatus } from '../entities/poll/types'
import AuthPage from '../pages/AuthPage'
import CreatePollPage from '../pages/CreatePollPage'
import HistoryPage from '../pages/HistoryPage'
import ManagePollPage from '../pages/ManagePollPage'
import NotFoundPage from '../pages/NotFoundPage'
import PollInfoPage from '../pages/PollInfoPage'
import PollListPage from '../pages/PollListPage'
import PollPage from '../pages/PollPage'
import ResultsPage from '../pages/ResultsPage'

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
        <Route path="/" element={<PollListPage />} />
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
        <Route path="/polls/:pollId" element={<PollInfoPage isLoggedIn={isLoggedIn} />} />
        <Route path="/polls/:pollId/vote" element={<PollPage isLoggedIn={isLoggedIn} />} />
        <Route path="/polls/:pollId/results" element={<ResultsPage isLoggedIn={isLoggedIn} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
