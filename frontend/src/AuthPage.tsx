import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Tab, Tabs, TextField } from '@mui/material'

export default function AuthPage() {
  const [tab, setTab] = useState(0)
  const [message, setMessage] = useState('')

  function submitForm(event: FormEvent) {
    event.preventDefault()
    setMessage(tab === 0 ? 'Вход выполнен.' : 'Регистрация выполнена.')
  }

  function changeTab(newTab: number) {
    setTab(newTab)
    setMessage('')
  }

  return (
    <main className="small-page">
      <h1>{tab === 0 ? 'Вход' : 'Регистрация'}</h1>

      <Tabs value={tab} onChange={(_, newTab) => changeTab(newTab)}>
        <Tab label="Вход" />
        <Tab label="Регистрация" />
      </Tabs>

      {message && <Alert severity="success">{message}</Alert>}

      <form className="card form auth-form" onSubmit={submitForm}>
        {tab === 1 && <TextField required label="Имя" />}
        <TextField required label="Электронная почта" type="email" />
        <TextField required label="Пароль" type="password" />
        {tab === 1 && (
          <TextField required label="Повторите пароль" type="password" />
        )}

        <Button type="submit" variant="contained">
          {tab === 0 ? 'Войти' : 'Зарегистрироваться'}
        </Button>

        <Button component={Link} to="/" variant="outlined">
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
