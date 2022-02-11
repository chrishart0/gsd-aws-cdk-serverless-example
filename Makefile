SHELL=/bin/bash
CDK_DIR=infrastructure/
COMPOSE_RUN = docker-compose run --service-ports --rm base
COMPOSE_RUN_CI = docker-compose --env-file ci.env run --service-ports --rm base
COMPOSE_UP = docker-compose up base
PROFILE = --profile default

all: pre-reqs synth
pre-reqs: _prep-cache container-build npm-install container-info

prep-env:
	${COMPOSE_RUN} make _prep-env

_prep-env:
	if [ -s configs.env ]; then \
		touch configs.env \
	fi

_build:
	npm run build --prefix frontend/

install: 
	${COMPOSE_RUN} make _install

_install:
	npm install --prefix frontend/

_launch-browser: #Haven't tested on mac, not sure what will happen
	nohup sleep 5 && xdg-open http://localhost:3000 || open "http://localhost:3000" >/dev/null 2>&1 &

run: _launch-browser
	${COMPOSE_RUN} make _run

_run:
	npm start --prefix frontend/

test: 
	${COMPOSE_RUN} make _test

_test:
	npm test --prefix frontend/

test-ci: 
	${COMPOSE_RUN} make _test

_test-ci:
	export CI=true && npm test --prefix frontend/

# test
########################
# CDK
#########################

_prep-cache: #This resolves Error: EACCES: permission denied, open 'cdk.out/tree.json'
	mkdir -p infrastructure/cdk.out/

container-build: pre-reqs
	docker-compose build

_site-test:
	npm test --prefix site/ --silent -- --watchAll=false

_infra-test:
	npm test --prefix infrastructure// --silent -- --watchAll=false

down:
	docker-compose down --remove-orphans

container-info:
	${COMPOSE_RUN} make _container-info

_container-info:
	./containerInfo.sh

clear-cache:
	${COMPOSE_RUN} rm -rf ${CDK_DIR}cdk.out && rm -rf ${CDK_DIR}node_modules

npm-install: _prep-cache
	${COMPOSE_RUN} make _npm-install

_npm-install:
	cd ${CDK_DIR} && npm install

cli: _prep-cache
	docker-compose run base /bin/bash

synth: _prep-cache
	${COMPOSE_RUN} make _synth

_synth:
	cd ${CDK_DIR} && cdk synth --no-staging ${PROFILE}

bootstrap: _prep-cache
	${COMPOSE_RUN} make _bootstrap

_bootstrap:
	cd ${CDK_DIR} && cdk bootstrap ${PROFILE}

deploy: _prep-cache
	${COMPOSE_RUN} make _deploy 

_deploy: 
	cd ${CDK_DIR} && cdk deploy --require-approval never ${PROFILE}

destroy:
	${COMPOSE_RUN} make _destroy

_destroy:
	cd ${CDK_DIR} && cdk destroy --force ${PROFILE}

diff: _prep-cache
	${COMPOSE_RUN} make _diff

_diff: _prep-cache
	cd ${CDK_DIR} && cdk diff ${PROFILE}
