FROM node:16
ENV NPM_CONFIG_LOGLEVEL info
WORKDIR /booth/

ADD . .

RUN npm install
RUN npm run prod

VOLUME /booth/config/

RUN chmod +x run.sh
CMD ./run.sh

ENV BOOTH_WEBHOOK_URL=""