# GSD-AWS-CDK-Serverless-Example

## Why?
Three Musketeers pattern allows for ease of setup and better developer experience for this complicated local testing environment, with the added benefit of using the same local commands for the CI/CD.


## Setup
Make sure to configure the following parameters locally before developing

## Working with the frontend

### Testing
#### `make test`
Starts up the jest test running in interactive mode, running `npm test` inside the container

#### `make test-ci`
Runs `npm test` in CI mode, which simply outputs the results of the tests once.

## Workflow
Test

```
make test
```

Build site
```
make _site-build
```

Check infra diff
```
make diff
```

Deploy
```
make deploy
```

# Goals
It's hard to maintain and locally test serverless envs.

Devs don't do local testing (because it's too hard or takes too much time).

* Demonstrate easy to use, 3m, local aws serverless dev environment
  * Lambda
  * S3 Frontend(React)
  * Dynamo
* GSD compliant pipeline using 3m
  * Demonstrate best testing practices locally and in CI/CD
  * Unit, E2E, Infra
* Easy to read, self guiding docs which explain how the process works
* Optional: Use S3 in logic tier 
