import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, MenuItem, TextField } from '@mui/material'
import { CreatedPoll } from './types'

type Question = {
  id: number
  text: string
  options: string[]
}

type CreatePollPageProps = {
  onSave: (poll: CreatedPoll) => void
}

export default function CreatePollPage({ onSave }: CreatePollPageProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [access, setAccess] = useState('public')
  const [resultsAccess, setResultsAccess] = useState('after_finish')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: '', options: ['', ''] },
  ])

  function changeQuestion(questionIndex: number, text: string) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].text = text
    setQuestions(newQuestions)
  }

  function changeOption(questionIndex: number, optionIndex: number, text: string) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options[optionIndex] = text
    setQuestions(newQuestions)
  }

  function addQuestion() {
    setQuestions([
      ...questions,
      { id: Date.now(), text: '', options: ['', ''] },
    ])
  }

  function removeQuestion(questionIndex: number) {
    setQuestions(questions.filter((_, index) => index !== questionIndex))
  }

  function addOption(questionIndex: number) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options.push('')
    setQuestions(newQuestions)
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    const newQuestions = [...questions]
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter(
      (_, index) => index !== optionIndex,
    )
    setQuestions(newQuestions)
  }

  function savePoll(event: FormEvent) {
    event.preventDefault()
    const submitEvent = event.nativeEvent as SubmitEvent
    const button = submitEvent.submitter as HTMLButtonElement
    const hasEmptyQuestion = questions.some((question) =>
      !question.text.trim() || question.options.some((option) => !option.trim()),
    )
    const today = new Date().toISOString().slice(0, 10)

    if (!title.trim() || hasEmptyQuestion) {
      setError('Заполните название, все вопросы и варианты ответов.')
      return
    }

    if (endDate <= today) {
      setError('Дата окончания должна быть позже сегодняшней.')
      return
    }

    setError('')

    onSave({
      id: Date.now(),
      title,
      questionCount: questions.length,
      status: button.value === 'publish' ? 'Активен' : 'Черновик',
    })
    navigate('/history')
  }

  return (
    <main>
      <h1>Создание опроса</h1>
      {error && <Alert severity="error">{error}</Alert>}

      <form className="create-form" onSubmit={savePoll}>
        <section className="card form">
          <TextField
            required
            label="Название опроса"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <TextField
            label="Описание"
            multiline
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <TextField
            label="Кто может участвовать"
            select
            value={access}
            onChange={(event) => setAccess(event.target.value)}
          >
            <MenuItem value="public">Все по ссылке</MenuItem>
            <MenuItem value="registered">Только зарегистрированные</MenuItem>
          </TextField>
          <TextField
            required
            label="Дата окончания"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <TextField
            label="Когда показывать результаты"
            select
            value={resultsAccess}
            onChange={(event) => setResultsAccess(event.target.value)}
          >
            <MenuItem value="after_vote">Сразу после ответа</MenuItem>
            <MenuItem value="after_finish">После завершения опроса</MenuItem>
            <MenuItem value="hidden">Не публиковать</MenuItem>
          </TextField>
        </section>

        {questions.map((question, questionIndex) => (
          <section className="card form" key={question.id}>
            <div className="section-title">
              <h2>Вопрос {questionIndex + 1}</h2>
              {questions.length > 1 && (
                <Button color="error" onClick={() => removeQuestion(questionIndex)}>
                  Удалить вопрос
                </Button>
              )}
            </div>

            <TextField
              required
              label="Текст вопроса"
              value={question.text}
              onChange={(event) => changeQuestion(questionIndex, event.target.value)}
            />

            {question.options.map((option, optionIndex) => (
              <div className="option-row" key={optionIndex}>
                <TextField
                  required
                  fullWidth
                  label={`Вариант ${optionIndex + 1}`}
                  value={option}
                  onChange={(event) => changeOption(
                    questionIndex,
                    optionIndex,
                    event.target.value,
                  )}
                />
                {question.options.length > 2 && (
                  <Button color="error" onClick={() => removeOption(questionIndex, optionIndex)}>
                    Удалить
                  </Button>
                )}
              </div>
            ))}

            <Button onClick={() => addOption(questionIndex)}>
              Добавить вариант
            </Button>
          </section>
        ))}

        <div className="actions">
          <Button onClick={addQuestion} variant="outlined">
            Добавить вопрос
          </Button>
          <Button name="action" type="submit" value="draft">
            Сохранить черновик
          </Button>
          <Button name="action" type="submit" value="publish" variant="contained">
            Опубликовать
          </Button>
        </div>
      </form>
    </main>
  )
}
