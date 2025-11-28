# Use local Node.js image from Debian (no Docker Hub pull)
FROM debian:bookworm-slim

# Install Node.js manually
RUN apt-get update && \
    apt-get install -y curl python3 make g++ && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend code
COPY . .

# Expose backend port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
