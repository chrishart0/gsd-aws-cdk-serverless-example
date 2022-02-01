import { render, screen } from '@testing-library/react';
import App from './App';

test('Heading', () => {
  render(<App />);
  const linkElement = screen.getByText(/Heading/i);
  expect(linkElement).toBeInTheDocument();
});
