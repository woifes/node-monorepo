FROM node:18-alpine

RUN apk add --no-cache gcc g++ make python3

RUN npm i -g pnpm

WORKDIR /monorepo

COPY pnpm-lock.yaml .

RUN pnpm fetch

COPY . .

RUN pnpm install --offline