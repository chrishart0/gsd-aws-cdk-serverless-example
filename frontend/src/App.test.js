import { render, screen } from '@testing-library/react';
import App from './App';

test('Heading', () => {
  render(<App />);
  const primaryHeading = screen.getByText(/Welcome to this demo site!/i);
  expect(primaryHeading).toBeInTheDocument();
});


test('SubHeading', () => {
  render(<App />);

  const subHeading = screen.getByText(/Made with the S3, Lambda, and DDB stack/i);
  expect(subHeading).toBeInTheDocument();
});

test('Visitor Counter Visible', () => {
  render(<App />);

  const subHeading = screen.getByText(/Visitor Count/i);
  expect(subHeading).toBeInTheDocument();
});