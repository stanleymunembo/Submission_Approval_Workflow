# BACKEND DOCKERFILE

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy only what the server needs (NOT node_modules)
COPY src ./src

EXPOSE 4000

CMD ["npm", "start"]
