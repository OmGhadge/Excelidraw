FROM node:18

WORKDIR /app

# Copy the whole monorepo
COPY . .

# Move into the frontend app directory
WORKDIR /app/apps/excelidraw-frontend

RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"] 