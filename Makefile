SHELL=/bin/bash
CDK_DIR=infrastructure/
COMPOSE_RUN = docker-compose run --rm base
COMPOSE_RUN_WITH_PORTS = docker-compose run -d --service-ports --rm base
COMPOSE_RUN_PLAYWRIGHT = docker-compose run --rm playwright
# COMPOSE_RUN_CI = docker-compose --env-file ci.env run --service-ports --rm base
COMPOSE_UP = docker-compose up base
PROFILE = --profile default

.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

is-built: 
	if [ ! -d ./frontend/build ]; then make build; fi

prep-env:
	${COMPOSE_RUN} make _prep-env

_prep-env:
	if [ -s configs.env ]; then \
		touch configs.env \
	fi

build-container: 
	docker-compose build

cli: _prep-cache
	docker-compose run base /bin/bash

################
# Core Commands#
################
pre-reqs: _prep-cache build-container container-info _test-install-e2e-headful

# These commands run processes acorss the mulitple layers of the project
.PHONY: install
install npm-install: install-infra install-frontend

.PHONY: test
test: test-frontend test-e2e

.PHONY: run
run: run-frontend

################
### Frontend ###
################

.PHONY: install-frontend
install-frontend: 
	${COMPOSE_RUN} make _install-frontend

_install-frontend npm-install-frontend:
	npm install --prefix frontend/

_launch-browser: #Haven't tested on mac, not sure what will happen ToDo: instead of wait 10 seconds, wait for site to be loaded
	nohup sleep 5 && xdg-open http://localhost:3000 || open "http://localhost:3000" || explorer.exe "http://localhost:3000"  >/dev/null 2>&1 &

#ToDo: Frontend doesn't go down when you kill it. Ctrl+c or z should kill the container
#ToDo: handling for when port 3000 is already in use
.PHONY: run-frontend
run-frontend start-frontend: _launch-browser
	${COMPOSE_RUN_WITH_PORTS} make _run-frontend
	docker exec -it base tail -f watch.log

_run-frontend:
	npm start --prefix frontend/ > /app/watch.log

#Useful for the CI, for local dev recomendation is to simply run make run in another terminal
run-frontend-daemon start-frontend-daemon:
	${COMPOSE_RUN_WITH_PORTS} make _run-frontend

_run-frontend-daemon:
	npm start --prefix frontend/ > /app/watch.log

.PHONY: test-frontend
test-frontend: 
	${COMPOSE_RUN} make _test-frontend

_test-frontend:
	export CI=true && npm test --prefix frontend/

.PHONY: test-frontend-interactive
test-frontend-interactive: 
	${COMPOSE_RUN} make _test-frontend-interactive

_test-frontend-interactive:
	npm test --prefix frontend/ &

.PHONY: test-e2e
test-e2e:
	${COMPOSE_RUN_PLAYWRIGHT} make _test-e2e

_test-e2e:
	cd e2e && npx playwright test && cd .. 

#Running e2e tests locally in a browser cannot be done via a container, if you want to run e2e tests headfully(in browser) then run this command
.PHONY: _test-install-e2e-headful
_test-install-e2e-headful:
	sudo npx playwright install-deps

#ToDo: Figure out how to specify a directory for npx https://github.com/npm/npx/issues/74#issuecomment-676092733
#ToDo: Ensure frontend is up and running
.PHONY: _test-install-e2e-headful
_test-e2e-headful:
	cd e2e && npx playwright test --headed && cd .. 

.PHONY: build
build: 
	${COMPOSE_RUN} make _build

_build:
	npm run build --prefix frontend/

container-info:
	${COMPOSE_RUN} make _container-info

_container-info:
	./containerInfo.sh

.PHONY: ci
ci: 
	${COMPOSE_RUN} make _ci

_ci:
	npm ci --prefix frontend/

#############
### Infra ###
#############

.PHONY: install-infra
install-infra npm-install-infra: 
	${COMPOSE_RUN} make _install-infra

_install-infra:
	npm install --prefix infrastructure/

_prep-cache: #This resolves Error: EACCES: permission denied, open 'cdk.out/tree.json'
	mkdir -p infrastructure/cdk.out/

test-infra:
	${COMPOSE_RUN} make _test-infra

_test-infra:
	npm test --prefix infrastructure/ 

down:
	docker-compose down --remove-orphans

clear-cache:
	${COMPOSE_RUN} rm -rf ${CDK_DIR}cdk.out && rm -rf ${CDK_DIR}node_modules

synth: _prep-cache is-built
	${COMPOSE_RUN} make _synth

_synth:
	cd ${CDK_DIR} && cdk synth --no-staging ${PROFILE} > template.yaml

bootstrap: _prep-cache
	${COMPOSE_RUN} make _bootstrap

_bootstrap:
	cd ${CDK_DIR} && cdk bootstrap ${PROFILE}

deploy: _prep-cache build
	${COMPOSE_RUN} make _deploy 

_deploy: 
	cd ${CDK_DIR} && cdk deploy --require-approval never ${PROFILE}

destroy:
	${COMPOSE_RUN} make _destroy

_destroy:
	cd ${CDK_DIR} && cdk destroy --force ${PROFILE}

diff: _prep-cache is-built
	${COMPOSE_RUN} make _diff

_diff: _prep-cache
	cd ${CDK_DIR} && cdk diff ${PROFILE}
