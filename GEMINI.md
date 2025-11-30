# E-Commerce Website Context for Gemini

This `GEMINI.md` file provides essential context, architectural details, and operational commands for the e-commerce project. Use this as a reference for all future interactions.

## 1. Project Overview

This is a full-stack e-commerce application composed of a Node.js/Express backend and a React frontend. It uses Sequelize for database ORM and is containerized using Docker Compose.

### Key Technologies
- **Backend (`Be-ecommerce`):** Node.js, Express.js, Sequelize (ORM), Socket.io (Real-time), JWT (Auth), PostgreSQL (Prod DB), SQLite (Dev DB).
- **Frontend (`Fe-commerce`):** React.js, Redux Toolkit (State), RTK Query (Data Fetching), SCSS, Bootstrap/Material UI.
- **Infrastructure:** Docker, Docker Compose, Nginx (Frontend Server).

## 2. Architecture & Directory Structure

### Root Directory
- `docker-compose.yml`: Orchestrates `postgres`, `backend`, and `frontend` services.
- `init-db.sh`: Database initialization script.

### Backend (`Be-ecommerce/`)
The backend follows a Controller-Service-Model pattern.
- **Entry Point:** `src/sever.js` (initializes Express, Socket.io, Database connection).
- **API Routes:** `src/routes/api.js` (defines endpoints like `/api/user/login`, `/api/clothes/get`).
- **Controllers (`src/controllers/`):** Handle HTTP requests/responses.
- **Services (`src/serivces/`):** Handle business logic and DB interactions. Returns `{ DT, EC, EM }`.
- **Models (`src/models/`):** Sequelize definitions (User, Product, Bill, etc.).
- **Migrations (`src/migrations/`):** Schema changes.
- **Middleware (`src/middleware/`):** `JWTservice.js` (Auth), `SocketIO.js`, `OpenAI.js`.

### Frontend (`Fe-commerce/`)
A React application customized with `craco`.
- **Entry Point:** `src/index.js` & `src/App.js`.
- **Routing:** `src/route/RouteIndex.js` (defines paths and layouts).
- **State Management:** Redux Toolkit (`src/store/`).
- **API Calls:** RTK Query (`src/store/slice/API/`) and Axios (`src/config/axios.js`).
- **UI Components:** Organized by feature in `src/container/` (Home, Product, System/Admin).
- **Styling:** SCSS files co-located with components.

## 3. Development Workflow & Commands

### Prerequisites
- Node.js & npm
- Docker & Docker Compose (optional but recommended)

### Quick Start (Docker)
To run the full stack (DB + BE + FE):
```bash
docker-compose up --build
```

### Local Development (Manual)

#### Backend (`cd Be-ecommerce`)
1.  **Install Dependencies:** `npm install`
2.  **Database Setup (SQLite for fast dev):**
    *   Ensure `sequelize-cli` is available (`npm install -g sequelize-cli` or use `npx`).
    *   Run Migrations: `npx sequelize-cli db:migrate`
    *   Seed Data: `npx sequelize-cli db:seed:all`
3.  **Start Server:** `npm start` (Runs on port 8080 by default)
    *   *Note:* Check `.env` or default config for DB credentials. For local sqlite, set `DATABASE_DIALECT=sqlite`.

#### Frontend (`cd Fe-commerce`)
1.  **Install Dependencies:** `npm install`
2.  **Environment Setup:** Create `.env` if needed (default `REACT_APP_API_URL=http://localhost:8080`).
3.  **Start App:** `npm start` (Runs on port 3000)

## 4. Coding Conventions & Patterns

### Backend
- **Response Format:** All API responses must adhere to: `{ DT: <Data>, EC: <ErrorCode>, EM: <ErrorMessage> }`. `EC: 0` is success.
- **Controller/Service Split:** Controllers parse `req.body`/`req.query` and call Services. Services interact with Models and return the standard response object.
- **Auth:** Cookie-based JWT. Middleware `checkCookieService` validates tokens. Public routes are defined in `exceptionPath` in `JWTservice.js`.

### Frontend
- **API Interaction:** Use RTK Query endpoints defined in `src/store/slice/API/*.js`. Avoid raw Axios calls in components where possible.
- **Structure:** Feature-based folders in `src/container/`. Each feature folder contains its Components and SCSS.
- **Redux:** Slices are in `src/store/slice/Reducer/`.

## 5. Common Tasks

- **Adding a Model:**
    1.  Generate model & migration: `npx sequelize-cli model:generate --name <Name> --attributes <attrs>`
    2.  Run migration: `npx sequelize-cli db:migrate`
    3.  Register associations in `src/models/<name>.js` and `src/models/index.js`.

- **Adding an API Endpoint:**
    1.  Create Service method in `src/serivces/`.
    2.  Create Controller method in `src/controllers/`.
    3.  Define Route in `src/routes/api.js`.
    4.  (Frontend) Add endpoint to `src/store/slice/API/`.

## 6. Important Environment Variables
- **Backend:** `PORT`, `DATABASE_DIALECT` (postgres/sqlite), `JWT_SECRET`, `REACT_URL`.
- **Frontend:** `REACT_APP_API_URL`.
