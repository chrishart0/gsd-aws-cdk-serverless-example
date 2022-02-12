FROM node:16

#Install NodeJS and CDK
RUN apt-get update && apt-get install -y \
    make \
    software-properties-common \
    && npm install -g aws-cdk ts-node \
    && npx playwright install --with-deps \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

EXPOSE 3000


# we are able to override the CMD instruction and execute any command successfully. 
# However, while we were successful, this process of overriding the CMD instruction 
# is rather clunky.
CMD ["make", "_run"]

# The ENTRYPOINT instruction works very similarly to CMD 
# in that it is used to specify the command executed when the container is started. 
# However, where it differs is that ENTRYPOINT doesn't allow you to override the command.
# ENTRYPOINT ["make", "_run"]

