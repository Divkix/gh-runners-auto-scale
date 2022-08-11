#!/bin/bash

COMMAND="docker run -d --rm \
  -e RUN_AS_ROOT=$RUN_AS_ROOT \
  -e RUNNER_NAME_PREFIX=$RUNNER_NAME_PREFIX \
  -e ACCESS_TOKEN=$ACCESS_TOKEN \
  -e REPO_URL=$REPO_URL \
  -e LABELS=$LABELS \
  -e EPHEMERAL=1 myoung34/github-runner:latest"

echo "$COMMAND"

eval "$COMMAND"
