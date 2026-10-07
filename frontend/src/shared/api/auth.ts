// Базовый адрес локального FastAPI backend.
const API_URL = 'http://localhost:8000'

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

// Отправляет данные входа и сохраняет полученные токены.
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(await readError(response))
  saveTokens(await response.json())
}

// Регистрирует пользователя и сохраняет его первую пару токенов.
export async function register(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!response.ok) throw new Error(await readError(response))
  saveTokens(await response.json())
}

// Обменивает действующий refresh token на новую пару.
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

// Проверяет сессию и при необходимости один раз обновляет access token.
export async function checkSession() {
  const accessToken = sessionStorage.getItem('accessToken')
  if (!accessToken) return false
  let response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status === 401 && await refreshAccessToken()) {
    response = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${sessionStorage.getItem('accessToken')}` },
    })
  }
  return response.ok
}

// Сообщает backend о выходе и очищает локальную сессию.
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

// Удаляет оба токена из sessionStorage.
export function clearTokens() {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
}
