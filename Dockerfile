FROM node:22-bookworm-slim
WORKDIR /app
COPY package*.json ./
RUN --mount=type=secret,id=proxy_ca NODE_EXTRA_CA_CERTS=/run/secrets/proxy_ca npm ci
COPY . .
EXPOSE 5173 3001
CMD ["npm", "run", "dev"]
