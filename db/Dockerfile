FROM debian:bookworm-slim

# Install MariaDB
RUN apt-get update && \
    apt-get install -y mariadb-server && \
    rm -rf /var/lib/apt/lists/*

# Ensure directories exist and fix permissions
RUN mkdir -p /var/lib/mysql /var/run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /var/run/mysqld && \
    chmod 777 /var/run/mysqld

# Force MariaDB to run as mysql (should already be default, but we enforce it)
RUN sed -i 's/\[mysqld\]/[mysqld]\nuser=mysql/' /etc/mysql/mariadb.conf.d/50-server.cnf

# Copy initialization SQL
COPY init.sql /docker-entrypoint-initdb.d/init.sql

# Data volume
VOLUME /var/lib/mysql

# Expose SQL port
EXPOSE 3306

# Switch to the mysql user that already exists
USER mysql

# Start MariaDB
CMD ["mysqld"]
