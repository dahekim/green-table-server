FROM node:14

WORKDIR /vegan_backend/
COPY ./package.json /vegan_backend/
COPY ./yarn.lock /vegan_backend/
RUN yarn install 

COPY . /vegan_backend/

CMD yarn start:dev