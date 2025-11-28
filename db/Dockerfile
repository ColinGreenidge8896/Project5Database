# Use minimal Debian image
FROM debian:bookworm-slim

# Install MariaDB (MySQL replacement)
RUN apt-get update && \
    apt-get install -y mariadb-server && \
    rm -rf /var/lib/apt/lists/*

# Copy initialization SQL
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Expose MySQL port
EXPOSE 3306

# Start MariaDB in foreground
CMD ["mysqld"]
