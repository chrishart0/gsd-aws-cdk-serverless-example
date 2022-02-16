SHELL=/bin/bash
CDK_DIR=infrastructure/
COMPOSE_RUN = docker-compose run --rm base
COMPOSE_RUN_WITH_PORTS = docker-compose run -d --name base --service-ports --rm base
COMPOSE_UP_FULL_STACK = docker-compose up dynamodb sam frontend
COMPOSE_UP_FRONTEND = docker-compose up frontend
COMPOSE_UP_BACKEND = docker-compose up dynamodb sam
COMPOSE_RUN_PLAYWRIGHT = docker-compose run --rm playwright
COMPOSE_UP = docker-compose up base
PROFILE = --profile default

.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

is-built: 
	if [ ! -d ./frontend/build ]; then make build; fi

# prep-env:
# 	${COMPOSE_RUN} make _prep-env

_prep-env:
	if [ ! -f ./configs.env ]; then \
		echo "No configs.env file found, genereating from env variables"; \
		touch configs.env; \
		echo "REACT_APP_USER_API_URL_LOCAL_SAM=http://localhost:3001/users" >> configs.env; \
	fi

# subDomain=test
# domain=christianhart.io
# hostedZoneName=christianhart.io
# hostedZoneId=Z04653531OVXYWTMNZ037

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
install npm-install: _prep-env install-infra install-frontend install-e2e install-backend

.PHONY: test
test: test-frontend test-e2e test-infra

.PHONY: run
run: _launch-browser
	${COMPOSE_UP_FULL_STACK}

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
	npm test --prefix frontend/

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

###############
### Backend ###
###############

_prep-venv:
	python3 -m venv backend/.venv

_clear-cache-backend:
	rm -rf backend/.venv/
	rm -rf backend/.pytest_cache/

.PHONY: install-backend
install-backend: 
	${COMPOSE_RUN} make _install-backend

_install-backend:
	python3 -m venv backend/.venv
	source backend/.venv/bin/activate
	pip install -r backend/tests/requirements.txt

.PHONY: test-backend
test-backend: test-backend-unit

.PHONY: test-backend-unit
test-backend-unit:
	${COMPOSE_RUN} make _test-backend-unit

_test-backend-unit:
	cd backend && python -m pytest tests/unit -v && cd ..

build-backend: synth

# _run-backend-invoke _backend-invoke _invoke:
# 	cd backend && sam local invoke BackendFunction -t ../infrastructure/template.yaml && cd ..

_kill-sam:
	killall -9 sam || echo "SAM was not already running... starting SAM"

#ToDo: check for template.yaml, build if not exist
#ToDo: Add warning to update make synth on CDK changes
run-backend: 
	${COMPOSE_UP_BACKEND}
# ${COMPOSE_RUN_SAM} make _run-backend

_run-backend _start-api: _kill-sam
	cd backend && sam local start-api -p 3001 -t ../infrastructure/template.yaml --docker-volume-basedir /home/chris/git/gsd-aws-cdk-serverless-example/backend --host 0.0.0.0 --env-vars sam_local_environment_variables.json --docker-network aws_backend && cd ..

# cd backend && sam local start-api -p 3001 -t ../infrastructure/template.yaml --docker-volume-basedir /home/chris/git/gsd-aws-cdk-serverless-example/backend  --container-host host.docker.internal --host 0.0.0.0 --warm-containers EAGER --debug && cd ..


# sam local start-api \
#     --host 0.0.0.0 \
# 	--port 3001 \
# 	-t ../infrastructure/template.yaml \
#     --container-host-interface 0.0.0.0 \
#     --container-host host.docker.internal \
#     --debug \
#     --docker-volume-basedir $PWD 
# cd backend && sam local start-api -p 3001 -t ../infrastructure/template.yaml --host 0.0.0.0 --debug && cd .. # Works with old SAM version

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
	docker-compose down --remove-orphans --volume

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

deploy-no-build: _prep-cache
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

###########
### E2E ###
###########
.PHONY: install-e2e
install-e2e: 
	${COMPOSE_RUN} make _install-e2e

_install-e2e npm-install-playwright:
	npm install --prefix e2e/

.PHONY: test-e2e
test-e2e:
	${COMPOSE_RUN_PLAYWRIGHT} make _test-e2e

_test-e2e:
	cd e2e && npx playwright test --output ../test_results/ && cd .. 

test-e2e-ci:
	${COMPOSE_RUN_PLAYWRIGHT} make _test-e2e-ci

_test-e2e-ci:
	cd e2e && export CI=true && npx playwright test --output ../test_results/ && cd .. 

#Running e2e tests locally in a browser cannot be done via a container, if you want to run e2e tests headfully(in browser) then run this command
.PHONY: _test-install-e2e-headful
_test-install-e2e-headful:
	cd e2e &&  npx playwright install-deps && cd ..

#ToDo: Figure out how to specify a directory for npx https://github.com/npm/npx/issues/74#issuecomment-676092733
#ToDo: Ensure frontend is up and running
.PHONY: _test-install-e2e-headful
_test-e2e-headful:
	cd e2e && npx playwright test --headed && cd .. 
