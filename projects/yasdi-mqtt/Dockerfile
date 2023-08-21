FROM monorepo AS builder

RUN pnpm --filter @woifes/yasdi-mqtt --prod deploy /deployed/

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /deployed .

# Woraround for the rpath (or runpath) issue after copying the builded package.
ENV LD_LIBRARY_PATH="/app/node_modules/@woifes/node-yasdi/build/Release/"

CMD ["node", "./dist/index", "/data/config.yaml"]