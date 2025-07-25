FROM node:18

WORKDIR /app

# Copy the whole monorepo
COPY . .

# Move into the http-backend app directory
WORKDIR /app/apps/http-backend

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start"] 