import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Chip } from '@mui/material'
import { poll } from './pollData'

type Status = 'Черновик' | 'Активен' | 'Завершён'

export default function ManagePollPage() {
  const [status, setStatus] = useState<Status>('Черновик')
  const [message, setMessage] = useState('')

  function publishPoll() {
    setStatus('Активен')
    setMessage('Опрос опубликован и доступен участникам.')
  }

  function finishPoll() {
    setStatus('Завершён')
    setMessage('Опрос завершён. Новые ответы больше не принимаются.')
  }

  return (
    <main className="small-page">
      <h1>Управление опросом</h1>
      {message && <Alert severity="success">{message}</Alert>}

      <section className="card manage-card">
        <div className="section-title">
          <h2>{poll.title}</h2>
          <Chip
            color={status === 'Активен' ? 'success' : 'default'}
            label={status}
          />
        </div>

        <p>{poll.description}</p>
        <p>Вопросов: {poll.questions.length}</p>
        <p>Участников: {status === 'Черновик' ? 0 : 40}</p>

        <div className="manage-actions">
          {status === 'Черновик' && (
            <Button onClick={publishPoll} variant="contained">
              Опубликовать
            </Button>
          )}
          {status === 'Активен' && (
            <Button color="error" onClick={finishPoll} variant="contained">
              Завершить опрос
            </Button>
          )}
          {status !== 'Черновик' && (
            <Button component={Link} to={`/polls/${poll.id}/results`}>
              Посмотреть результаты
            </Button>
          )}
        </div>
      </section>
    </main>
  )
}
