# FRONTEND DOCKERFILE
# Part 1: build React   Part 2: serve with nginx

FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Copy only source files (NOT node_modules — keeps build small and reliable)
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src

ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

# Copy built website from part 1
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config written here (no separate file copy — avoids Windows Docker errors)
RUN printf '%s\n' \
  'server {' \
  '    listen 80;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '    location / { try_files $uri $uri/ /index.html; }' \
  '}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
