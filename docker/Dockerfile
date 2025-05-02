FROM ubuntu:22.04

RUN apt-get update
RUN apt-get install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
RUN \. "$HOME/.nvm/nvm.sh"
RUN nvm install 20

RUN apt-get install -y git

WORKDIR /app

COPY main.sh main.sh
COPY script.js script.js
COPY utils utils
COPY redis redis
COPY package*.json .

RUN npm install
RUN chmod +x main.sh
RUN chmod +x script.js

ENTRYPOINT ["/app/main.sh"]
