export type PollStatus = 'Черновик' | 'Активен' | 'Завершён'

export type PollQuestion = {
  id: number
  text: string
  options: string[]
}

export type Poll = {
  id: number
  title: string
  description: string
  access: 'Для всех' | 'После входа'
  status: 'Активен'
  questions: PollQuestion[]
}

export type CreatedPoll = {
  id: number
  title: string
  questionCount: number
  status: PollStatus
}
