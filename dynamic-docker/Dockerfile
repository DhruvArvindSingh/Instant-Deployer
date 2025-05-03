FROM ubuntu:22.04

RUN apt-get update && apt-get install -y \
    curl \
    git \
    gnupg \
    ca-certificates \
    lsb-release

# Install Node.js 20.x directly
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && node --version \
    && npm --version

WORKDIR /app


COPY main.sh main.sh
COPY script.js script.js
COPY utils utils
COPY redis redis
COPY package*.json .

RUN npm install
RUN chmod +x main.sh
RUN chmod +x script.js
EXPOSE 80-9500


ENTRYPOINT ["/app/main.sh"]
