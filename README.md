# GSD-AWS-CDK-Serverless-Example
[![CI](https://github.com/chrishart0/gsd-aws-cdk-serverless-example/actions/workflows/CI.yml/badge.svg)](https://github.com/chrishart0/gsd-aws-cdk-serverless-example/actions/workflows/CI.yml)

## Why?
Three Musketeers pattern allows for ease of setup and better developer experience for this complicated local testing environment, with the added benefit of using the same local commands for the CI/CD.


## Setup
Make sure to configure the following parameters locally before developing

## Working with the frontend

### Dependencies
3 Musketeers allows us to get away without installing Node or NPM locally but how do we manage dependencies? To get access to the full npm cli just run `make cli` and you are free to run any commands you wish.

#### Example: Adding a new dependency to the frontend
```
# Enter into the three musketeers container
$ make cli

# Install the new dependecy
$ npm install --save-dev playwright

# Exit the Container
$exit
```


## Testing
There are three kinds of tests included in this repo:
* [End-to-end](infrastructure/test/infrastructure.test.ts)
* [Frontend Unit Tests](frontend/src/App.test.js)
* [AWS CDK Infrastructure Unit Tests:](infrastructure/test/infrastructure.test.ts) find docs [here](https://docs.aws.amazon.com/cdk/v2/guide/testing.html)

### `make test`
Run all tests: currently frontend unit and e2e

### `make test-frontend`
Runs `npm test` in CI mode, which simply outputs the results of the tests once.

### `make test-frontend-interactive`
Starts up the jest test running in interactive mode, running `npm test` inside the container

### End to End Testing

#### `make test-e2e`
Run e2e tests inside a container headless

#### `_test-install-e2e-headful`
Install needed pre-reqs for running headful e2e tests locally

#### `_test-e2e-headful`

### Building
#### `make build`
Standard `npm run build` command

#### `make ci`
Uses npm ci, which is the prefered build command for us in CI pipelines, as it is faster and more stable. 


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


# TODO
A non-exhaustive list of items left to be addressed.

* ~~Fix XDG/Open issue on `make run` in WSL~~
* ~~Graceful exit of `make run`~~
* Add error handling for the case of dummy values being left in `configs.env` when running `make synth`
* CDK
  * ~~Add check to run `make build` prior to `make synth` or `make diff` or `make deploy` only if build files not detected~~
  * ~~CDK better env var handling. Need valid way to maintain on local without risk of commiting and entering in vars through CI/CD (Reference here make: https://github.com/contino/gsd-hello-world)~~
* ~~Always run a `make build` before `make deploy`~~
* ~~Add `make synth` and cdk testing to github actions~~
* Testing
  * ~~Make CDK tests pass and add to make `cdk test` file~~
  * ~~Right now `make test` only runs frontend jest tests, `make test` should run all tests (currently only frontend jest tests and infra CDK tests)~~
    * ~~There will be commands: `make test` `make infra-test` `make frontend-test`~~
  * ~~Add end to end testing with playwright~~
    * ~~Ensure it runs in CI~~
* For _launch-browser command instead of wait 10 seconds, wait for site to be loaded

* Quality Scan: Add <https://www.sonarqube.org/downloads/> community edition to CI/CD. Use [this](https://github.com/contino/gsd-hello-world/blob/main/.github/workflows/quality.yml) as reference

* CI/CD
  * Add env handling to Github Actions
  * Get deploys working in GitHub actions
  * Split e2e testing into own run to speedup CI/CD
  * Add npm caching to speed up CI/CD
  * Investiagte prebuilding containers for faster CI/CD

* Lambda API
  * ~~Setup basic lambda function in CDK infra~~
  * Add unit tests to lambda function
  * Add local DynamoDB Container
