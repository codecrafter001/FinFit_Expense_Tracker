import { render, screen } from '@testing-library/react';
import App from '../shared/app';

test('renders the app component', () => {
  render(<App />);
  expect(screen.getByText(/FinFit/i)).toBeInTheDocument();
});
