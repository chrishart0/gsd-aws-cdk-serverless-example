import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import './App.css'; 

//File Imports

import githubLogo from 'images/githubLogo.png'

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <Container maxWidth='md'>
          <Typography variant='h2'>
            Heading
          </Typography>
          <Typography variant='h3'>
            SubHeading
          </Typography>
          <br/>
          <Typography variant='h3'>
            Maps and Other Useful things
          </Typography>
          <br/>
          <Typography> <a href='https://github.com/chrishart0/gsd-aws-cdk-serverless-example' target="_blank" rel="noreferrer">
            <img height={20} src={githubLogo} alt='Logo'/>
            Edit on Github!
          </a> </Typography>
        </Container>
      </header>
    </div>
  );
}

export default App;
