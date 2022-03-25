// If you are new to automated testing frontends then read this! https://www.freecodecamp.org/news/testing-react-hooks/
// The more your tests resemble the way your software is used the more confidence they can give you
// For this reason we have chosen not to write tests for specific components, but test those components through the SPA (Single Page App), as the user will see them

import { render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import App from "./App";

afterEach(() => {
  global.innerWidth = 1024;
  global.dispatchEvent(new Event("resize"));
});

it("renders static page as expected", async () => {
  render(<App />);
  const primaryHeading = screen.getByText("Welcome to this demo site!");
  expect(primaryHeading).toBeInTheDocument();

  const subHeading = screen.getByText("Made with the S3, Lambda, and DDB stack");
  expect(subHeading).toBeInTheDocument();

  const gitHubLink = screen.getByText("Edit on Github!");
  expect(gitHubLink).toBeInTheDocument();

  const infraDiag = screen.getByText("Infrastructure Diagram");
  expect(infraDiag).toBeInTheDocument();
});

it("renders the navbar as expected", async () => {
  render(<App />);
  const navBar = screen.getAllByText("About Us")[0];
  expect(navBar).toBeInTheDocument();
});

it("switches to dark mode", async () => {
  render(<App />);
  //Verify light mode icon shown by default
  const lightModeIcon = screen.getAllByTestId("LightModeIcon")[0];
  expect(lightModeIcon).toBeInTheDocument();

  const darkModeSwitch = screen.getAllByTestId("darkModeSwitch")[0];
  darkModeSwitch.click();

  //Verify Dark Mode shown after switch
  const darkModeIcon = screen.getAllByTestId("DarkModeIcon")[0];
  expect(darkModeIcon).toBeInTheDocument();
});

it("show then hide menu when clicked on then away", async () => {
  render(<App />);

  //Verify Profile pic image is visible
  const userProfilePic = screen.getByAltText(/User Profile Pic/);
  expect(userProfilePic).toBeInTheDocument();

  //Verify user profile menu not visible
  expect(screen.queryByText("Logout")).not.toBeVisible();

  //Show user profile menu
  userProfilePic.click();
  const logoutButton = screen.getByText(/Logout/);
  expect(logoutButton).toBeInTheDocument();

  // ToDo: Figure out how to wait on menu closing
  //Click away to close navbar
  const aboutUs = screen.getAllByText(/About Us/i)[0];
  aboutUs.click();
  // await expect(screen.queryByText(/Logout/)).not.toBeVisible();
});

it("fetches user count successfully", async () => {
  const userCount = { "User count": "2" };
  jest.spyOn(global, "fetch").mockImplementation(() =>
    Promise.resolve({
      json: () => Promise.resolve(userCount),
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
