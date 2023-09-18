# SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
# SPDX-License-Identifier: MIT

FROM node:18-alpine as builder

RUN apk add --no-cache gcc g++ make python3

RUN npm i -g pnpm

WORKDIR /monorepo

COPY pnpm-lock.yaml .

RUN pnpm fetch

COPY . .

# The above code copy is a workaround because docker does not support multi stage builds over multiple Dockerfiles and on top on that multiple architectures.
# Project build

RUN pnpm install --offline

RUN pnpm --filter @woifes/yasdi-rest --prod deploy /deployed/

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /deployed .

# Woraround for the rpath (or runpath) issue after copying the builded package.
ENV LD_LIBRARY_PATH="/app/node_modules/@woifes/node-yasdi/build/Release/"

CMD ["node", "./dist/index"]