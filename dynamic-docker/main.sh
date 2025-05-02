#! /bin/bash

# This line is redundant and unnecessary.
# It's attempting to export an environment variable GIT_REPOSITORY__URL 
# by setting it equal to itself, which doesn't accomplish anything since
# the variable would already be available in the environment
export GIT_REPOSITORY_URL="$GIT_REPOSITORY_URL"

echo "GITHUB_REPO_URL: $GIT_REPOSITORY_URL" 

git clone "$GIT_REPOSITORY_URL" /app/output

exec node script.js