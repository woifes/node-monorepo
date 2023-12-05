# SPDX-FileCopyrightText: © 2023 woifes <https://github.com/woifes>
# SPDX-License-Identifier: MIT

FROM node:18-alpine as builder

WORKDIR /test

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "test"]