import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card, {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './Card'

describe('Card', () => {
  it('composes a header, title, description and content', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Suggested for you</CardTitle>
          <CardDescription>Communities you may like.</CardDescription>
        </CardHeader>
        <CardContent>Nothing here yet.</CardContent>
      </Card>,
    )

    expect(
      screen.getByRole('heading', { name: 'Suggested for you' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Communities you may like.')).toBeInTheDocument()
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument()
  })

  it('uses the muted surface when asked', () => {
    const { container } = render(<Card variant="muted">Body</Card>)

    expect(container.firstChild).toHaveClass('bg-surface-muted')
  })
})
