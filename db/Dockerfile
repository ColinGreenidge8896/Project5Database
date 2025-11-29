FROM debian:bookworm-slim

# Install MariaDB
RUN apt-get update && \
    apt-get install -y mariadb-server && \
    rm -rf /var/lib/apt/lists/*

# Ensure directories exist and fix permissions
RUN mkdir -p /var/lib/mysql /var/run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /var/run/mysqld && \
    chmod 777 /var/run/mysqld

# Allow external connections
RUN sed -i "s/^bind-address.*/bind-address = 0.0.0.0/" /etc/mysql/mariadb.conf.d/50-server.cnf

# Init script
COPY init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 3306

# Must run mysqld as mysql explicitly
CMD ["mysqld"]
