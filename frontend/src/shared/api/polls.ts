import { Poll } from '../../entities/poll/types'
import { apiError, apiRequest } from './client'

export async function getPolls(): Promise<Poll[]> {
  const response = await apiRequest('/polls')
  if (!response.ok) throw new Error(await apiError(response))
  return response.json()
}

async function getPollCollection(path: string): Promise<Poll[]> {
  const response = await apiRequest(path)
  if (!response.ok) throw new Error(await apiError(response))
  return response.json()
}

export const getMyPolls = () => getPollCollection('/polls/mine')
export const getParticipatedPolls = () => getPollCollection('/polls/participated')

export async function getPoll(id: number): Promise<Poll> {
  const response = await apiRequest(`/polls/${id}`)
  if (!response.ok) throw new Error(await apiError(response))
  return response.json()
}

export async function createPoll(data: object): Promise<Poll> {
  const response = await apiRequest('/polls', { method: 'POST', body: JSON.stringify(data) })
  if (!response.ok) throw new Error(await apiError(response))
  return response.json()
}

export async function updatePoll(id: number, data: object): Promise<Poll> {
  const response = await apiRequest(`/polls/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
  if (!response.ok) throw new Error(await apiError(response))
  return response.json()
}

export async function deletePoll(id: number) {
  const response = await apiRequest(`/polls/${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await apiError(response))
}

export async function submitPoll(id: number, answers: object) {
  const response = await apiRequest(`/polls/${id}/submissions`, {
    method: 'POST', body: JSON.stringify(answers),
  })
  if (!response.ok) throw new Error(await apiError(response))
  return response.json()
}

export async function getResults(id: number) {
  const response = await apiRequest(`/polls/${id}/results`)
  if (!response.ok) throw new Error(await apiError(response))
  return response.json()
}
