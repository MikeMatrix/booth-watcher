FROM node:14
ENV NPM_CONFIG_LOGLEVEL info
WORKDIR /booth/

ADD . .

RUN npm install
RUN npm run prod
RUN mkdir config

VOLUME /booth/config/

RUN chmod +x run.sh
CMD ./run.sh

ENV BOOTH_WEBHOOK_URL=""