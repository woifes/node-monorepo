# SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
# SPDX-License-Identifier: MIT

FROM node:18-alpine as builder

RUN apk add --no-cache gcc g++ make python3

RUN npm i -g pnpm

WORKDIR /monorepo

COPY pnpm-lock.yaml .

RUN pnpm fetch

COPY . .

RUN pnpm install --offline

# The above code copy is a workaround because docker does not support multi stage builds over multiple Dockerfiles and on top on that multiple architectures.
# Project build

RUN pnpm --filter @woifes/mqtt-postgres-agent --prod deploy /deployed/

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /deployed .

CMD ["node", "./dist/index", "/data/config.yaml"]