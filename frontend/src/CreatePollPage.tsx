import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Button, MenuItem, TextField } from '@mui/material'
import { Poll, ResultsAccess } from './types'

// Структура одного вопроса в форме создания опроса.
type Question = {
  id: number
  text: string
  options: string[]
}

// Родитель передаёт обработчик для сохранения готовой карточки опроса.
type CreatePollPageProps = {
  onSave: (poll: Poll) => void
}

// Форма создания опроса с динамическими вопросами и вариантами ответа.
export default function CreatePollPage({ onSave }: CreatePollPageProps) {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [access, setAccess] = useState('public')
  const [resultsAccess, setResultsAccess] = useState<ResultsAccess>('after_finish')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: 1, text: '', options: ['', ''] },
  ])

  // Изменяет текст выбранного вопроса.
  function changeQuestion(questionIndex: number, text: string) {
    setQuestions(questions.map((question, index) =>
      index === questionIndex ? { ...question, text } : question,
    ))
  }

  // Изменяет один вариант ответа внутри выбранного вопроса.
  function changeOption(questionIndex: number, optionIndex: number, text: string) {
    setQuestions(questions.map((question, index) =>
      index === questionIndex
        ? {
          ...question,
          options: question.options.map((option, currentOptionIndex) =>
            currentOptionIndex === optionIndex ? text : option,
          ),
        }
        : question,
    ))
  }

  // Добавляет новый вопрос с двумя пустыми вариантами.
  function addQuestion() {
    setQuestions([
      ...questions,
      { id: Date.now(), text: '', options: ['', ''] },
    ])
  }

  // Удаляет вопрос по его позиции в массиве.
  function removeQuestion(questionIndex: number) {
    setQuestions(questions.filter((_, index) => index !== questionIndex))
  }

  // Добавляет пустой вариант ответа к выбранному вопросу.
  function addOption(questionIndex: number) {
    setQuestions(questions.map((question, index) =>
      index === questionIndex
        ? { ...question, options: [...question.options, ''] }
        : question,
    ))
  }

  // Удаляет вариант, сохраняя минимум два варианта в интерфейсе.
  function removeOption(questionIndex: number, optionIndex: number) {
    setQuestions(questions.map((question, index) =>
      index === questionIndex
        ? {
          ...question,
          options: question.options.filter((_, currentOptionIndex) =>
            currentOptionIndex !== optionIndex,
          ),
        }
        : question,
    ))
  }

  // Проверяет форму и сохраняет опрос как черновик или активный.
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
      description,
      access: access === 'public' ? 'Для всех' : 'После входа',
      status: button.value === 'publish' ? 'Активен' : 'Черновик',
      resultsAccess,
      endDate,
      isOwned: true,
      participantCount: 0,
      questions: questions.map((question) => ({
        ...question,
        votes: question.options.map(() => 0),
      })),
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
            onChange={(event) => setResultsAccess(event.target.value as ResultsAccess)}
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
