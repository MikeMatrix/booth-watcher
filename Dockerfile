FROM node:16
ENV NPM_CONFIG_LOGLEVEL info

ADD . .

RUN npm install
RUN npm run prod

WORKDIR dist/
CMD ["npm", "run start"]
VOLUME config/
ENV BOOTH_WEBHOOK_URL=""