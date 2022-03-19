import { render, screen } from '@testing-library/react';
import { act } from "react-dom/test-utils";
import App from './App';


it('renders static page as expected', async () => {
  render(<App />);
  const primaryHeading = screen.getByText(/Welcome to this demo site!/i);
  expect(primaryHeading).toBeInTheDocument();

  const subHeading = screen.getByText(/Made with the S3, Lambda, and DDB stack/i);
  expect(subHeading).toBeInTheDocument();

  const gitHubLink = screen.getByText(/Edit on Github!/i);
  expect(gitHubLink).toBeInTheDocument();
});


it('fetches user count successfully', async () => {
  const userCount = { "User count": "2" }
  jest.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve(userCount)
    })
  );

  // Use the asynchronous version of act to apply resolved promises
  await act(async () => {
    render(<App />);
  });

  const subHeading = screen.getByText(/Visitor Count: 2/i);
  expect(subHeading).toBeInTheDocument();

  // remove the mock to ensure tests are completely isolated
  global.fetch.mockRestore();
});
