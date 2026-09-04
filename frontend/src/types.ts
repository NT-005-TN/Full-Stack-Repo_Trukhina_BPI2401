export type PollStatus = 'Черновик' | 'Активен' | 'Завершён'

export type CreatedPoll = {
  id: number
  title: string
  questionCount: number
  status: PollStatus
}
