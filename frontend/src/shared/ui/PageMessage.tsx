import { Link } from 'react-router-dom'

type PageMessageProps = {
  title: string
  linkText?: string
  linkTo?: string
}

export default function PageMessage({ title, linkText, linkTo }: PageMessageProps) {
  return (
    <main>
      <h1>{title}</h1>
      {linkText && linkTo && <Link to={linkTo}>{linkText}</Link>}
    </main>
  )
}
