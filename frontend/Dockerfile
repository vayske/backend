FROM node:18.18-alpine as build

WORKDIR /app

COPY . .

RUN npm ci

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/.nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN rm -rf ./*

COPY /app/build .
