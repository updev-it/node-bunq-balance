# Base image (83.5 MB)
FROM node:10-alpine

# Define volume
VOLUME /usr/src/app/dist/public/accounts

# Create app directory
WORKDIR /usr/src/app

# Copy npm files
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

# Bundle app source
COPY . .

CMD [ "yarn", "start" ]