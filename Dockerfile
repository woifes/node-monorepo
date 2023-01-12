FROM node:18-alpine

RUN npm i -g pnpm

RUN apk add gcc g++ make python3

WORKDIR /monorepo

COPY . .

RUN pnpm install
