# Stage 1: Build the frontend
FROM node:22 AS builder

WORKDIR /app

# Copy full project
COPY . ./

# Install frontend deps & build
RUN npm install
RUN npm run build

# Stage 2: Final image with server only
FROM node:22

WORKDIR /app

# Copy backend code and install server deps
COPY --from=builder /app/server ./server
WORKDIR /app/server
RUN npm install

# Copy built frontend + public assets into server folder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/public ./public


EXPOSE 3000
CMD ["node", "server.js"]
