import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Chip, TextField } from '@mui/material'
import { usePolls } from '../entities/poll/usePolls'
import DataState from '../shared/ui/DataState'

export default function PollListPage() {
  const [search, setSearch] = useState('')
  const { polls, isLoading, error, retry } = usePolls()
  const visiblePolls = polls.filter((poll) =>
    poll.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <main>
      <h1>Доступные опросы</h1>
      <p>Выберите опрос, чтобы принять участие.</p>

      {isLoading && <DataState type="loading" message="Загружаем опросы…" />}
      {error && <DataState type="error" message={error} onRetry={retry} />}

      {!isLoading && !error && (
        <>
          <TextField
            className="search-field"
            fullWidth
            label="Поиск по названию"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="poll-list">
            {visiblePolls.map((poll) => (
              <article className="card" key={poll.id}>
                <h2>{poll.title}</h2>
                <p>Вопросов: {poll.questions.length}</p>
                <div className="poll-tags">
                  <Chip color="success" label={poll.status} size="small" />
                  <Chip label={poll.access} size="small" />
                </div>
                <Button component={Link} to={`/polls/${poll.id}`} variant="contained">
                  Открыть опрос
                </Button>
                {poll.id === 1 && (
                  <Button component={Link} to={`/polls/${poll.id}/results`}>
                    Результаты
                  </Button>
                )}
              </article>
            ))}
            {visiblePolls.length === 0 && (
              <DataState type="empty" message="По вашему запросу опросы не найдены." />
            )}
          </div>
        </>
      )}
    </main>
  )
}
