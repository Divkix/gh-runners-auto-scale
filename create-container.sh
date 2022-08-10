#!/bin/bash

case ${RUNNER_SCOPE} in
  org*)
    [[ -z ${ORG_NAME} ]] && ( echo "ORG_NAME required for org runners"; exit 1 )
    RUNNER_SCOPE="org"
    COMMAND="docker run -d --rm -e RUN_AS_ROOT=$RUN_AS_ROOT -e RUNNER_NAME_PREFIX=$RUNNER_NAME_PREFIX -e ACCESS_TOKEN=$ACCESS_TOKEN -e RUNNER_SCOPE=$RUNNER_SCOPE -e ORG_NAME=$ORG_NAME -e LABELS=$LABELS -e EPHEMERAL=1 myoung34/github-runner:latest"
    ;;
  ent*)
    [[ -z ${ENTERPRISE_NAME} ]] && ( echo "ENTERPRISE_NAME required for enterprise runners"; exit 1 )
    _SHORT_URL="https://${_GITHUB_HOST}/enterprises/${ENTERPRISE_NAME}"
    RUNNER_SCOPE="enterprise"
    COMMAND="docker run -d --rm -e RUN_AS_ROOT=$RUN_AS_ROOT -e RUNNER_NAME_PREFIX=$RUNNER_NAME_PREFIX -e ACCESS_TOKEN=$ACCESS_TOKEN -e RUNNER_SCOPE=$RUNNER_SCOPE -e ORG_NAME=$ORG_NAME -e LABELS=$LABELS -e EPHEMERAL=1 myoung34/github-runner:latest"
    ;;
  *)
    [[ -z ${REPO_URL} ]] && ( echo "REPO_URL required for repo runners"; exit 1 )
    _SHORT_URL=${REPO_URL}
    RUNNER_SCOPE="repo"
    COMMAND="docker run -d --rm -e RUN_AS_ROOT=$RUN_AS_ROOT -e RUNNER_NAME_PREFIX=$RUNNER_NAME_PREFIX -e ACCESS_TOKEN=$ACCESS_TOKEN -e REPO_URL=$REPO_URL -e LABELS=$LABELS -e EPHEMERAL=1 myoung34/github-runner:latest"
    ;;
esac

echo "$COMMAND"

eval "$COMMAND"
