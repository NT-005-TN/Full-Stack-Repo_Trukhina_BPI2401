// Адрес backend можно переопределить через переменную окружения Vite.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export type User = { id: number; email: string }

export type TokenPair = {
  access_token: string
  refresh_token: string
  token_type: string
}

// Сохраняет пару токенов в пределах текущей вкладки.
function saveTokens(tokens: TokenPair) {
  sessionStorage.setItem('accessToken', tokens.access_token)
  sessionStorage.setItem('refreshToken', tokens.refresh_token)
}

// Извлекает понятное сообщение из ошибочного ответа API.
async function readError(response: Response) {
  const body = await response.json().catch(() => null)
  return body?.detail || 'Не удалось выполнить запрос.'
}

// Выполняет вход и сохраняет полученную пару токенов.
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(await readError(response))
  saveTokens(await response.json())
}

// Регистрирует пользователя и сохраняет его первую сессию.
export async function register(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(await readError(response))
  saveTokens(await response.json())
}

// Обменивает refresh token на новую пару токенов.
export async function refreshAccessToken() {
  const refreshToken = sessionStorage.getItem('refreshToken')
  if (!refreshToken) return false
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })
  if (!response.ok) {
    clearTokens()
    return false
  }
  saveTokens(await response.json())
  return true
}

// Возвращает профиль текущего пользователя или null для гостя.
export async function getCurrentUser(): Promise<User | null> {
  const accessToken = sessionStorage.getItem('accessToken')
  if (!accessToken) return null
  let response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status === 401 && await refreshAccessToken()) {
    response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
    })
  }
  return response.ok ? response.json() : null
}

// Отзывает refresh token и завершает локальную сессию.
export async function logout() {
  const refreshToken = sessionStorage.getItem('refreshToken')
  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    }).catch(() => undefined)
  }
  clearTokens()
}

// Удаляет токены и уведомляет приложение об окончании сессии.
export function clearTokens() {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  window.dispatchEvent(new Event('auth-session-ended'))
}
