# 可通过 --build-arg NODE_IMAGE=node:24-alpine 覆盖基础镜像。
ARG NODE_IMAGE=node:24-alpine

# 依赖安装：只复制清单，利用缓存；跳过 postinstall，避免在源码未就位时执行 nuxt prepare。
FROM ${NODE_IMAGE} AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts

# 构建：复制源码和 content，构建时完成内容校验与 Nuxt 产物生成。
FROM ${NODE_IMAGE} AS build
WORKDIR /app/frontend
ENV NUXT_CONTENT_DIR=/app/content
COPY --from=deps /app/frontend/node_modules ./node_modules
COPY frontend/ ./
COPY content /app/content
RUN npm run build

# 运行：只保留 Nitro 产物和内容，使用非 root 用户。
FROM ${NODE_IMAGE} AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NUXT_CONTENT_DIR=/app/content
COPY --from=build --chown=node:node /app/frontend/.output ./.output
COPY --from=build --chown=node:node /app/content ./content
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1
CMD ["node", ".output/server/index.mjs"]
