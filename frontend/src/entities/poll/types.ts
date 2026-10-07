// Допустимые состояния созданного опроса.
export type PollStatus = 'Черновик' | 'Активен' | 'Завершён'

// Структура вопроса и его вариантов ответа.
export type PollQuestion = {
  id: number
  text: string
  options: string[]
}

// Полная структура опроса для отображения и прохождения.
export type Poll = {
  id: number
  title: string
  description: string
  access: 'Для всех' | 'После входа'
  status: 'Активен'
  questions: PollQuestion[]
}

// Краткое представление опроса в истории пользователя.
export type CreatedPoll = {
  id: number
  title: string
  questionCount: number
  status: PollStatus
}
