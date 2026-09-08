import { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { Button } from '@mui/material'
import AuthPage from '../pages/AuthPage'
import CreatePollPage from '../pages/CreatePollPage'
import HistoryPage from '../pages/HistoryPage'
import ManagePollPage from '../pages/ManagePollPage'
import NotFoundPage from '../pages/NotFoundPage'
import PollInfoPage from '../pages/PollInfoPage'
import PollListPage from '../pages/PollListPage'
import PollPage from '../pages/PollPage'
import ResultsPage from '../pages/ResultsPage'
import * as authApi from '../shared/api/auth'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [currentUser, setCurrentUser] = useState<authApi.User | null>(null)

  useEffect(() => {
    authApi.getCurrentUser().then((user) => {
      setCurrentUser(user)
      setIsLoggedIn(Boolean(user))
      setIsCheckingSession(false)
    })

    function handleSessionEnd() {
      setCurrentUser(null)
      setIsLoggedIn(false)
    }

    window.addEventListener('auth-session-ended', handleSessionEnd)
    return () => window.removeEventListener('auth-session-ended', handleSessionEnd)
  }, [])

  async function login(email: string, password: string, isRegistration: boolean) {
    if (isRegistration) await authApi.register(email, password)
    else await authApi.login(email, password)
    setCurrentUser(await authApi.getCurrentUser())
    setIsLoggedIn(true)
  }

  async function logout() {
    await authApi.logout()
    setCurrentUser(null)
    setIsLoggedIn(false)
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

      {!isCheckingSession && <Routes>
        <Route path="/" element={<PollListPage />} />
        <Route
          path="/login"
          element={<AuthPage onGuest={logout} onLogin={login} />}
        />
        <Route
          path="/create"
          element={isLoggedIn
            ? <CreatePollPage />
            : <Navigate replace to="/login" />}
        />
        <Route
          path="/history"
          element={isLoggedIn
            ? <HistoryPage currentUserId={currentUser?.id || 0} />
            : <Navigate replace to="/login" />}
        />
        <Route
          path="/manage/:pollId"
          element={isLoggedIn
            ? <ManagePollPage />
            : <Navigate replace to="/login" />}
        />
        <Route path="/polls/:pollId" element={<PollInfoPage isLoggedIn={isLoggedIn} />} />
        <Route path="/polls/:pollId/vote" element={<PollPage isLoggedIn={isLoggedIn} />} />
        <Route path="/polls/:pollId/results" element={<ResultsPage isLoggedIn={isLoggedIn} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>}
    </>
  )
}
