import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import FormField from './FormField'

describe('FormField', () => {
  it('labels the control it wraps', () => {
    render(
      <FormField label="Country">
        {(control) => (
          <select {...control}>
            <option>France</option>
          </select>
        )}
      </FormField>,
    )

    expect(screen.getByLabelText('Country')).toBeInTheDocument()
  })

  it('describes the control with its hint', () => {
    render(
      <FormField label="Country" hint="Where you live now.">
        {(control) => (
          <select {...control}>
            <option>France</option>
          </select>
        )}
      </FormField>,
    )

    const select = screen.getByLabelText('Country')
    expect(select).toHaveAccessibleDescription('Where you live now.')
  })

  it('marks the control invalid and announces the error instead of the hint', () => {
    render(
      <FormField label="Country" hint="Where you live now." error="Choose a country.">
        {(control) => (
          <select {...control}>
            <option>France</option>
          </select>
        )}
      </FormField>,
    )

    const select = screen.getByLabelText('Country')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    expect(select).toHaveAccessibleDescription('Choose a country.')
    expect(screen.getByRole('alert')).toHaveTextContent('Choose a country.')
    expect(screen.queryByText('Where you live now.')).not.toBeInTheDocument()
  })

  it('marks required fields on the control, not only with the asterisk', () => {
    render(
      <FormField label="Country" required>
        {(control) => (
          <select {...control}>
            <option>France</option>
          </select>
        )}
      </FormField>,
    )

    expect(screen.getByLabelText('Country')).toBeRequired()
  })
})
