import PageMessage from '../shared/ui/PageMessage'

// Запасная страница для неизвестного URL.
export default function NotFoundPage() {
  return <PageMessage title="Страница не найдена" linkText="Вернуться к опросам" linkTo="/" />
}
