# Mô tả chi tiết các file Backend (BE)

Tập tin này mô tả chi tiết các file quan trọng trong `Be-ecommerce` và `Be-ecommerce/src`, bao gồm mục đích, lý do thiết kế và ảnh hưởng lên toàn bộ dự án.

---

## File gốc dự án

- `package.json`
  - Mục đích: chứa metadata dự án và scripts dùng cho dev/production. `start` sử dụng `nodemon` + Babel.
  - Lý do: `nodemon` + Babel chạy mã nguồn ES6+ trực tiếp trong dev, nhanh chóng và tiện lợi.

- `Dockerfile`
  - Mục đích: tạo image container chạy backend.
  - Lý do: Container hoá giúp đảm bảo môi trường giống nhau và dễ deploy.

- `.sequelizerc` (không hiển thị trong repo nhưng dùng vì tồn tại) — dùng để cấu hình `sequelize-cli` trỏ tới thư mục migrations/models.

---

## Entry point & khởi tạo

- `src/sever.js`
  - Mục đích: khởi tạo Express app, cấu hình view engine, body parser, cookie parser, route, kết nối DB và socket.
  - Lý do: Tập trung startup logic ở 1 nơi để dễ đọc và quản lý.
  - Các bước chính:
    1. Cấu hình `viewEngine`, `CORS`.
    2. Body parser & cookie parser.
    3. Đăng ký route API & web.
    4. Kết nối DB bằng `connectToDataBase()`.
    5. Thiết lập Socket.IO và gọi `socketService(io)`.

---

## Thư mục `config`

- `src/config/config.js`
  - Mục đích: cấu hình DB cho `development`, `test`, `production`, lấy từ env.
  - Lý do: `sequelize-cli` và runtime dùng cùng config để migrate/db.

- `src/config/connectDb.js`
  - Mục đích: tạo Sequelize instance, export `connectToDataBase()`.
  - Lý do: Hỗ trợ nhiều dialect (sqlite cho dev; postgres/mysql cho production) và config `dialectOptions` cho SSL.

- `src/config/cors.js` & `src/config/viewEngine.js`
  - Mục đích: Cấu hình CORS và template engine (EJS) nếu cần.

---

## Route

- `src/routes/api.js` (route chính cho API)
  - Mục đích: định nghĩa endpoint, mount controllers và áp dụng middleware `JWTservice` cho các route cần auth.

- `src/routes/web.js`
  - Mục đích: route cho các trang server-rendered hoặc webhook dùng HTML.

---

## Controllers (lớp mỏng)

Nguyên tắc: Controllers nên mỏng, chỉ parse/validate params và gọi service. Logic phức tạp để service xử lý.

- `src/controllers/userController.js` — xử lý login, register, get user, update user.
- `src/controllers/clothesController.js`, `billController.js`, `reviewController.js`, `webHookController.js` — xử lý tương ứng domain.

Lý do cấu trúc: Controller trả về chuẩn `{ DT, EC, EM }` (DT: dữ liệu; EC: mã lỗi; EM: thông báo) để FE dễ xử lý.

---

## Services (business logic)

Nguyên tắc: Services chứa logic nghiệp vụ, truy vấn DB thông qua `db` models, xử lý transactions nếu cần.

- `src/serivces/userService.js`, `clothesService.js`, `billService.js`, `reviewService.js`, `webHookService.js`.
  - Mục đích: Tập trung logic DB & nghiệp vụ, dễ test bằng cách mock `db`.

---

## Models & Sequelize

- `src/models/index.js`
  - Tự động load các model, thiết lập `associate` và export `db` gộp gồm sequelize instance.

- `src/models/*` (ví dụ: `user.js`, `bill.js`, `clothes.js`, `message.js`, `room.js`, ...)
  - Mục đích: định nghĩa schema, associations.
  - Lý do: Sequelize giúp viết code DB theo mô hình object và có migrations để track schema.

---

## Migrations & Seeders

- `src/migrations/*`
  - Mục đích: tạo/đổi/drop bảng thông qua `up`/`down`.
  - Lý do: Dùng migrations để version hoá schema, dễ rollback.

- `src/seeders/*`
  - Mục đích: chèn dữ liệu demo (roles, groups, admin) để setup nhanh môi trường dev/demo.

---

## Middleware

- `src/middleware/JWTservice.js`
  - Mục đích: Xác thực bằng cookie chứa JWT, kiểm quyền truy cập theo `Group`/`Role`.
  - Cách hoạt động: `checkCookieService` kiểm `exceptionPath` để bỏ qua route public, nếu không có cookie sẽ trả `EC: 404` hoặc `401`.
  - `authenticateCookieService` kiểm quyền truy cập dựa trên `Group` -> `Role` mapping.

- `src/middleware/SocketIO.js`
  - Mục đích: Đăng ký các event socket như `CREATE_ROOM`, `JOIN_ROOM`, `NEW_MESSAGE` và lưu message vào DB.

- `src/middleware/OpenAI.js`
  - Mục đích: wrapper gọi OpenAI API, tách biệt logic AI ra service riêng.

---

## Ví dụ event Socket
- `CREATE_ROOM(adminId, customerId)`: nếu không có room cho `customerId` thì tạo, emit `NEW_MESSAGE` chào.
- `JOIN_ROOM(customerId)`: load tất cả message trong room và emit cho client.
- `NEW_MESSAGE(adminId, customerId, msg)`: lưu message vào DB và broadcast message cho các client.

Lý do lưu chat: để có lịch sử, hỗ trợ offline và audit/kiểm duyệt.

---

## Patterns & Quy ước

- Response chuẩn `{ DT, EC, EM }` để FE dễ dùng (EC: 0 là thành công).
- Kiến trúc: Controller mỏng / Service nặng.
- Mẫu: Mọi cập nhật model phải theo migration (migrate-first).

---

## Mẹo debug & lỗi hay gặp

- 401 Unauthorized: kiểm tra `JWT_SECRET`, cookie, `JWTservice`.
- Connection error: check env (DATABASE_DIALECT, DATABASE_HOST).
- Migrations: chạy `npx sequelize-cli db:migrate:status` để xem trạng thái.
- Socket fail: confirm port/server socket match và client connect đúng url.

---

## Thêm endpoint mới (Hướng dẫn ngắn)

1. Tạo migration & model: `npx sequelize-cli model:generate --name X --attributes a:string`.
2. Viết service function trong `src/serivces/`.
3. Viết controller trong `src/controllers/`.
4. Đăng ký route tại `src/routes/api.js`.
5. Viết test (unit cho service, integration cho route).
6. Nếu cần seed data, thêm vào `src/seeders`.

---

## Khuyến nghị cải tiến

- Thêm integration test với `supertest`.
- Thêm logging (`winston` hoặc `pino`).
- Dùng `dotenv-safe` để enforce env var trong CI.
- Thêm eslint/prettier và unit tests cho service quan trọng.

---

Nếu muốn, mình có thể:
1. Thêm endpoint `ContactMessage` hoàn chỉnh (model, migration, service, controller, route, seeder, test).
2. Thêm ví dụ integration test.
3. Tạo README tổng hợp liên kết FE/BE.
# BE Files Detailed Explanation

This document explains each important file in `Be-ecommerce` and `Be-ecommerce/src`, including the purpose of files, the rationale for how they are written, and the impact on the project.

---

## Project root files

- `package.json`
  - Purpose: package metadata and scripts for dev and production build. Scripts include `start` for dev using `nodemon` and Babel.
  - Why: Using `nodemon` + Babel allows running the ES6+ source without pre-compiling in dev. This accelerates iteration.
  - Impact: Faster developer loop and standard Node startup scripts.

- `Dockerfile`
  - Purpose: builds a deployable image for server.
  - Why: Containerization simplifies deployments and ensures environment consistency.
  - Impact: Integration in `docker-compose` allows running the entire stack (FE + BE + DB) locally.

- `.sequelizerc` (used in repo but not shown here)
  - Purpose: config for sequelize-cli to point to `src/migrations`, `src/models`, etc.

---

## Entry point and bootstrapping

- `src/sever.js` (server entry)
  - Purpose: Set up Express app, configure view engine, body parsers, cookie parser, route registrations, DB connection, and socket.
  - Why: Centralizes application initialization; created as a small, readable orchestration file.
  - Impact: Ensures both API and web routes are initialized along with middleware layers. Socket.io is attached to the HTTP server.

  - Details: The server does:
    1. config: `configViewEngine`, `configCors`.
    2. middleware: `body-parser`, `cookie-parser` for parsing requests and cookies.
    3. routes: `initApiRoutes`, `initWebRoutes`.
    4. db connection: `connectToDataBase()`.
    5. socket: `SocketIO` events attach to the server using `socketService`.

---

## Config folder

- `src/config/config.js`
  - Purpose: Sequelize DB configuration for `development`, `test`, `production` (reads from env).
  - Why: Centralized DB config used by `sequelize-cli` and `sequelize` runtime.
  - Impact: Makes switching between MySQL/Postgres/SQLite trivial via `DATABASE_DIALECT`.

- `src/config/connectDb.js`
  - Purpose: Build Sequelize instance and export `connectToDataBase()` function.
  - Why: Provides dialect-specific behavior: uses SQLite for dev if `DATABASE_DIALECT = sqlite`, otherwise Postgres/MySQL.
  - Impact: Developers can quickly use SQLite locally without spinning up Postgres; in production, Postgres is used with `ssl` options if needed.

- `src/config/cors.js`
  - Purpose: configure CORS, set allowed origins, credentials, headers.
  - Why: Ensures FE can talk to BE across origins and send cookies.
  - Impact: Must be correctly set with frontend origin to avoid CORS errors.

- `src/config/viewEngine.js`
  - Purpose: configure server-side view engine (EJS) for some web routes.
  - Why: Some routes or pages may be server-rendered or used for webhook return pages.
  - Impact: EJS views can be used while the rest of API is JSON-based.

---

## Routes

- `src/routes/api.js` — primary API routes
  - Purpose: Define API endpoints and mount controllers; includes JWT auth middleware.
  - Why: Keeps route definitions in one place and use of JWT middleware ensures consistent access control.
  - Impact: Developers add controllers & endpoints in this file or factor out into sub-routers.

- `src/routes/web.js` — server-rendered routes for certain use cases
  - Purpose: View routes for non-API content (e.g. webhook receipt pages or static views).
  - Why: Useful when you want server-based rendering or backend-only endpoints that return HTML.
  - Impact: Keep web & API routing separated.

---

## Controllers (thin layer)

Principle: controllers are thin, focusing on parsing the request and returning responses. Complex logic should be in services.

- `src/controllers/userController.js`
  - Purpose: handles requests: login, register, get user, update user, checks account.
  - Why: thin controller extracts request parameters and calls `userService` for business logic.
  - Impact: Makes testing simpler as `userService` can be unit-tested in isolation.

- `src/controllers/clothesController.js`, `billController.js`, `reviewController.js`, `webHookController.js`
  - Purpose: similarly manage respective domain actions.
  - Why: separation of responsibilities for maintainability.

- `src/controllers/homeController.js`
  - Purpose: generic home or server-side route logic.

Why code structured this way:
- Controller responsibilities: parse request data, validate or sanitize where needed, call service, translate service result to response with `{ DT, EC, EM }`.
- Services return domain-native objects; controllers shape them into API response.

---

## Services (business logic)

Principle: Services contain interactions with `db` models and centralize the business logic.

- `src/serivces/userService.js`
  - Purpose: user-related business logic (login, register, get info, update user).
  - Why: Keep DB operations & logic centralized; testable and reusable across other controllers.
  - Impact: Changes in DB or logic only affect service layer.

- `src/serivces/clothesService.js`, `billService.js`, `reviewService.js`, `webHookService.js`
  - Purpose: domain-specific logic and heavy lifting (creating bills, applying discount logic, webhooks handling).

Why separate service layer:
- Services reduce duplication. A single API that needs to call multiple data models can do so without mixing with request parsing logic.
- Easier to write unit tests that mock `db`.

---

## Models & Sequelize

`src/models` holds Sequelize model definitions and an `index.js` that loads models and attaches `associate` functions.

- `src/models/index.js`
  - Purpose: read model files and create model instances and associations, then export `db` object with `sequelize` instance.
  - Why: Standard pattern for Sequelize projects so `db` can be imported anywhere.
  - Impact: Enables `db.User`, `db.Bill` usage in services easily.

- Individual models (e.g., `user.js`, `clothes.js`, `bill.js`, `review.js`, ...)
  - Purpose: define columns, types, and associations.
  - Why: Central data models represent DB schema and provide ORM niceties.
  - Impact: Model changes are reflected in migration files and DB schema updates.

---

## Migrations & Seeders

- `src/migrations/*` — migration files for each table
  - Purpose: Create / update / drop tables. Each migration file implements `up` and `down`.
  - Why: DB schema is versioned. Migrations allow automated updates & rollbacks.
  - Impact: Must be included in CI to test schema compatibility.

- `src/seeders/*` — seed data for initial state (role & group setup)
  - Purpose: create baseline data for app consumption (e.g., default Admin or Roles).
  - Why: Necessary for local development & demo data.
  - Impact: Simplifies setup & test scenarios.

---

## Middleware

- `src/middleware/JWTservice.js`
  - Purpose: cookie-based JWT auth middleware, checks `cookie` and permissions.
  - Why: Centralize authentication & permission checks, and provide `exceptionPath` for public routes. Checking group roles approach grants fine-grained authorization.
  - Impact: Security layer ensures only allowed users access protected routes; `exceptionPath` allows certain endpoints to remain public (e.g., login, webhooks).

- `src/middleware/SocketIO.js`
  - Purpose: set up socket events for chat & room handling. Handles `CREATE_ROOM`, `JOIN_ROOM`, `NEW_MESSAGE`, etc.
  - Why: Central place for socket handlers keeps real-time logic simple and attached to events.
  - Impact: Persistence of chat to DB via `Room` & `Message` models creates history and reliability.

- `src/middleware/OpenAI.js`
  - Purpose: wrapper or service to call OpenAI APIs.
  - Why: Isolate AI-specific logic for reuse.
  - Impact: Makes AI features easier to manage and test.

---

## Socket events example (detailed)
- `CREATE_ROOM(adminId, customerId)`: If room doesn't exist for `customerId`, create one in `Room` table and emit `NEW_MESSAGE`.
- `JOIN_ROOM(customerId)`: loads previous messages and emits them.
- `NEW_MESSAGE(adminId, customerId, msg)`: persist message and broadcast to clients.

Why persist chat: storing chat as `Message` provides history, offline delivery, and moderation.

---

## Patterns & Conventions

- Response format: `{ DT, EC, EM }` across the API
  - DT: Data payload
  - EC: Error code (0 = success)
  - EM: Error message string
  - Why: Consistency across apps for the FE to parse standard responses.

- Thin Controller / Fat Service
  - Controllers validate and shape requests; services do heavy lifting.

- Migration-first model updates
  - Any changes to `src/models/*` should be accompanied by migration changes.

---

## Debugging tips & common pitfalls

- 401 Unauthorized: check `JWT_SECRET`, cookie presence, and `JWTservice` logic.
- Sequelize connection errors: check env variables and dialect esp. `DATABASE_DIALECT` & `DATABASE_HOST`.
- Migration conflicts: ensure previous migrations have been applied and the `migrations` table is up-to-date.
- Socket namespace/ports mismatch: confirm `server.listen()` port and `socket.io-client` port match.

---

## How to add a new endpoint (Recommended steps)

1. Create migration & model (if needed): `npx sequelize-cli model:generate --name Xxx --attributes a:string,b:integer`
2. Add service function in `src/serivces/`.
3. Add controller method in `src/controllers/`.
4. Wire up route in `src/routes/api.js` (or new router file) and ensure auth/permissioning.
5. Write tests (unit for service, integration for route with `supertest`).
6. Seed demo data if necessary and update `README`.

---

## Next steps & recommended improvements

- Add `supertest` integration tests for controllers and autostart with a test DB in CI.
- Add `winston` or `pino` for structured logs.
- Introduce `dotenv-safe` to ensure required env variables are enforced in dev/CI.
- Add standard code-style (eslint/prettier) & unit test coverage for critical services.

---

If you want, I can now:
1. Add a full `ContactMessage` model + migration + service + controller + route + seeder and tests as the example endpoint.
2. Add a `supertest` based integration test for a route.
3. Create a top-level unified README linking FE and BE detailed files.

Tell me which next step you would like me to implement.
