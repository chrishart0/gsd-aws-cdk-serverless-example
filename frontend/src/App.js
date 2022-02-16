import React, { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import './App.css'; 

import githubLogo from 'images/githubLogo.png'

function App() {
  const [userCount, setUserCount] = useState(false);

  //Special handling to use localhost SAM API if running locally via npm start(make run)
  const apiUrl = (process.env.NODE_ENV !== 'development') ? 'https://' + process.env.REACT_APP_USER_API_DOMAIN + '/users' : process.env.REACT_APP_USER_API_URL_LOCAL_SAM
  console.log('apiUrl: ', apiUrl)

  //Prevent continuous reloading calling API each time
  useEffect(() => {
    fetch(apiUrl)
    .then(response => response.json())
    .then(response => {
      console.log(response)
      setUserCount(response['User count'])
    })
    .catch(err => {
      console.log(err);
    });
  }, [] );
  
  console.log('userCount:', userCount)

  return (
    <div className="App">
      <header className="App-header">
        <Container className='header' maxWidth='md'>
          <Typography variant='h2'>
            Welcome to this demo site!
          </Typography>
          <Typography variant='h5'>
          Made with the S3, Lambda, and DDB stack
          </Typography>
          <br/>
          <Typography>
          This demo shows how to use a static site hosted in S3, a Lambda function + APG, and DynamoDB. All testing locally and in the CI/CD.
          </Typography>
          <br/>
          <Typography className='footer'> <a href='https://github.com/chrishart0/gsd-aws-cdk-serverless-example' target="_blank" rel="noreferrer">
            <img height={20} src={githubLogo} alt='Logo'/>
            Edit on Github!
          </a> </Typography>
          <Typography className='visitorCounter'>Visitor Count: {userCount}</Typography>
        </Container>
      </header>
    </div>
  );
}

export default App;
