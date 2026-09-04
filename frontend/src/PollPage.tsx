import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { poll } from './pollData'

export default function PollPage() {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isReview, setIsReview] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const question = poll.questions[questionIndex]
  const currentAnswer = answers[questionIndex] || ''
  const answeredCount = answers.filter(Boolean).length
  const allQuestionsAnswered = answeredCount === poll.questions.length

  function selectAnswer(answer: string) {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answer
    setAnswers(newAnswers)
  }

  function goNext() {
    if (questionIndex < poll.questions.length - 1) {
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
