FROM ubuntu:22.04

RUN mkdir -p /usr/src/Vector

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update
RUn apt-get install -y curl wget
RUN apt-get -y autoclean

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 14.21.4

RUN curl --silent -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN node -v
RUN npm -v

RUN sleep 6s

RUN apt-get install g++ build-essential python3 -y

WORKDIR /usr/src/Vector

ENV MONGO_URL=mongodb://mongo:27017/Vector\
    ROOT_URL=http://localhost \
    PORT=3000 \
    MAIL_URL=smtp://USERNAME:PASSWORD@HOST:PORT

COPY bundle/ /usr/src/Vector/

RUN cd /usr/src/Vector/programs/server/ \
    && npm install

EXPOSE 3000

CMD [ "node", "main.js" ]
