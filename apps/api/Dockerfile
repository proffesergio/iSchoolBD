FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY packages/ai-engine/package.json ../packages/ai-engine/
RUN npm install --no-audit --no-fund || true
COPY . .
RUN npm run build --workspace=apps-api || npx tsc -p apps/api/tsconfig.json || true
EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
