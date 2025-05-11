#! /bin/bash

# This line is redundant and unnecessary.
# It's attempting to export an environment variable GIT_REPOSITORY__URL 
# by setting it equal to itself, which doesn't accomplish anything since
# the variable would already be available in the environment
export GIT_REPOSITORY_URL="$GIT_REPOSITORY_URL"

echo "GITHUB_REPO_URL: ${GIT_REPOSITORY_URL:-}" 
echo "PROJECT_SLUG: ${PROJECT_SLUG:-}"
echo "DEPLOYMENT_ID: ${DEPLOYMENT_ID:-}"
# This line prints the value of the EXPOSE_PORTS environment variable, or an empty string if it's not set
# The ${EXPOSE_PORTS:-} syntax means "use EXPOSE_PORTS if it exists, otherwise use an empty string"
echo "EXPOSE_PORTS: ${EXPOSE_PORTS:-}"
echo "RUN_SCRIPT: ${RUN_SCRIPT:-}"
echo "BUILD_SCRIPT: ${BUILD_SCRIPT:-}"

git clone "$GIT_REPOSITORY_URL" /app/output

exec node script.js