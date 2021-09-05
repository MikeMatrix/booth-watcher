FROM node:16
ENV NPM_CONFIG_LOGLEVEL info

ADD . .

RUN npm install
RUN npm run prod

VOLUME config/

RUN chmod +x run.sh
CMD ./run.sh

ENV BOOTH_WEBHOOK_URL=""