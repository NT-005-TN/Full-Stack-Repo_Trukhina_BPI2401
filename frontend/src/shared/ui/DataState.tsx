import { Alert, Button, CircularProgress } from '@mui/material'

type DataStateProps = {
  type: 'loading' | 'error' | 'empty'
  message: string
  onRetry?: () => void
}

export default function DataState({ type, message, onRetry }: DataStateProps) {
  if (type === 'loading') {
    return (
      <div className="data-state" role="status">
        <CircularProgress size={32} />
        <p>{message}</p>
      </div>
    )
  }

  return (
    <div className="data-state">
      <Alert severity={type === 'error' ? 'error' : 'info'}>{message}</Alert>
      {onRetry && <Button onClick={onRetry}>Повторить</Button>}
    </div>
  )
}
