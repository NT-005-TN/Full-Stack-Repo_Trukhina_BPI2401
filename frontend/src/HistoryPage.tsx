import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Chip, Tab, Tabs } from '@mui/material'
import { CompletedPoll, Poll } from './types'

type HistoryPageProps = {
  polls: Poll[]
  completedPolls: CompletedPoll[]
}

// Страница переключается между участиями пользователя и созданными опросами.
export default function HistoryPage({ polls, completedPolls }: HistoryPageProps) {
  const [tab, setTab] = useState(0)
  const createdPolls = polls.filter((poll) => poll.isOwned)

  return (
    <main>
      <h1>История опросов</h1>

      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
        <Tab label="Мои участия" />
        <Tab label="Созданные" />
      </Tabs>

      <div className="history-list">
        {tab === 0 && completedPolls.map((completed) => {
          const poll = polls.find((item) => item.id === completed.pollId)
          if (!poll) return null
          return (
          <article className="card" key={poll.id}>
            <h2>{poll.title}</h2>
            <p>Пройден: {completed.completedAt}</p>
            <Chip color="success" label="Завершён" />
          </article>
          )
        })}
        {tab === 0 && completedPolls.length === 0 && <p>Вы ещё не проходили опросы.</p>}

        {tab === 1 && createdPolls.map((poll) => (
          <article className="card" key={poll.id}>
            <h2>{poll.title}</h2>
            <p>Вопросов: {poll.questions.length}</p>
            <Chip
              color={poll.status === 'Активен' ? 'success' : 'default'}
              label={poll.status}
            />
            <Button component={Link} to={`/manage/${poll.id}`}>
              Управлять
            </Button>
          </article>
        ))}
      </div>
    </main>
  )
}
