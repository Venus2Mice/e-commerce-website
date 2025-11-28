# Giải thích Backend — Be-ecommerce

## ✅ Tổng quan
- Backend nằm trong thư mục `Be-ecommerce`.
- Sử dụng Node.js + Express và Sequelize (ORM) cho truy vấn DB.
- Sequelize hỗ trợ nhiều dialect (Postgres, MySQL, SQLite) — định nghĩa bằng biến môi trường `DATABASE_DIALECT`.
- Socket.io được dùng cho realtime (chat, cập nhật) và xác thực dựa trên cookie/JWT thông qua middleware.
- API được định nghĩa dưới `namespace /api` (xem `src/routes/api.js`).
- Sử dụng `sequelize-cli` để tạo migration và seeders; các file để ở `src/migrations` và `src/seeders`.

---

## 📁 Các file & thư mục chính
- `package.json` — scripts start/build và dependency.
- `src/sever.js` — entry server, cấu hình middleware, route và socket.
- `src/config/` — config DB, CORS, view engine, connect DB.
- `src/routes/` — định nghĩa API routes và web routes.
- `src/controllers/` — controller nhận request, gọi service, trả response.
- `src/serivces/` — business logic, giao tiếp DB qua models.
- `src/models/` — các Sequelize model và file `index.js` để khởi associations.
- `src/middleware/` — JWT auth, SocketIO, OpenAI etc.
- `src/migrations/`, `src/seeders/` — migration & seeders.

---

## 🎯 Khởi tạo server & luồng request (tóm tắt)
1. `src/sever.js` khởi tạo Express app và đăng ký middleware (CORS, body parser, cookie parser).
2. Đăng ký route API & web: `initApiRoutes`, `initWebRoutes`.
3. Kết nối DB bằng `connectToDataBase()`.
4. Khởi socket io và attach `socketService(io)`.
5. Lắng nghe port (mặc định `PORT=8080`).

Luồng request mẫu:
HTTP request -> `src/routes/api.js` -> Controller (`src/controllers/*`) -> Service (`src/serivces/*`) -> Model (`src/models/*`) -> DB.

Nguyên tắc: Controller mỏng (parse/validate) — Service chứa logic nghiệp vụ và tương tác DB; Service trả chuẩn `{ DT, EC, EM }`.

---

## 🔧 Biến môi trường quan trọng
- `PORT` — cổng server.
- `DATABASE`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` — cấu hình DB.
- `DATABASE_DIALECT` — `postgres|mysql|sqlite`.
- `DATABASE_STORAGE` — file sqlite local (nếu dùng sqlite).
- `JWT_SECRET` — secret dùng để ký JWT.
- `REACT_URL`, `HOST_URL` — các biến liên quan FE.

---

## 📦 DB & ORM (Sequelize)
- Sử dụng `sequelize-cli` để tạo và chạy migrations/seeders.
- `src/models` chứa định nghĩa các model với `Model.init` và `associate`.
- Migrations mẫu tạo bảng dùng `up`/`down` để chạy/rollback.

Ví dụ model và migration cho `ContactMessage` (mô phỏng) có thể dùng để minh hoạ cách thêm data table.

---

## 🔄 Chuẩn response API
- Mọi endpoint trả về đối tượng `{ DT, EC, EM }`:
  - `DT`: dữ liệu trả về
  - `EC`: error code (0 = success)
  - `EM`: error message

Controllers nên sử dụng try/catch và trả response có cấu trúc chuẩn; services xử lý lỗi DB và trả `EC: -1` khi lỗi.

---

## 🔐 Middleware & auth
- `JWTservice` xử lý cookie/JWT, gồm `checkCookieService` (kiểm tra bỏ qua exceptionPath) và `authenticateCookieService` (kiểm quyền dựa trên `Group`/`Role`).
- Để mở route public, thêm path vào `exceptionPath` trong `JWTservice`.
- `OpenAI` middleware xử lý gọi API OpenAI.

---

## 🔊 Socket IO (tóm tắt)
- `SocketIO.js` định nghĩa event: `CREATE_ROOM`, `JOIN_ROOM`, `NEW_MESSAGE`, `FIND_ALL_ROOM`.
- Tất cả event persist vào DB (`Room`, `Message`) để lưu lịch sử chat.
- Khi mở rộng socket: đặt logic xử lý ở service (ví dụ `messageService`) để tách luồng DB và socket.

---

## 📋 Migrations, Seeders & Dev DB
- Tạo migration: `npx sequelize-cli model:generate --name X --attributes ...`.
- Chạy migration: `npx sequelize-cli db:migrate`.
- Chạy seeders: `npx sequelize-cli db:seed:all`.
- Dùng sqlite local để dev nhanh: set `DATABASE_DIALECT=sqlite` và `DATABASE_STORAGE=./database.sqlite`.

---

## 🛠 Cách thêm API mới (pattern)
1. Tạo migration & model nếu cần.
2. Viết service (tương tác DB + nghiệp vụ) trong `src/serivces/`.
3. Viết controller trong `src/controllers/` để xử lý request/response.
4. Đăng ký route trong `src/routes/api.js`.
5. Viết unit test cho service và integration test cho controller (ví dụ `supertest`).
6. Thêm seed nếu cần.

---

## ❗ Gợi ý triển khai & lưu ý
- CORS: nếu backend trả cookie, FE phải gửi cookie (axios `withCredentials`) và server phải cho phép `Access-Control-Allow-Credentials`.
- Prod: chạy migration trong CI trước khi deploy.
- DB SSL: bật `DATABASE_SSL` và `dialectOptions` khi dùng Postgres/Cloud DB.
- Ảnh/Upload: chú ý `formidable` & cấu hình body parser để không gây xung đột.

---

## 🧭 Nơi mở rộng & mapping route nhanh
- Các endpoint hiện có nằm trong `src/routes/api.js` (vd: user, clothes, bill, review, webhook, openAI, socket id).
- Nếu cần thêm route có auth: tạo Role & Group mapping trong DB và seeder; cho phép route theo permission.

---

## ✅ Các lệnh cần nhớ
- Chạy server dev: `npm install && npm start` (từ `Be-ecommerce`).
- Migrate/seed: `npx sequelize-cli db:migrate` và `npx sequelize-cli db:seed:all`.
- Build production: Dùng Dockerfile hoặc `npm run build-src`/`npm run build` (tuỳ thiết lập).

---

Nếu bạn muốn, mình có thể:
- Thêm ví dụ chi tiết `ContactMessage` endpoint (model + migration + service + controller + route + seeder + test).
- Thêm hướng dẫn cấu hình CI để chạy migration & tests tự động.
# Backend Explanation — Be-ecommerce

## ✅ Overview
- Backend is in `Be-ecommerce` folder.
- Built with Node.js + Express and Sequelize (ORM).
- Sequelize supports multiple dialects (PostgreSQL, MySQL, SQLite); use `DATABASE_DIALECT` env var.
- Socket.io is used for real-time features; JWT + cookie-based authentication in middleware.
- API routes are namespaced under `/api` (defined in `src/routes/api.js`).
- Project uses Sequelize CLI for migrations and seeders; migrations and seeders are in `src/migrations` & `src/seeders`.

---

## 📁 Key files & directories
- `package.json` — start scripts, build scripts, dependencies.
- `src/sever.js` — server entry point: sets up Express, body parsing, cookie parser, routes, socket.
- `src/config/`:
  - `config.js` — DB config for environments (development/test/production).
  - `connectDb.js` — Sequelize instance and `connectToDataBase()` function.
  - `cors.js`, `viewEngine.js` — express middleware.
- `src/routes/` — route loaders: `api.js`, `web.js`.
- `src/controllers/` — controllers that parse request and call services.
- `src/serivces/` — business logic interacting with models (DB calls).
- `src/models/` — Sequelize model definitions; `index.js` constructs associations.
- `src/middleware/` — JWT auth, SocketIO, OpenAI.
- `src/migrations/` — Sequelize migration files for schema.
- `src/seeders/` — initial data seeders.

---

## 🎯 How server bootstraps (quick)
1. `sever.js` initialises Express.
2. Loads config: CORS, view engine, body parser, cookie parser.
3. Registers API and web routes via `initApiRoutes` and `initWebRoutes`.
4. Connects to DB using `connectToDataBase()`.
5. Sets up Socket.io server and attaches middleware using `socketService(io)`.
6. Starts HTTP server on configured `PORT`.

Request flow & design pattern (important):
- HTTP request -> `src/routes/api.js` -> Controller (`src/controllers/*`) -> Service (`src/serivces/*`) -> Model (`src/models/*`) -> DB.
- Controllers are thin: parse/validate request params/body and call service functions. Services contain the business logic and talk to DB via Sequelize models and return the standardized `{ DT, EC, EM }`.

Sample controller->service flow (pseudo):
```js
// controller
import contactService from '../serivces/contactService'
const handleCreateContact = async (req, res) => {
  const body = req.body;
  const response = await contactService.createContactService(body);
  return res.status(200).json(response);
}

// service
import db from '../models';
const createContactService = async (data) => {
  try {
    const newItem = await db.ContactMessage.create({ email: data.email, message: data.message });
    return { DT: newItem, EC: 0, EM: 'OK' };
  } catch(e) { return { DT: '', EC: -1, EM: e.message } }
}
```

---

## 🔧 Environment variables
- `PORT` — server port (default 8080)
- `DATABASE`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_HOST`, `DATABASE_PORT` — database connection settings.
- `DATABASE_DIALECT` — `postgres`, `mysql`, `sqlite` etc. Default used in `connectDb.js`.
- `DATABASE_STORAGE` — path to SQLite file when `sqlite` dialect selected (e.g., `./database.sqlite`).
- `JWT_SECRET` — secret for signing JWT tokens.
- `REACT_URL`, `HOST_URL`, and other environment variables used by frontend-related processes.

---

## 📦 Database & ORM (Sequelize)
- `sequelize-cli` is installed to create migrations and seeders. Config is in `.sequelizerc` and `src/config/config.js`.
- `models` are generated as standard Sequelize model files with `Model.init` and `associate`.
- Migrations include `migration-create-*.js` files in `src/migrations/`.
- Seeders are in `src/seeders/` (e.g., `20250108081337-demo-user.js`).

Add a model example (ContactMessage) and migration example:

`src/migrations/202501XX-create-contact-message.js` (pseudo):
```js
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ContactMessages', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      email: { type: Sequelize.STRING },
      message: { type: Sequelize.TEXT },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ContactMessages');
  }
};
```

Model file `src/models/contactmessage.js` (pseudo):
```js
module.exports = (sequelize, DataTypes) => {
  const ContactMessage = sequelize.define('ContactMessage', {
    email: DataTypes.STRING,
    message: DataTypes.TEXT,
  }, {});
  ContactMessage.associate = function(models) {
    // no associations or add association if needed
  };
  return ContactMessage;
};
```

---

## 🔄 API conventions
- All API responses follow the convention:
  - `DT` — data
  - `EC` — error code (0 for success)
  - `EM` — error message
- Request handlers in controllers have try/catch and return consistent response structure.
- Authentication uses JWT in cookies; `JWTservice` middleware checks cookies and attaches authentication.
- Socket events are handled in `middleware/SocketIO.js`.

Logging & error handling:
 - Controllers should wrap logic in `try/catch` blocks and return `{ DT, EC, EM }` with appropriate HTTP status codes (the project typically returns 200 and relies on explicit EC values to indicate error/success).
 - Services should catch DB errors and return `EC: -1` with `EM` for human readable details; avoid leaking stack traces in production.
 - Consider centralizing logging (winston/pino) for production to capture structured logs and link trace IDs.

Socket flow & events (example):
 - `CREATE_ROOM(adminId, customerId)`: server generates `roomId`, checks if a room for that customer exists; if not it creates a new room in DB and emits a welcome `NEW_MESSAGE` back to the sender.
 - `JOIN_ROOM(customerId)`: server finds the room by `customerId` and loads previous messages (`Message` model) and emits them back to the client using `NEW_MESSAGE` event.
 - `NEW_MESSAGE(adminId, customerId, msg)`: server finds corresponding room, inserts a new `Message` in DB and broadcasts to clients with `io.emit('NEW_MESSAGE', payload)`.
 - `FIND_ALL_ROOM()`: returns all `Room` rows.

Notes:
 - The socket implementation uses `db.Room` and `db.Message` to persist chat state.
 - When adding new socket features, register new events in `SocketIO.js`, and keep the handlers' logic small by calling service layer functions where appropriate (e.g., `messageService.createMessage`).

---

## ⚙️ Middleware / Services
- `JWTservice` — cookie authentication. Provides `checkCookieService` & `authenticateCookieService`.
- `OpenAI` middleware — provides wrapper around OpenAI calls for `GET /api/openAI/get`.
- `SocketIO` — sets up socket listeners and room management.
- `webHookController` — for receiving payment provider webhooks (e.g., `POST /api/hooks/payment`).

JWT middleware details:
 - `JWTservice.checkCookieService` inspects `req.path` and either skips verification for `exceptionPath` (public routes) or verifies `req.cookies.user` using `JWT_SECRET`.
 - If a token is missing or invalid, the middleware returns `EC 404` or `EC 401` with corresponding message.
 - `authenticateCookieService` verifies user group permissions using `Group`/`Role` association: it loads group roles and checks if `path` matches any role's `url`.
 - To make a route public (no auth required), add its path into `exceptionPath` array in `src/middleware/JWTservice.js`.

Example `exceptionPath` (already present in the project):
```
const exceptionPath = ['/', '/api/user/login', '/api/user/register', '/api/account', '/api/clothes/get', '/api/hooks/payment', '/api/review/get', '/socket.io/', '/api/openAI/get']
```

Permission mapping:
 - `Group` and `Role` tables represent role-based access control; the `Group` has many `Role`s through `Group_Role` and `authenticateCookieService` checks if a request path matches a role's `url`.

---

## 🔍 Testing & Local Development
- `package.json` uses `nodemon` and `@babel/node` for development: `npm start` runs the server with Babel.
- For migrations/seeding:
  - `npx sequelize-cli db:migrate` to run migrations
  - `npx sequelize-cli db:seed:all` to run all seeders
- Local DB: by default `connectDb.js` uses SQLite when `DATABASE_DIALECT` is set to `sqlite`.

Debugging tips:
 - Database connection issues: check env variables in `.env`, `DATABASE_DIALECT`, and logs from `connectDb.js`. If you see `Unable to connect`, confirm DB server is running and port matches.
 - Migration failures: check the Sequelize migration file syntax, and use `npx sequelize-cli db:migrate:status` to see current state.
 - Use SQLite for quick local testing: set `DATABASE_DIALECT=sqlite` and `DATABASE_STORAGE=./database.sqlite` to avoid running Postgres locally.
 - If you change models, generate new migration and run `npx sequelize-cli db:migrate`.

Testing suggestions:
 - Add unit tests for service functions with an in-memory sqlite DB or use `sqlite` file and teardown it during tests.
 - Integration tests for routes: use `supertest` to load express app and call endpoints.
 - Setup CI to run migrations and tests in a clean environment before merging.
 - Example `test` script suggestion in `package.json`:
 ```json
 "test": "cross-env NODE_ENV=test mocha --timeout 10000 --recursive src/tests"
 ```

---

## 🚢 Docker & Deployment
- Docker image can be built using `Be-ecommerce/Dockerfile`.
- Docker Compose integrates backend with `postgres` service defined in the root `docker-compose.yml`.
- `docker-compose up --build` builds backend and frontend images and runs stack.

Deployment considerations & common pitfalls:
 - CORS & Cookie: If backend issues cookies to the FE, the FE must use `withCredentials` and the server must set correct `Access-Control-Allow-Credentials` and `Access-Control-Allow-Origin` headers.
 - Database migrations must be run on deploy; in CI/CD run `npx sequelize-cli db:migrate` before starting the server.
 - For production use `DATABASE_SSL` and `dialectOptions` to secure connections (see `connectDb.js`).
 - File uploads: this project uses `formidable` — ensure `body-parser` / file size config matches `formidable` settings.
 - Timezones: Sequelize stores time using DB timezone — confirm that app and DB timezone are aligned.

---

## 🧭 Where to extend
- Add a new API: implement service function (in `src/serivces`), controller function (in `src/controllers`), add route (in `src/routes/api.js`), and if database changes needed: add model & migration (`src/migrations` & `src/models`).

If adding a new route and permissioning:
 - Public route (no auth): add its path to `JWTservice.exceptionPath` (or place it in a separate public router not guarded by JWT middleware).
 - Protected route: require adding a Role entry in DB mapping to `url` and ensure appropriate `Group` has access via `Group_Role` table.
 - Add DB migrations and seeders that create the relevant Role & Group mappings.

Routes mapping (quick reference):
 - GET `/api/account` -> `userController.handleAccount`
 - GET `/api/user/login` -> `userController.handleLogin`
 - POST `/api/user/register` -> `userController.handleRegister`
 - GET `/api/user/get` -> `userController.handleGetUser`
 - PUT `/api/user/update` -> `userController.handleUpdateUser`
 - POST `/api/clothes/create` -> `clothesController.handleCreateClothes`
 - GET `/api/clothes/get` -> `clothesController.handleGetClothes`
 - PUT `/api/clothes/update` -> `clothesController.handleUpdateClothes`
 - DELETE `/api/clothes/delete` -> `clothesController.handleDeleteClothes`
 - POST `/api/bill/create` -> `billController.handleCreateBill`
 - PUT `/api/bill/update` -> `billController.handleUpdateBill`
 - GET `/api/bill/get` -> `billController.handleGetBill`
 - DELETE `/api/bill/delete` -> `billController.handleDeleteBill`
 - POST `/api/hooks/payment` -> `webHookController.handleGetPayment`
 - POST `/api/review/create` -> `reviewController.handleCreateReview`
 - PUT `/api/review/update` -> `reviewController.handleUpdateReview`
 - GET `/api/review/get` -> `reviewController.handleGetReview`
 - DELETE `/api/review/delete` -> `reviewController.handleDeleteReview`
 - GET `/api/socket.io` -> `userController.handleGetRoomId`
 - GET `/api/openAI/get` -> `implementOpenAIService`

---

## ✅ Important Commands
- Start local dev: `npm install && npm start` (from `Be-ecommerce`)
- Build for prod: `npm run build-src && npm run build` (if using build script), or use Docker.
- Run Sequelize migration & seed:
  - `npx sequelize-cli db:migrate`
  - `npx sequelize-cli db:seed:all`

Quick setup for local dev with sqlite:
```bash
# from Be-ecommerce
export DATABASE_DIALECT=sqlite
export DATABASE_STORAGE=./database.sqlite
npm install
npm start
```

Quick setup for docker compose stack:
```bash
# from repo root
docker-compose up --build
```

---

If you'd like, I can also:
- Provide a step-by-step example for adding a new `Contact` message endpoint (controller + service + route + migration + seeder).
- Add endpoint templates and migration helper scripts.

Next steps & suggestions:
 - Add integration tests for controllers with `supertest` and `mocha/jest`.
 - Add a small logging library like `winston` for structured logs and link logs to request IDs.
 - Add CI that runs `npx sequelize-cli db:migrate` with a test DB and runs unit/integration tests on PRs.
 - Consider adding small API rate-limiting middleware or throttling if public endpoints are exposed.
