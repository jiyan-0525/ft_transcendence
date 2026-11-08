import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Avatar from './Avatar'

describe('Avatar', () => {
  it('shows initials of the first two words when there is no picture', () => {
    render(<Avatar name="ada lovelace" />)

    expect(screen.getByRole('img', { name: 'ada lovelace' })).toHaveTextContent('AL')
  })

  it('uses the picture and its name as alt text when src is given', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />)

    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute(
      'src',
      '/ada.png',
    )
  })

  it('announces presence in text, not only in colour', () => {
    render(<Avatar name="Ada" status="online" />)

    expect(screen.getByText('Online')).toBeInTheDocument()
  })
})
