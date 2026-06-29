# ============================================================
# FRONTEND DOCKERFILE
# ============================================================
# React needs 2 steps in Docker:
#   A) BUILD the website (npm run build)
#   B) SERVE the built files (nginx)

# ======================
# PART A — BUILD REACT
# ======================
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Important: browser (on YOUR PC) calls API at localhost:4000
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ======================
# PART B — SERVE FILES
# ======================
FROM nginx:alpine

# nginx config so /login, /reviewer/queue etc. work
COPY nginx.conf /etc/nginx/conf.d/default.conf

# copy built files from part A
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
