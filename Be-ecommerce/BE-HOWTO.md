# Hướng dẫn Backend chi tiết: Be-ecommerce (Tiếng Việt)

Tài liệu này hướng dẫn các bước cụ thể cho developer mới: thiết lập môi trường, chạy server, debug, thêm API mới (model, migration, service, controller, route), chạy migration, seed, viết test và triển khai.

---

## 1) Thiết lập môi trường dev (Local)

1. Clone repo và chuyển vào thư mục backend:
```bash
cd Be-ecommerce
npm install
```

2. Tạo file `.env` (hoặc copy template) và thêm các biến cơ bản:
```bash
PORT=8080
DATABASE=...  # tên db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=root123
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_DIALECT=postgres # hoặc sqlite
DATABASE_STORAGE=./database.sqlite # nếu dùng sqlite
JWT_SECRET=your-secret
```

3. Chạy server ở chế độ dev:
```bash
npm start
```
`npm start` chạy `nodemon` + `@babel/node` để load mã ES6+ mà không cần build trước.

---

## 2) Migration & Seeder (Sequelize)

- Chạy migration: `npx sequelize-cli db:migrate`.
- Rollback (undo): `npx sequelize-cli db:migrate:undo`.
- Chạy seeders: `npx sequelize-cli db:seed:all`.
- Tạo migration mới:
```bash
npx sequelize-cli migration:generate --name create-contact-message
```
Edit file migration trong `src/migrations/` sau khi sinh.

---

## 3) Thêm endpoint ví dụ: `Contact Message` (chi tiết)
Mục tiêu: Tạo endpoint `POST /api/contact/create` lưu message vào DB và trả về `{DT, EC, EM}`.

### 3.1 Tạo migration & model
1. Tạo model + migration:
```bash
npx sequelize-cli model:generate --name ContactMessage --attributes email:string,message:text
```
2. Kiểm tra file migration/sửa timestamps/indices nếu cần.
3. Chạy migration: `npx sequelize-cli db:migrate`.

### 3.2 Thêm associations (nếu cần)
Nếu model liên kết với model khác, thêm associate trong `src/models/contactmessage.js` và cập nhật `src/models/index.js`.

### 3.3 Tạo service
Tạo `src/serivces/contactService.js`:
```js
import db from '../models';

const createContactService = async (data) => {
  try {
    const newItem = await db.ContactMessage.create({ email: data.email, message: data.message });
    return { DT: newItem, EC: 0, EM: 'Create success' };
  } catch (e) {
    console.error(e);
    return { DT: '', EC: -1, EM: 'DB error' };
  }
}

export default { createContactService }
```

### 3.4 Tạo controller
Tạo `src/controllers/contactController.js`:
```js
import contactService from '../serivces/contactService';

const handleCreateContact = async (req, res) => {
  try {
    const data = req.body;
    const response = await contactService.createContactService(data);
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(200).json({ DT: '', EC: -1, EM: 'Server error' });
  }
}

module.exports = { handleCreateContact }
```

### 3.5 Thêm route
Trong `src/routes/api.js` import controller và đăng ký route:
```js
import contactController from '../controllers/contactController';
router.post('/contact/create', contactController.handleCreateContact);
```
Nếu route này cần public (không auth), hãy chắc rằng nó nằm trong `exceptionPath` của `JWTservice` hoặc đứng ngoài middleware auth.

### 3.6 Test bằng curl/Postman
```bash
curl -X POST http://localhost:8080/api/contact/create -H "Content-Type: application/json" -d '{"email":"test@qa.com","message":"Hello"}'
```

Bạn sẽ thấy JSON trả về `EC === 0` nếu thành công.

---

## 4) Authentication & JWT (middleware)
- `src/middleware/JWTservice.js` xử lý cookie/JWT.
- Để bảo vệ route: đăng ký route sau middleware hoặc chặn route ngoài `exceptionPath`.

---

## 5) Pattern Controller & Service
- Giữ controller mỏng: validate/parse request, gọi service.
- Service: logic nghiệp vụ, tương tác DB, trả `{DT, EC, EM}`.

---

## 6) Webhook & Socket
- Webhook: `POST /api/hooks/payment` (trong `webHookController`).
- Socket: cấu hình trong `src/sever.js` và xử lý trong `src/middleware/SocketIO.js`.

---

## 7) Debugging & các lệnh hay dùng
- Chạy dev: `npm start`.
- Build production: tùy cấu hình (Docker recommended).
- Kiểm tra DB config: kiểm `DATABASE_DIALECT` và `DATABASE_STORAGE`.
- Chạy migrations: `npx sequelize-cli db:migrate`.

---

## 8) Tests
- Nên thêm unit test cho service và integration test cho routes bằng `supertest`.
- Ví dụ: mock DB bằng sqlite, hoặc cài sqlite test DB và teardown sau run.

---

## 9) Docker / Triển khai
- `Be-ecommerce/Dockerfile` build image backend; Docker Compose ở root khởi toàn bộ stack.
- Đảm bảo biến môi trường bảo mật trong CI/CD.

---

## 10) Checklist khi PR Backend
- [ ] Thêm migration nếu thay đổi schema (có `down`).
- [ ] Thêm model mới trong `src/models` và cập nhật `associate`.
- [ ] Thêm service & unit test.
- [ ] Thêm controller & route, tuân tiêu chuẩn `{DT, EC, EM}`.
- [ ] Cập nhật seeders nếu cần.

---

## Ghi chú cuối
Nếu bạn muốn, mình có thể:
- Sinh migration + model + dịch vụ + controller + route + seeder + test cho `ContactMessage`.
- Thêm ví dụ integration test sử dụng `supertest`.
- Thêm hướng dẫn CI để chạy migrations & test khi PR.
# Backend How-To: Be-ecommerce — Hướng dẫn chi tiết cho dev mới

Tài liệu này hướng dẫn các bước cụ thể để: thiết lập môi trường, chạy, debug, thêm API mới (model, migration, service, controller, route), chạy migration, seed, test, và deploy.

---

## 1) Thiết lập môi trường dev (Local)

1. Sao chép repo & cài dependencies:
```bash
cd Be-ecommerce
npm install
```

2. Tạo file `.env` (hoặc copy `.env` template nếu có) với các biến:
```bash
PORT=8080
DATABASE=...  # tên db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=root123
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_DIALECT=postgres # or sqlite
DATABASE_STORAGE=./database.sqlite # for sqlite
JWT_SECRET=your-secret
```

3. Chạy server:
```bash
npm start
```
- `npm start` sử dụng `nodemon` + `@babel/node` và sẽ khởi động server với mã nguồn trong `src/sever.js`.

---

## 2) DB Migrations & Seeders (Sequelize)

- Migrations: `npx sequelize-cli db:migrate`
- Undo last migration: `npx sequelize-cli db:migrate:undo`
- Run seeders: `npx sequelize-cli db:seed:all`
- Create new migration:
```bash
npx sequelize-cli migration:generate --name create-contact-message
```
- Edit migration file generated in `src/migrations/`.

---

## 3) Add a new endpoint example: "Contact Message" (step-by-step)
Goal: Add API route `POST /api/contact/create` which stores a contact message in DB and returns standard response (`DT`, `EC`, `EM`).

### 3.1 Create Sequelize migration & model
- Create migration file:
```bash
npx sequelize-cli model:generate --name ContactMessage --attributes email:string,message:text
```
This creates a model file in `src/models` and migration in `src/migrations`.

- Edit migration if needed (timestamps, indices).
- Run migration:
```bash
npx sequelize-cli db:migrate
```

### 3.2 Add model associations if any
- Edit `src/models/contactmessage.js` and `src/models/index.js` associations if needed.

### 3.3 Create service file
- Create new service `src/serivces/contactService.js` with function `createContactService`:
```js
import db from '../models';

const createContactService = async (data) => {
  try {
    let newItem = await db.ContactMessage.create({ email: data.email, message: data.message });
    return { DT: newItem, EC: 0, EM: 'Create success' };
  } catch (e) {
    console.error(e);
    return { DT: '', EC: -1, EM: 'DB error' };
  }
}

export default { createContactService }
```

### 3.4 Create controller
- Add `src/controllers/contactController.js`:
```js
import contactService from '../serivces/contactService';

const handleCreateContact = async (req, res) => {
  try {
    const data = req.body;
    const response = await contactService.createContactService(data);
    return res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(200).json({ DT: '', EC: -1, EM: 'Server error' });
  }
}

module.exports = { handleCreateContact }
```

### 3.5 Add route
- Import and register route in `src/routes/api.js`:
```js
import contactController from '../controllers/contactController.js'

router.post('/contact/create', contactController.handleCreateContact)
```
Because `api.js` uses `app.use(JWTservice.checkCookieService, JWTservice.authenticateCookieService);`, if you want contact open to unauthenticated users, ensure to override or place route before the JWT middleware (or add public route with separate route file).

### 3.6 Test with Postman/cURL
```bash
curl -X POST http://localhost:8080/api/contact/create -H "Content-Type: application/json" -d '{"email":"test@qa.com","message":"Hello"}'
```

You should see JSON response with `EC === 0` and newly created contact entry.

---

## 4) Authentication & JWT (middleware)
- `src/middleware/JWTservice.js` provides cookie-based JWT authentication.
- To protect route, place it after the JWT middleware registration in `api.js` (current code uses JWT for all requests by default), or modify to add a `public` whitelist.

---

## 5) Services & Controllers Pattern
- Keep business logic in `src/serivces` (service functions talk to `db` models and return standard `{DT, EC, EM}`).
- Controllers call service functions, catch errors, and return consistent JSON.
- Use `try/catch` and return `EC`/`EM` follow project response format.

---

## 6) Webhooks and Socket
- Payments webhooks: `POST /api/hooks/payment` handled by `webHookController`.
- Socket configured in `sever.js` and logic in `src/middleware/SocketIO.js`.

---

## 7) Debugging & Useful Commands
- Run server with supervisor to reload on changes: `npm start` (nodemon + babel-node).
- Build for production & run JS compiled by Babel: `npm run build-src` then `npm run build`.
- Database: check `process.env.DATABASE_DIALECT` and local `database.sqlite` if using sqlite.
- Run migrations / seeders: `npx sequelize-cli db:migrate`, `npx sequelize-cli db:seed:all`.

---

## 8) Tests
- Project currently lacks automated tests. Recommended:
  - Add unit tests for services (mock db with `sinon`/`proxyquire`) or use `sqlite` for tests.
  - Add integration tests for routes using `supertest`.

---

## 9) Docker / Production
- `Be-ecommerce/Dockerfile` builds the backend image. Compose file in repo root will build & run backend with postgres.
- Make sure env variables are set securely (secrets manager, CI/CD secrets) and `DATABASE_SSL` if needed.

---

## 10) PR Template & Checklist for Backend Feature
- [ ] Add migration if DB schema is changed; include `down` method.
- [ ] Add new model to `src/models` with proper `associate` implementation.
- [ ] Add service function and unit tests.
- [ ] Add controller & route; follow response structure (`DT/EC/EM`).
- [ ] Update seeders if needed.
- [ ] Update `BE-HOWTO.md` and `BE-EXPLAIN.md` if you changed conventions.

---

## Final notes
If you want, I can:
- Generate example migration & model for `ContactMessage` and implement service/controller/route for it.
- Create a `contact` seeder and test script.
- Add `Be-ecommerce/README.md` with quick links to `BE-EXPLAIN.md` & `BE-HOWTO.md` (I can do that next). 

