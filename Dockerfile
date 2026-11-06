FROM node:22-bookworm AS build
WORKDIR /app
COPY package*.json ./
COPY patches ./patches
RUN npm ci --no-audit --no-fund
COPY src ./src
COPY views ./views
COPY public ./public
COPY tsconfig*.json nest-cli.json tailwind.config.js workbox-config.js ./
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production DATABASE_TYPE=sqlite DATA_PATH=/app/data AUTH_ENABLED=false PWA_ENABLED=true SUPPORTER_PROMPT_ENABLED=false TZ=Asia/Shanghai APP_NAME=双人衣橱
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/views ./views
COPY --from=build /app/public ./public
COPY package*.json LICENSE ./
RUN mkdir -p /app/data
EXPOSE 3000
CMD ["node", "dist/main.js"]
