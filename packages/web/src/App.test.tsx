import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the product name and bootstrap message', () => {
    render(<App />)

    expect(screen.getByText('Community')).toBeInTheDocument()
    expect(screen.getByText('Frontend foundation')).toBeInTheDocument()
  })
})
