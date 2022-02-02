# GSD-AWS-CDK-Serverless-Example

git clone git@github.com:drewkhoury/gsd-hello-world.git
drew@drews-MBP gsd-hello-world % make run
docker run -d -p "8080":"8080" --name go-hello-world go-hello-world:014d2b37ea01032be14a53bcc97f8fc1108bca14
186b712da09ed122ac5632381a857f9d980d8bd6d4dae3f3f58d21d186abcef7
drew@drews-MBP gsd-hello-world % docker ps
CONTAINER ID   IMAGE                                                     COMMAND    CREATED         STATUS         PORTS                                       NAMES
186b712da09e   go-hello-world:014d2b37ea01032be14a53bcc97f8fc1108bca14   "./main"   6 seconds ago   Up 5 seconds   0.0.0.0:8080->8080/tcp, :::8080->8080/tcp   go-hello-world
drew@drews-MBP gsd-hello-world % curl localhost:8080
Welcome to Contino's Good Software Delivery%



## Setup
Make sure to configure the following parameters locally before developing

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
