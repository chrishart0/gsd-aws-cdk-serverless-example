FROM mcr.microsoft.com/playwright:focal

WORKDIR /app

# ToDO: Figure out why sam only works if we install these in the container build
# Probably just need to install boto or something 
COPY backend/tests/requirements.txt /tmp

# Install docker so that cdk lambda packaging works
RUN  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg \
     && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null \
    && apt-get update \
    && apt-get install docker-ce-cli -y

# && apt-get install docker-ce docker-ce-cli containerd.io -y

#Install CDK and Frontend
RUN apt-get update && apt-get install -y \
    make jq \
    software-properties-common \
    && npm install -g aws-cdk ts-node

# markupsafe and jinja2 versions requried for old SAM hack
# Install deps for SAM Backend
RUN apt-get install -y \
    python3.9 \
    python3.8-venv python3.9-venv \
    && pip install pip \
    && pip install awscli aws-sam-cli==1.12.0 markupsafe==2.0.1 jinja2==2.10.1 botocore==1.24.14 \
    && pip install -r /tmp/requirements.txt \
    && rm -rf /var/lib/apt/lists/*

# we are able to override the CMD instruction and execute any command successfully. 
# However, while we were successful, this process of overriding the CMD instruction 
# is rather clunky.
CMD ["make", "_run"]
