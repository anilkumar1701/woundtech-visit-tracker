FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 4000

# IPv4-first DNS avoids Docker Desktop's unroutable IPv6 path to Neon.
ENV NODE_OPTIONS=--dns-result-order=ipv4first

COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

ENTRYPOINT ["/app/docker-entrypoint.sh"]
