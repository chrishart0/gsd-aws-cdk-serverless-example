import { render, screen } from '@testing-library/react';
import App from './App';

test('Heading', () => {
  render(<App />);
  const primaryHeading = screen.getByText(/Primary Heading/i);
  expect(primaryHeading).toBeInTheDocument();
});


test('SubHeading', () => {
  render(<App />);

  const subHeading = screen.getByText(/SubHeading/i);
  expect(subHeading).toBeInTheDocument();
});

test('Visitor Counter Visible', () => {
  render(<App />);

  const subHeading = screen.getByText(/Visitor Count/i);
  expect(subHeading).toBeInTheDocument();
});