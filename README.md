# TaskManager API

A small REST API for managing tasks, built specifically as the project for the
SIT223/SIT753 High Distinction Task 7.3HD (DevOps Pipeline with Jenkins).

## What it does

- CRUD operations on tasks (`/tasks`) - create, list, get one, update, delete
- API-key authentication on all `/tasks` endpoints (`x-api-key` header)
- `/health` - liveness endpoint used by the pipeline's Monitoring stage
- `/metrics` - Prometheus-format metrics endpoint (request counts, default
  Node.js process metrics via `prom-client`)

## Tech stack

- Node.js + Express
- Jest + Supertest for unit and integration tests
- Docker for containerisation
- Docker Compose for staging/production deployment configs
- SonarCloud for code quality analysis
- npm audit for dependency security scanning
- Jenkins Extended Email plugin for monitoring alerts

## Running locally

```
npm install
npm start
```

The API listens on port 3000 by default (`PORT` env var to override).
Set `API_KEY` to override the default `dev-local-key` used for the
`x-api-key` header on `/tasks` requests.

## Running the tests

```
npm test
```

Runs both unit tests (`test/tasks.test.js`, testing the data layer directly)
and integration tests (`test/api.test.js`, testing the full HTTP API with
Supertest), and produces a coverage report at `coverage/lcov.info`.

## Running with Docker

```
docker build -t taskmanager-api:latest .
docker compose -f docker-compose.staging.yml up -d
```

The staging container is exposed on port 3001. The production compose file
(`docker-compose.prod.yml`, port 3002) is brought up by the Jenkins pipeline's
Release stage after the image has been promoted with the `:production` tag.

## CI/CD pipeline

See `Jenkinsfile` for the full 7-stage Jenkins pipeline: Build, Test, Code
Quality, Security, Deploy, Release, Monitoring.
