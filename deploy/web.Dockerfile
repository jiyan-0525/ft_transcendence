FROM node:22-alpine AS build
WORKDIR /web
COPY packages/web/package.json packages/web/package-lock.json ./
RUN npm ci
COPY packages/web/ ./
ENV VITE_USE_MOCKS=false VITE_API_URL=/api VITE_WS_URL=/ws
RUN npm run build

FROM caddy:2-alpine
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /web/dist /srv
