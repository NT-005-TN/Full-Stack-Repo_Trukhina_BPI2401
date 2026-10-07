// Допустимые состояния созданного опроса.
export type PollStatus = 'Черновик' | 'Активен' | 'Завершён'

// Краткие данные опроса, которые показываются в истории и управлении.
export type CreatedPoll = {
  id: number
  title: string
  questionCount: number
  status: PollStatus
}
