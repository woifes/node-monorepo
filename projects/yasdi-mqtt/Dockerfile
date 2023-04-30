FROM monorepo AS builder

RUN pnpm --filter @woifes/matrix-mqtt-bridge --prod deploy /deployed/

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /deployed .

CMD ["node", "./dist/index", "/data/config.yaml"]