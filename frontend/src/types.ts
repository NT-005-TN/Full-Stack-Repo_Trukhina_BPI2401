// Допустимые состояния опроса.
export type PollStatus = 'Черновик' | 'Активен' | 'Завершён'

export type ResultsAccess = 'after_vote' | 'after_finish' | 'hidden'

export type PollQuestion = {
  id: number
  text: string
  options: string[]
  votes: number[]
}

// Полная модель используется созданием, прохождением, историей и результатами.
export type Poll = {
  id: number
  title: string
  description: string
  access: 'Для всех' | 'После входа'
  status: PollStatus
  resultsAccess: ResultsAccess
  endDate: string
  isOwned: boolean
  participantCount: number
  questions: PollQuestion[]
}

export type CompletedPoll = {
  pollId: number
  completedAt: string
}
