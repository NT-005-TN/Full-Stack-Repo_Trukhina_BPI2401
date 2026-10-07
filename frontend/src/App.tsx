import { Link, Route, Routes } from 'react-router-dom'
import { Button, TextField } from '@mui/material'

// Первые демонстрационные данные до появления backend.
const polls = [
  { id: 1, title: 'Студенческие мероприятия', questions: 3 },
  { id: 2, title: 'Выбор формата занятий', questions: 4 },
]

// Начальная главная страница со списком опросов.
function PollList() {
  return (
    <main>
      <h1>Доступные опросы</h1>
      <p>Выберите опрос, чтобы принять участие.</p>

      <div className="poll-list">
        {polls.map((poll) => (
          <article className="card" key={poll.id}>
            <h2>{poll.title}</h2>
            <p>Вопросов: {poll.questions}</p>
            <Button variant="contained">Пройти опрос</Button>
          </article>
        ))}
      </div>
    </main>
  )
}

// Первый макет формы входа и гостевого режима.
function Login() {
  return (
    <main className="small-page">
      <h1>Вход</h1>
      <form className="card form">
        <TextField label="Электронная почта" type="email" />
        <TextField label="Пароль" type="password" />
        <Button type="submit" variant="contained">Войти</Button>
        <Button type="button" variant="outlined">Продолжить как гость</Button>
      </form>
    </main>
  )
}

// Запасная страница для неизвестного адреса.
function NotFound() {
  return (
    <main>
      <h1>Страница не найдена</h1>
      <Link to="/">Вернуться к опросам</Link>
    </main>
  )
}

// Корневой компонент объединяет меню и первые клиентские маршруты.
export default function App() {
  return (
    <>
      <header>
        <Link className="logo" to="/">Опросы</Link>
        <nav>
          <Link to="/">Главная</Link>
          <Link to="/login">Войти</Link>
        </nav>
      </header>

      {/* URL определяет, какой экран показывается без перезагрузки страницы. */}
      <Routes>
        <Route path="/" element={<PollList />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}
