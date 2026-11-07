import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Spinner from './Spinner'

describe('Spinner', () => {
  it('exposes a status with a screen-reader label', () => {
    render(<Spinner />)

    expect(screen.getByRole('status')).toHaveTextContent('Loading')
  })

  it('accepts a custom label', () => {
    render(<Spinner label="Uploading photo" />)

    expect(screen.getByRole('status')).toHaveTextContent('Uploading photo')
  })
})
