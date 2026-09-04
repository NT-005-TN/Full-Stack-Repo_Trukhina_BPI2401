import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Tab, Tabs, TextField } from '@mui/material'

type AuthPageProps = {
  onLogin: () => void
  onGuest: () => void
}

export default function AuthPage({ onLogin, onGuest }: AuthPageProps) {
  const [tab, setTab] = useState(0)
  const [password, setPassword] = useState('')
  const [repeatedPassword, setRepeatedPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function submitForm(event: FormEvent) {
    event.preventDefault()

    if (password.length < 6) {
      setError('Пароль должен содержать не менее 6 символов.')
      return
    }

    if (tab === 1 && password !== repeatedPassword) {
      setError('Введённые пароли не совпадают.')
      return
    }

    setError('')
    onLogin()
    navigate('/')
  }

  function changeTab(newTab: number) {
    setTab(newTab)
    setError('')
  }

  return (
    <main className="small-page">
      <h1>{tab === 0 ? 'Вход' : 'Регистрация'}</h1>

      <Tabs value={tab} onChange={(_, newTab) => changeTab(newTab)}>
        <Tab label="Вход" />
        <Tab label="Регистрация" />
      </Tabs>

      {error && <Alert severity="error">{error}</Alert>}

      <form className="card form auth-form" onSubmit={submitForm}>
        {tab === 1 && <TextField required label="Имя" />}
        <TextField required label="Электронная почта" type="email" />
        <TextField
          required
          label="Пароль"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {tab === 1 && (
          <TextField
            required
            label="Повторите пароль"
            type="password"
            value={repeatedPassword}
            onChange={(event) => setRepeatedPassword(event.target.value)}
          />
        )}

        <Button type="submit" variant="contained">
          {tab === 0 ? 'Войти' : 'Зарегистрироваться'}
        </Button>

        <Button component={Link} onClick={onGuest} to="/" variant="outlined">
          Продолжить как гость
        </Button>
        <p className="hint">
          Гость может проходить публичные опросы, но не может создавать их
          и сохранять историю.
        </p>
      </form>
    </main>
  )
}
