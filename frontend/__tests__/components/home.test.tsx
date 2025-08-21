import { render, screen } from '@testing-library/react';
import Home from '../../src/app/page'

describe('Home', () => {
  it('renders title', () => {
    render(<Home /> as any);
    expect(screen.getByText(/Task Manager/i)).toBeInTheDocument();
  });
});
