FROM mcr.microsoft.com/playwright:focal

#Install NodeJS and CDK
RUN apt-get update && apt-get install -y \
    make \
    software-properties-common \
    && npm install -g aws-cdk ts-node \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# we are able to override the CMD instruction and execute any command successfully. 
# However, while we were successful, this process of overriding the CMD instruction 
# is rather clunky.
CMD ["make", "_run"]

# The ENTRYPOINT instruction works very similarly to CMD 
# in that it is used to specify the command executed when the container is started. 
# However, where it differs is that ENTRYPOINT doesn't allow you to override the command.
# ENTRYPOINT ["make", "_run"]


# # Use uid 1001 who owns $HOME in GH Actions runtime
# # See why: https://github.com/arjun27/playwright-github-actions/issues/1
# USER 1001