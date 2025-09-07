import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Landing } from './Landing'

describe('Landing', () => {
  it('renders CTA', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    )
    expect(screen.getByText('Open DAISY')).toBeInTheDocument()
  })
})

