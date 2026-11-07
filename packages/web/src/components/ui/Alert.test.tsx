import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Alert from './Alert'

describe('Alert', () => {
  it('announces errors immediately', () => {
    render(
      <Alert tone="danger" title="Could not save">
        Please try again.
      </Alert>,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Could not save')
    expect(alert).toHaveTextContent('Please try again.')
  })

  it('uses the polite status role for information', () => {
    render(<Alert tone="info">New features are available.</Alert>)

    expect(screen.getByRole('status')).toHaveTextContent(
      'New features are available.',
    )
  })
})
