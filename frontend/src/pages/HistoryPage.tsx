import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Chip, Tab, Tabs } from '@mui/material'
import { Poll, statusLabels } from '../entities/poll/types'
import { getMyPolls, getParticipatedPolls } from '../shared/api/polls'
import DataState from '../shared/ui/DataState'

type HistoryPageProps = { currentUserId: number }

export default function HistoryPage({ currentUserId: _currentUserId }: HistoryPageProps) {
  const [tab, setTab] = useState(0)
  const [created, setCreated] = useState<Poll[]>([])
  const [participated, setParticipated] = useState<Poll[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMyPolls(), getParticipatedPolls()])
      .then(([myPolls, completed]) => { setCreated(myPolls); setParticipated(completed) })
      .catch((reason) => setError(reason.message))
      .finally(() => setLoading(false))
  }, [])

  const polls = tab === 0 ? participated : created
  return <main>
    <h1>История опросов</h1>
    <Tabs value={tab} onChange={(_, value) => setTab(value)}>
      <Tab label="Мои участия" /><Tab label="Созданные" />
    </Tabs>
    {loading && <DataState type="loading" message="Загружаем историю…" />}
    {error && <DataState type="error" message={error} />}
    {!loading && !error && polls.length === 0 && <DataState type="empty" message="Здесь пока ничего нет." />}
    <div className="history-list">
      {polls.map((poll) => <article className="card" key={poll.id}>
        <h2>{poll.title}</h2><p>Вопросов: {poll.questions.length}</p>
        <Chip color={poll.status === 'active' ? 'success' : 'default'} label={statusLabels[poll.status]} />
        {tab === 1 && <Button component={Link} to={`/manage/${poll.id}`}>Управлять</Button>}
        {tab === 0 && poll.results_access !== 'hidden' && <Button component={Link} to={`/polls/${poll.id}/results`}>Результаты</Button>}
      </article>)}
    </div>
  </main>
}
