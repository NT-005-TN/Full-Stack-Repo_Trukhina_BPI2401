import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Alert, Button, Chip } from '@mui/material'
import { Poll, PollStatus } from './types'

type ManagePollPageProps = {
  polls: Poll[]
  onStatusChange: (pollId: number, status: PollStatus) => void
}

// Страница управления статусом одного созданного опроса.
export default function ManagePollPage({ polls, onStatusChange }: ManagePollPageProps) {
  const { pollId } = useParams()
  const [message, setMessage] = useState('')
  const selectedPoll = polls.find((poll) => poll.id === Number(pollId) && poll.isOwned)

  if (!selectedPoll) {
    return <main><h1>Опрос не найден</h1></main>
  }

  // Переводит черновик в активное состояние.
  function publishPoll() {
    if (!selectedPoll) return
    onStatusChange(selectedPoll.id, 'Активен')
    setMessage('Опрос опубликован и доступен участникам.')
  }

  // Завершает приём новых ответов.
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

        <p>Вопросов: {selectedPoll.questions.length}</p>
        <p>Участников: {selectedPoll.participantCount}</p>

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
          {selectedPoll.status !== 'Черновик' && selectedPoll.resultsAccess !== 'hidden' && (
            <Button component={Link} to={`/polls/${selectedPoll.id}/results`}>
              Посмотреть результаты
            </Button>
          )}
        </div>
        {selectedPoll.resultsAccess === 'hidden' && (
          <p className="hint">Публикация результатов отключена.</p>
        )}
      </section>
    </main>
  )
}
