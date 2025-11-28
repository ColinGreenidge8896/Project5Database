# Use a minimal Linux image as base
FROM debian:bookworm-slim

# Install MySQL server
RUN apt-get update && \
    apt-get install -y mysql-server && \
    rm -rf /var/lib/apt/lists/*

# Copy init.sql into Docker’s MySQL init directory
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Expose MySQL port
EXPOSE 3306

# Run MySQL server in the foreground
CMD ["mysqld"]
