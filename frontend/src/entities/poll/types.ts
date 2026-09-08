export type PollStatus = 'draft' | 'active' | 'finished'

export type PollOption = { id: number; text: string }

export type PollQuestion = {
  id: number
  text: string
  options: PollOption[]
}

export type Poll = {
  id: number
  title: string
  description: string
  access: 'public' | 'registered'
  status: PollStatus
  results_access: 'after_vote' | 'after_finish' | 'hidden'
  end_date: string
  owner_id: number
  questions: PollQuestion[]
}

export type CreatedPoll = {
  id: number
  title: string
  questionCount: number
  status: PollStatus
}

export const statusLabels: Record<PollStatus, string> = {
  draft: 'Черновик', active: 'Активен', finished: 'Завершён',
}
