import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Chip } from '@mui/material'
import { polls as demoPolls } from './pollData'
import { CreatedPoll, PollStatus } from './types'

type ManagePollPageProps = {
  polls: CreatedPoll[]
  onStatusChange: (pollId: number, status: PollStatus) => void
}

export default function ManagePollPage({ polls, onStatusChange }: ManagePollPageProps) {
  const { pollId } = useParams()
  const [message, setMessage] = useState('')
  const selectedPoll = polls.find((poll) => poll.id === Number(pollId))
  const hasResults = demoPolls.some((poll) => poll.id === selectedPoll?.id)

  if (!selectedPoll) {
    return <main><h1>Опрос не найден</h1></main>
  }

  function publishPoll() {
    if (!selectedPoll) return
    onStatusChange(selectedPoll.id, 'Активен')
    setMessage('Опрос опубликован и доступен участникам.')
  }

  function finishPoll() {
    if (!selectedPoll) return
    onStatusChange(selectedPoll.id, 'Завершён')
    setMessage('Опрос завершён. Новые ответы больше не принимаются.')
  }

  return (
    <main className="small-page">
      <h1>Управление опросом</h1>
      {message && <Alert severity="success">{message}</Alert>}

      <section className="card manage-card">
        <div className="section-title">
          <h2>{selectedPoll.title}</h2>
          <Chip
            color={selectedPoll.status === 'Активен' ? 'success' : 'default'}
            label={selectedPoll.status}
          />
        </div>

        <p>Вопросов: {selectedPoll.questionCount}</p>
        <p>Участников: {selectedPoll.status === 'Черновик' ? 0 : 40}</p>

        <div className="manage-actions">
          {selectedPoll.status === 'Черновик' && (
            <Button onClick={publishPoll} variant="contained">
              Опубликовать
            </Button>
          )}
          {selectedPoll.status === 'Активен' && (
            <Button color="error" onClick={finishPoll} variant="contained">
              Завершить опрос
            </Button>
          )}
          {selectedPoll.status !== 'Черновик' && hasResults && (
            <Button component={Link} to={`/polls/${selectedPoll.id}/results`}>
              Посмотреть результаты
            </Button>
          )}
        </div>
        {selectedPoll.status !== 'Черновик' && !hasResults && (
          <p className="hint">Результаты появятся после получения ответов.</p>
        )}
      </section>
    </main>
  )
}
