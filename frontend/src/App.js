import React, { useEffect, useState } from "react";
import "@fontsource/roboto";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

// Components
import Navbar from "components/navBar";

// Assets
import githubLogo from "images/githubLogo.png";
import infraDiagram from "images/Infra-Diagram.drawio.png";

// CSS / Themeing
import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Define theme settings
const lightMode = {
  palette: {
    mode: "light",
  },
};

// https://mui.com/customization/dark-mode/
const darkMode = {
  palette: {
    mode: "dark",
  },
};

function App() {
  const [userCount, setUserCount] = useState(false);
  // The light theme is used by default
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  //Special handling to use localhost SAM API if running locally via npm start(make run)
  const apiUrl =
    process.env.NODE_ENV !== "development"
      ? "https://api." + process.env.REACT_APP_DOMAIN + "/users"
      : process.env.REACT_APP_USER_API_URL_LOCAL_SAM;

  async function fetchUserCount() {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        setUserCount(response["User count"]);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  //Prevent continuous reloading calling API each time
  useEffect(() => {
    fetchUserCount();
  }, []);

  return (
    <ThemeProvider theme={isDarkTheme ? createTheme(darkMode) : createTheme(lightMode)}>
      <CssBaseline />
      <div className="App">
        <Navbar className="AppBar" isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme} />

        <Container className="body" maxWidth="md">
          <Typography variant="h2">Welcome to this demo site!</Typography>
          <Typography variant="h5">Made with the S3, Lambda, and DDB stack</Typography>
          <br />
          <Typography>
            This demo shows how to use a static site hosted in S3, a Lambda function + APG, and DynamoDB. All testing locally and in the
            CI/CD.
          </Typography>
          <br />
          <Typography>
            <a href="https://github.com/chrishart0/gsd-aws-cdk-serverless-example" target="_blank" rel="noreferrer">
              <img height={20} src={githubLogo} alt="Logo" />
              Edit on Github!
            </a>
          </Typography>
          <Typography className="visitorCounter">Visitor Count: {userCount}</Typography>
          <Typography variant="h3">Infrastructure Diagram</Typography>
          <img width={"80%"} src={infraDiagram} alt="Infra Diagram" />
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
