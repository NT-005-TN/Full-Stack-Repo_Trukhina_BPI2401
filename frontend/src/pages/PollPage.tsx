import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  LinearProgress,
  Radio,
  RadioGroup,
} from '@mui/material'
import { usePoll } from '../entities/poll/usePoll'
import { submitPoll } from '../shared/api/polls'
import DataState from '../shared/ui/DataState'
import PageMessage from '../shared/ui/PageMessage'

// Восстанавливает незавершённые ответы из текущей вкладки.
function loadAnswers(key: string) {
  const savedAnswers = sessionStorage.getItem(key)

  try {
    return savedAnswers ? JSON.parse(savedAnswers) : []
  } catch {
    return []
  }
}

type PollPageProps = {
  isLoggedIn: boolean
}

// Управляет прохождением опроса и отправляет ответы на backend.
export default function PollPage({ isLoggedIn }: PollPageProps) {
  const { pollId } = useParams()
  const numericPollId = Number(pollId)
  const { poll, isLoading, error: loadError } = usePoll(numericPollId)
  const answersKey = `pollAnswers-${numericPollId}`
  const questionKey = `pollQuestion-${numericPollId}`
  const [questionIndex, setQuestionIndex] = useState(
    Number(sessionStorage.getItem(questionKey) || 0),
  )
  const [answers, setAnswers] = useState<number[]>(() => loadAnswers(answersKey))
  const [isReview, setIsReview] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    sessionStorage.setItem(answersKey, JSON.stringify(answers))
    sessionStorage.setItem(questionKey, String(questionIndex))
  }, [answers, answersKey, questionIndex, questionKey])

  if (isLoading) return <main><DataState type="loading" message="Загружаем вопросы…" /></main>
  if (loadError || !poll) return <PageMessage title={loadError || "Опрос не найден"} linkText="Вернуться к опросам" linkTo="/" />

  if (poll.access === 'registered' && !isLoggedIn) {
    return <Navigate replace to="/login" />
  }

  const question = poll.questions[questionIndex]
  const questionCount = poll.questions.length
  const currentAnswer = answers[questionIndex] || 0
  const answeredCount = answers.filter(Boolean).length
  const allQuestionsAnswered = answeredCount === poll.questions.length

  function selectAnswer(answer: number) {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answer
    setAnswers(newAnswers)
  }

  async function sendAnswers() {
    if (!poll) return
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await submitPoll(poll.id, {
        answers: poll.questions.map((item, index) => ({
          question_id: item.id, option_id: answers[index],
        })),
      })
      sessionStorage.removeItem(answersKey)
      sessionStorage.removeItem(questionKey)
      setIsConfirmOpen(false)
      setIsFinished(true)
    } catch (requestError) {
      setSubmitError(requestError instanceof Error ? requestError.message : 'Не удалось отправить ответы.')
      setIsConfirmOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  function goNext() {
    if (questionIndex < questionCount - 1) {
      setQuestionIndex(questionIndex + 1)
    } else {
      setIsReview(true)
    }
  }

  if (isFinished) {
    return (
      <main className="small-page">
        <Alert severity="success">Ответы успешно отправлены.</Alert>
        <h1>Спасибо за участие!</h1>
        <p>Опрос пройден анонимно.</p>
        <Button component={Link} to="/" variant="contained">
          Вернуться к опросам
        </Button>
        <Button component={Link} to={`/polls/${poll.id}/results`}>
          Посмотреть результаты
        </Button>
      </main>
    )
  }

  if (isReview) {
    return (
      <main className="small-page">
        <h1>Проверьте ответы</h1>
        <Alert severity={allQuestionsAnswered ? 'success' : 'warning'}>
          Заполнено вопросов: {answeredCount} из {poll.questions.length}.
          {!allQuestionsAnswered && ' Ответьте на пропущенные вопросы.'}
        </Alert>
        <div className="card review-list">
          {poll.questions.map((item, index) => (
            <div key={item.id}>
              <strong>{index + 1}. {item.text}</strong>
              <p>{item.options.find((option) => option.id === answers[index])?.text || 'Нет ответа'}</p>
              <Button
                onClick={() => {
                  setQuestionIndex(index)
                  setIsReview(false)
                }}
              >
                Изменить
              </Button>
            </div>
          ))}
        </div>
        <div className="actions">
          {submitError && <Alert severity="error">{submitError}</Alert>}
          <Button onClick={() => setIsReview(false)}>Назад</Button>
          <Button
            disabled={!allQuestionsAnswered}
            onClick={() => setIsConfirmOpen(true)}
            variant="contained"
          >
            Отправить ответы
          </Button>
        </div>

        <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
          <DialogTitle>Отправить ответы?</DialogTitle>
          <DialogContent>
            После отправки изменить ответы будет нельзя.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsConfirmOpen(false)}>Отмена</Button>
            <Button
              disabled={isSubmitting}
              onClick={sendAnswers}
              variant="contained"
            >
              Подтвердить отправку
            </Button>
          </DialogActions>
        </Dialog>
      </main>
    )
  }

  return (
    <main className="small-page">
      <h1>{poll.title}</h1>
      <p>{poll.description}</p>
      <p>Вопрос {questionIndex + 1} из {poll.questions.length}</p>
      <LinearProgress
        variant="determinate"
        value={((questionIndex + 1) / poll.questions.length) * 100}
      />

      <section className="card question-card">
        <h2>{question.text}</h2>
        <RadioGroup
          value={currentAnswer}
          onChange={(event) => selectAnswer(Number(event.target.value))}
        >
          {question.options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio />}
              label={option.text}
            />
          ))}
        </RadioGroup>
      </section>

      <div className="actions">
        <Button
          disabled={questionIndex === 0}
          onClick={() => setQuestionIndex(questionIndex - 1)}
        >
          Назад
        </Button>
        <Button disabled={!currentAnswer} onClick={goNext} variant="contained">
          {questionIndex === poll.questions.length - 1 ? 'Проверить' : 'Далее'}
        </Button>
      </div>
    </main>
  )
}
