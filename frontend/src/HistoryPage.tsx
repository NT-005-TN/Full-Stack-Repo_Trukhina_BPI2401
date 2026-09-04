import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Chip, Tab, Tabs } from '@mui/material'

const completedPolls = [
  { id: 1, title: 'Студенческие мероприятия', date: '4 сентября 2026' },
  { id: 2, title: 'Выбор формата занятий', date: '1 сентября 2026' },
]

const createdPolls = [
  { id: 1, title: 'Студенческие мероприятия', status: 'Черновик' },
]

export default function HistoryPage() {
  const [tab, setTab] = useState(0)

  return (
    <main>
      <h1>История опросов</h1>

      <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)}>
        <Tab label="Мои участия" />
        <Tab label="Созданные" />
      </Tabs>

      <div className="history-list">
        {tab === 0 && completedPolls.map((poll) => (
          <article className="card" key={poll.id}>
            <h2>{poll.title}</h2>
            <p>Пройден: {poll.date}</p>
            <Chip color="success" label="Завершён" />
          </article>
        ))}

        {tab === 1 && createdPolls.map((poll) => (
          <article className="card" key={poll.id}>
            <h2>{poll.title}</h2>
            <p>Вы создатель этого опроса.</p>
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
