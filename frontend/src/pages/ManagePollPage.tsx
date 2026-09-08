import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Chip, TextField } from '@mui/material'
import { statusLabels } from '../entities/poll/types'
import { usePoll } from '../entities/poll/usePoll'
import { deletePoll, updatePoll } from '../shared/api/polls'
import DataState from '../shared/ui/DataState'
import PageMessage from '../shared/ui/PageMessage'

export default function ManagePollPage() {
  const id = Number(useParams().pollId)
  const navigate = useNavigate()
  const { poll, isLoading, error: loadError } = usePoll(id)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (isLoading) return <main><DataState type="loading" message="Загружаем опрос…" /></main>
  if (loadError || !poll) return <PageMessage title={loadError || 'Опрос не найден'} linkText="К истории" linkTo="/history" />

  async function save(changes: object, success: string) {
    setSaving(true); setError('')
    try { await updatePoll(id, changes); setMessage(success); window.location.reload() }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось изменить опрос.') }
    finally { setSaving(false) }
  }

  async function remove() {
    if (!window.confirm('Удалить опрос и все связанные ответы?')) return
    setSaving(true)
    try { await deletePoll(id); navigate('/history') }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось удалить опрос.'); setSaving(false) }
  }

  return <main className="small-page">
    <h1>Управление опросом</h1>
    {message && <Alert severity="success">{message}</Alert>}
    {error && <Alert severity="error">{error}</Alert>}
    <section className="card manage-card">
      <div className="section-title"><h2>{poll.title}</h2><Chip label={statusLabels[poll.status]} /></div>
      <p>Вопросов: {poll.questions.length}</p>
      <TextField fullWidth label="Новое название" value={title} onChange={(event) => setTitle(event.target.value)} />
      <div className="manage-actions">
        <Button disabled={saving || !title.trim()} onClick={() => save({ title }, 'Название обновлено.')}>Сохранить название</Button>
        {poll.status === 'draft' && <Button disabled={saving} variant="contained" onClick={() => save({ status: 'active' }, 'Опрос опубликован.')}>Опубликовать</Button>}
        {poll.status === 'active' && <Button disabled={saving} color="warning" onClick={() => save({ status: 'finished' }, 'Опрос завершён.')}>Завершить</Button>}
        <Button disabled={saving} color="error" onClick={remove}>Удалить</Button>
      </div>
    </section>
  </main>
}
