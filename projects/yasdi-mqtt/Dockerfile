FROM monorepo AS builder

RUN pnpm --filter @woifes/yasdi-mqtt --prod deploy /deployed/

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /deployed .

CMD ["node", "./dist/index", "/data/config.yaml"]