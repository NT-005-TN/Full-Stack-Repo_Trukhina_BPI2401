import { API_URL, clearTokens, refreshAccessToken } from './auth'

// Выполняет авторизованный запрос и один раз повторяет его после обновления токена.
export async function apiRequest(path: string, options: RequestInit = {}) {
  const send = () => fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(sessionStorage.getItem('accessToken')
        ? { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` }
        : {}),
    },
  })

  let response = await send()
  if (response.status === 401 && await refreshAccessToken()) response = await send()
  if (response.status === 401) clearTokens()
  return response
}

// Преобразует ответ FastAPI в короткое сообщение для интерфейса.
export async function apiError(response: Response) {
  const body = await response.json().catch(() => null)
  if (Array.isArray(body?.detail)) return body.detail[0]?.msg || 'Проверьте данные формы.'
  return body?.detail || 'Не удалось выполнить запрос.'
}
