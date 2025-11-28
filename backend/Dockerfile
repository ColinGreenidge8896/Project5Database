# Use Debian base and install Node
FROM debian:bookworm-slim

RUN apt-get update && \
    apt-get install -y curl python3 make g++ && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json first (better caching)
COPY package*.json ./

RUN npm install

# Copy backend source code
COPY . .

# Expose API port
EXPOSE 3000

# Run backend
CMD ["node", "src/server.js"]
