# Giải thích FE (Frontend) — Fe-commerce

## ✅ Tổng quan nhanh

- Thư mục frontend nằm trong `Fe-commerce`.
- Đây là một ứng dụng React (Create React App) được tuỳ biến bằng `craco`.
- Truy cập API backend thông qua biến môi trường `REACT_APP_API_URL` (mặc định `http://localhost:8080`).
- State management dùng `Redux Toolkit` + `RTK Query` và `redux-persist` để lưu trữ local.
- Socket communication dùng `socket.io-client` (URL mặc định `http://localhost:8080`).
- Phần admin (system) sử dụng `@toolpad/core` để tạo dashboard layout.

---

## 📁 Cấu trúc chính (quan trọng)

- `Fe-commerce/package.json` — tập trung tiến trình và dependencies.
- `Fe-commerce/src` — mã nguồn chính, nằm trong các thư mục:
  - `config/` — `axios.js` config cho HTTP requests.
  - `container/` — components chính được tổ chức theo feature:
    - `home/` — trang chủ, header, footer, auth, profile
    - `product/` — trang sản phẩm, giỏ hàng, checkout
    - `system/` — trang admin
  - `route/` — `RouteIndex.js` định nghĩa router (react-router).
  - `service/` — service riêng (vd: `socketService`, `userService`).
  - `store/` — Redux store (slices, RTK queries):
    - `store.js` — cấu hình store với `configureStore`.
    - `slice/` — reducers & APIs dùng RTK Query.
  - `utils/` — constants và các helper.
  - `assets/` — hình ảnh, logo, ...

---

## 🛠️ Các file cấu hình quan trọng

- `craco.config.js` — tuỳ biến Webpack/Cra config (ví dụ resolve, fallback)
- `Dockerfile` — build production image, copy `build` vào nginx
- `nginx.conf` — cấu hình nginx server & proxy path `/api` tới backend

---

## ⚙️ Cách chạy project (Local Development)

1. Bảo đảm backend đang chạy (mặc định `http://localhost:8080`).
2. Tạo file `.env` trong `Fe-commerce` nếu cần và thêm (tuỳ môi trường):

```bash
REACT_APP_API_URL=http://localhost:8080
```

3. Chạy lệnh dev (frontend):

```bash
cd Fe-commerce
npm install
npm start
```

Trình dev mặc định chạy ở `http://localhost:3000`.

---

## 📦 Build & Docker

- Build production bundle: `npm run build`.
- Docker build (ví dụ):

```bash
# Từ thư mục Fe-commerce
docker build --build-arg REACT_APP_API_URL=http://localhost:8080 -t fe-app .
# Chạy
docker run -p 80:80 fe-app
```

- Docker Compose (root repo): `docker-compose up --build` sẽ build và khởi chạy postgres, backend và frontend (FE được đặt `REACT_APP_API_URL` qua build arg theo `docker-compose.yml`).

---

## 🔗 API Layer

- `src/config/axios.js` — axios instance (baseURL dùng `REACT_APP_API_URL`), thêm interceptors request và response.
- Thêm endpoint mới: RTK Query  => file `src/store/slice/API/*.js`, ví dụ `userAPI.js`.
  - Sử dụng `createApi` + `createAsyncThunk` hoặc mutation/query.
  - `userAPI` tập trung phần user/auth, Bill, Review, Update...

Ví dụ thêm endpoint mới (pseudo):
```js
// userAPI.js
getMyNewEndpoint: build.query({
  query: (params) => ({ url: `/api/new?x=${params.x}` , method: 'get' })
})
```

---

## 🧭 Routing & Navigation

- Tập trung ở `src/route/RouteIndex.js` — dùng `react-router` (BrowserRouter + Routes + Route)
- Để thêm route: nhập component và thêm 1 route mới hoặc nested route.

Ví dụ thêm route: `RouteIndex.js`
```jsx
<Route path="new-feature" element={<NewFeature />} />
```

---

## 🧾 Redux & RTK Query

- `src/store/store.js` — cấu hình combineReducers, persist config, middleware.
- Các reducers: `src/store/slice/Reducer/*` (userSlice, shoppingCartSlice...)
- Sử dụng `redux-persist` để lưu store client side.
- RTK Query: `src/store/slice/API/*` — chứa các call to API, và export hook hooks như `useLazyLoginQuery`.

---

## 📬 Socket

- `src/service/socketService.js` — cấu hình socket.io-client:
```js
import { io } from 'socket.io-client';
export const socket = io('http://localhost:8080', { transports: ['websocket'], autoConnect: false });
```
- Sử dụng `socket.connect()` ở component và `socket.emit(...)` / `socket.on(...)` để gửi/nhận event.

---

## 📐 Styling

- Sử dụng SCSS: file `*.scss` nhiều nơi trong `container/*`.
- Thư viện UI: `@mui/material`, `bootstrap`, `fontawesome`, `swiper`.

---

## 🔁 Cách mở rộng (How to add a feature)

1. Tạo component mới trong `src/container/<feature>/...`.
2. Thêm route vào `RouteIndex.js`.
3. Nếu cần gọi API: thêm 1 endpoint vào `src/store/slice/API/<api>.js` và sử dụng hook auto-generated.
4. Nếu cần state: thêm reducer vào `src/store/slice/Reducer/` và combine vào `store.js`.
5. Viết styles (scss) tương ứng.

Example "Contact" feature exists as a sample in the repo at:
- `src/container/home/contact/Contact.js`
- `src/container/home/contact/Contact.scss`
- `src/store/slice/API/otherAPI.js` (mutation `createContact`)
- Route at `src/route/RouteIndex.js` -> `path="contact"`

---

## ⚠️ Lưu ý & Troubleshooting

- CORS: backend cần cho phép origin của FE hoặc cấu hình proxy/nginx.
- Biến môi trường: `REACT_APP_API_URL` truyền trong `docker build` hoặc `.env` để override baseURL.
- Nếu đổi đường dẫn API (`/api`) hãy kiểm tra `nginx.conf` proxy pass.
- `craco` được dùng để tuỳ chỉnh webpack config — không dùng trực tiếp `react-scripts`.

---

## 🔧 Một số lệnh hữu dụng

- Chạy dev: `npm install && npm start`
- Run tests: `npm test`
- Build production: `npm run build`
- Docker build & run (FE): `docker build -t fe-app . && docker run -p 80:80 fe-app`
- Docker compose: root: `docker-compose up --build`

---

## 💡 Tóm tắt (tip nhanh)

- Mọi API request sẽ dùng `axios` instance trong `src/config/axios.js`.
- Thêm endpoint vào RTK Query là cách tốt nhất để lấy/đẩy dữ liệu với Redux Toolkit.
- `RouteIndex.js` là nơi để thêm những route mới. `container/` chứa UI theo module/feature.

---

Nếu bạn muốn, mình có thể:
- Thêm phần hướng dẫn dev chi tiết (debugging, ESLint, prettier config).
- Viết một checklist cụ thể để thêm feature (mẫu PR).
- Tạo README chi tiết hơn cho `system` hoặc `product` module.

