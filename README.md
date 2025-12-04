
# 👻 GhostBusters Enterprise – Backend Service

A school project set in a spoof enterprise world of **GhostBusters**. This repository hosts the backend API and supporting infrastructure.

Built with **Node.js + Express**, **MySQL**, **Python + PyTest**, and containerized via **Docker**. CI runs automated tests and publishes documentation with **dbdocs**.

---

## 🚀 Features
- RESTful API using **Express** (Node.js)
- **MySQL** relational database with migrations/seed data
- **Docker** & **docker-compose** for local dev and reproducible environments
- **CI** for automated testing and docs publication (dbdocs)
- **Python** utility scripts and **PyTest** test suite
- Environment-driven configuration (`.env`)

---

## 🏗️ Architecture Overview

```
+--------------------+          +---------------------+
|  Client (Future)   |  --->    |  Backend API        |
|  Web/Mobile        |          |  Node.js + Express  |
+--------------------+          +----------+----------+
                                            |
                                            v
                                     +------+------+
                                     |   MySQL     |
                                     |   RDBMS     |
                                     +------+------+
                                            |
                                            v
                                    +-------------+
                                    | Python      |
                                    | Utilities & |
                                    | PyTest      |
                                    +-------------+
```

**Data Flow:** Clients call the Express API. The API reads/writes to MySQL. Python utilities assist with data tasks and are validated with PyTest. CI orchestrates tests and documentation builds.

---

## 📦 Tech Stack
- **Runtime:** Node.js (Express)
- **Database:** MySQL
- **Scripting & Tests:** Python, PyTest
- **Containers:** Docker, docker-compose
- **Documentation:** dbdocs
- **CI:** GitHub Actions (or similar)

---

## 🐳 Quick Start (Docker)

> Prerequisites: Docker Desktop (or Docker Engine), Docker Compose, and a `.env` file.

1. **Copy environment file**
   ```bash
   cp .env.example .env
   ```
   Set values like:
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=mysql
   DB_PORT=3306
   DB_USER=ghostbuster
   DB_PASSWORD=spooky-secret
   DB_NAME=ghostbusters
   ```

2. **Build and start containers**
   ```bash
   docker-compose up --build
   ```

3. **Verify services**
   - API: http://localhost:${PORT}/health
   - MySQL: mapped on `${DB_PORT}` (internal service name `mysql`)

4. **Run API locally (without Docker)** *(optional)*
   ```bash
   npm install
   npm run dev
   ```

---

## 🧪 Testing

### Backend (Node.js)
```bash
npm test
```

### Python + PyTest
```bash
pytest -q
```

CI runs both suites on push and PR. Coverage reports (if configured) are uploaded as artifacts.

---

## 🗃️ Database & Documentation
- Schema is defined via migration scripts (e.g., `db/migrations`).
- Seed data (e.g., `db/seeds`) bootstraps dev/test environments.
- **dbdocs** publishes schema docs. Local preview:
  ```bash
  npx dbdocs build
  npx dbdocs serve
  ```
  CI can run `dbdocs build` and publish to a project URL.

---

## ⚙️ Configuration
- App config via environment variables in `.env`.
- Dockerfiles for both **API** and **MySQL**.
- `docker-compose.yml` orchestrates service networking, volumes, and healthchecks.

Example `docker-compose.yml` (simplified):
```yaml
version: "3.9"
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:3306"
    volumes:
      - db_data:/var/lib/mysql

  api:
    build: ./api
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_USER: ${DB_USER}
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: ${DB_NAME}
      PORT: ${PORT}
    ports:
      - "${PORT}:3000"

volumes:
  db_data:
```

---

## 🔌 Integration Summary (Enterprise Modules)
This service integrates with other GhostBusters enterprise modules (planned or existing):

- **Ops Console** – Admin UI to monitor ghosts, jobs, and trap inventory.
- **Scheduling Service** – Dispatches crews; consumes backend API endpoints for booking.
- **Billing & Invoicing** – Reads completed jobs and generates invoices.
- **Equipment Registry** – Tracks proton packs, traps, and maintenance logs.
- **Notifications** – Sends emails/SMS for job updates and emergencies.

**Integration Pattern:**
- RESTful endpoints (JSON) exposed by Backend API.
- Shared authentication token strategy (e.g., JWT/OAuth) *(to be finalized).*
- Event hooks/webhooks for job state changes (planned).

---

## 📁 Project Structure (suggested)
```
repo-root/
├─ api/                # Express app
│  ├─ src/
│  ├─ tests/
│  ├─ Dockerfile
├─ db/
│  ├─ migrations/
│  ├─ seeds/
│  └─ docs/            # dbdocs sources
├─ python/
│  ├─ scripts/
│  └─ tests/           # PyTest
├─ .github/workflows/  # CI pipelines
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

---

## 🔒 Security Notes
- Do **not** commit real secrets. Use `.env` and CI secrets.
- Configure least-privilege DB users.
- Add request validation and basic rate limiting in the API.

---

## 🛠️ Development Tips
- Prefer parameterized queries/ORM to avoid SQL injection.
- Add healthcheck endpoints for containers.
- Use multi-stage `Dockerfile` to keep images small.
- Use `make` or npm scripts to streamline common tasks.

---

## 📜 License

This project is licensed under the **MIT License** — a permissive, free license suitable for educational and open-source projects.

```
MIT License

Copyright (c) 2025 GhostBusters Enterprise (School Project)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙌 Acknowledgements
- GhostBusters franchise for thematic inspiration (non-commercial, educational use).
- Open-source communities behind Node.js, MySQL, Python, PyTest, Docker, and dbdocs.

---

## 📣 Contributing
PRs are welcome! Please open an issue to discuss major changes and follow the CI checks.

