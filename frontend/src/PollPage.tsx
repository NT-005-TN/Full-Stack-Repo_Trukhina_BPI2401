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
import { Poll } from './types'

// Безопасно восстанавливает сохранённые ответы из sessionStorage.
function loadAnswers(key: string) {
  const savedAnswers = sessionStorage.getItem(key)

  try {
    return savedAnswers ? JSON.parse(savedAnswers) : []
  } catch {
    return []
  }
}

type PollPageProps = {
  polls: Poll[]
  isLoggedIn: boolean
  onSubmit: (pollId: number, answers: string[]) => void
}

// Страница прохождения опроса, проверки и отправки ответов.
export default function PollPage({ polls, isLoggedIn, onSubmit }: PollPageProps) {
  const { pollId } = useParams()
  const selectedPoll = polls.find((item) => item.id === Number(pollId))
  const poll = selectedPoll || polls[0]
  const answersKey = `pollAnswers-${poll.id}`
  const questionKey = `pollQuestion-${poll.id}`
  const savedQuestionIndex = Number(sessionStorage.getItem(questionKey) || 0)
  const [questionIndex, setQuestionIndex] = useState(
    savedQuestionIndex >= 0 && savedQuestionIndex < poll.questions.length
      ? savedQuestionIndex
      : 0,
  )
  const [answers, setAnswers] = useState<string[]>(() => loadAnswers(answersKey))
  const [isReview, setIsReview] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Производные значения пересчитываются при каждом изменении состояния.
  const question = poll.questions[questionIndex]
  const currentAnswer = answers[questionIndex] || ''
  const answeredCount = answers.filter(Boolean).length
  const allQuestionsAnswered = answeredCount === poll.questions.length

  // Сохраняет прогресс, чтобы он не пропал при обновлении страницы.
  useEffect(() => {
    sessionStorage.setItem(answersKey, JSON.stringify(answers))
    sessionStorage.setItem(questionKey, String(questionIndex))
  }, [answers, answersKey, questionIndex, questionKey])

  if (!selectedPoll) {
    return <main><h1>Опрос не найден</h1></main>
  }

  if (poll.access === 'После входа' && !isLoggedIn) {
    return <Navigate replace to="/login" />
  }

  if (poll.status !== 'Активен') {
    return <main><h1>Опрос не принимает ответы</h1></main>
  }

  // Записывает выбранный вариант для текущего вопроса.
  function selectAnswer(answer: string) {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answer
    setAnswers(newAnswers)
  }

  // Открывает следующий вопрос или экран проверки ответов.
  function goNext() {
    if (questionIndex < poll.questions.length - 1) {
      setQuestionIndex(questionIndex + 1)
    } else {
      setIsReview(true)
    }
  }

  // После подтверждения показывается финальное состояние опроса.
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

  // Перед отправкой пользователь видит все выбранные ответы.
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
              <p>{answers[index]}</p>
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
              onClick={() => {
                onSubmit(poll.id, answers)
                sessionStorage.removeItem(answersKey)
                sessionStorage.removeItem(questionKey)
                setIsConfirmOpen(false)
                setIsFinished(true)
              }}
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
          onChange={(event) => selectAnswer(event.target.value)}
        >
          {question.options.map((option) => (
            <FormControlLabel
              key={option}
              value={option}
              control={<Radio />}
              label={option}
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
