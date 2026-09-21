FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --workspace=apps-web --no-audit --no-fund || true
COPY . .
RUN npm run build --workspace=apps-web
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=apps-web"]
