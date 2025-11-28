# Giải thích FE (Frontend) — Fe-commerce

## ✅ Tổng quan nhanh

- Thư mục frontend nằm trong `Fe-commerce`.
- Đây là một ứng dụng React (Create React App) được tuỳ biến bằng `craco`.
- Truy cập API backend thông qua biến môi trường `REACT_APP_API_URL` (mặc định `http://localhost:8080`).
- State management dùng `Redux Toolkit` + `RTK Query` và `redux-persist` để lưu trữ local.
- Socket communication dùng `socket.io-client` (URL mặc định `http://localhost:8080`).
- Phần admin (system) sử dụng `@toolpad/core` để tạo dashboard layout.

Những điểm cần nắm kỹ:
 - Mã FE được phân chia theo `features` trong `src/container` để dễ bảo trì.
 - Mọi API dùng instance `axios` (`src/config/axios.js`) với `baseURL` lấy từ `REACT_APP_API_URL`.
 - `RTK Query` (createApi) tạo ra các hooks tự động (ví dụ: `useLazyLoginQuery`, `useCreateContactMutation`).
 - `redux-persist` lưu một số slices vào `localStorage` (xem `store.js` để biết blacklist/whitelist).

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

Chi tiết cấu hình để chú ý:
- `craco.config.js`: dùng để tùy chỉnh webpack/Cra và fix các vấn đề runtime; nếu cần thêm alias hoặc fallback, chỉnh tại đây.
- `Dockerfile`: sử dụng multi-stage build (build -> nginx), chú ý `ARG REACT_APP_API_URL` để set API khi build.
- `nginx.conf`: cấu hình proxy pass cho `/api`; đảm bảo proxy headers and CORS được xử lý nếu backend dùng cookies.

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

Lưu ý quan trọng về môi trường:
 - Thiết lập `REACT_APP_API_URL` để FE gọi đúng backend. Trong Docker Compose, giá trị build-arg sẽ override giá trị local.
 - Kết nối socket: `socketService` mặc định connect tới `http://localhost:8080`; trong production bạn có thể set URL để trỏ đến backend server hoặc truyền qua biến môi trường.
 - Nếu UI dùng cookie-based auth, đảm bảo `axios` gửi cookie bằng `withCredentials` (`instance.defaults.withCredentials = true`).

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

Chi tiết patterns & snippet:
- `axiosBaseQuery`: wrapper used in RTK Query to adapt axios as baseQuery — see `src/store/slice/API/userAPI.js` in the repo for a reference pattern.
- `withCredentials`: when the backend uses cookie-based auth ensure `instance.defaults.withCredentials = true` in `src/config/axios.js`.
- Naming convention: use `getXxx`, `createXxx`, `updateXxx`, `deleteXxx` for clarity.
- Check standard response format `{ DT, EC, EM }` and handle `EC !== 0` as error state.

---

## 🧭 Routing & Navigation

- Tập trung ở `src/route/RouteIndex.js` — dùng `react-router` (BrowserRouter + Routes + Route)
- Để thêm route: nhập component và thêm 1 route mới hoặc nested route.

Ví dụ thêm route: `RouteIndex.js`
```jsx
<Route path="new-feature" element={<NewFeature />} />
```

Lưu ý: `RouteIndex.js` sử dụng nested routes với `AccountLayout`, `AuthLayout`, `SystemLayout`.
- `AccountLayout` bao bọc các route dành cho người dùng chính (home, login, register, product, list...)
- `AuthLayout` dùng cho các route cần login (ví dụ `/user/checkout`, `/user/profile`).
- `SystemLayout` dùng cho hệ thống admin. Nếu bạn muốn một route hiển thị public (không yêu cầu auth), đặt nó ở đúng layout hoặc tách ra.

---

## 🧾 Redux & RTK Query

- `src/store/store.js` — cấu hình combineReducers, persist config, middleware.
- Các reducers: `src/store/slice/Reducer/*` (userSlice, shoppingCartSlice...)
- Sử dụng `redux-persist` để lưu store client side.
- RTK Query: `src/store/slice/API/*` — chứa các call to API, và export hook hooks như `useLazyLoginQuery`.

Pattern: Thêm API mới với RTK Query
1. Tạo file `src/store/slice/API/<feature>API.js` với `createApi` và `axiosBaseQuery`.
2. Trong `store.js`, thêm `[<feature>API.reducerPath]: <feature>API.reducer` vào `combineReducers`.
3. Thêm `<feature>API.middleware` vào `middleware` trong `configureStore`.
4. Sử dụng hook export ở component: `const [createItem] = useCreateItemMutation();` hoặc `useLazyGetItemQuery()`.

Ví dụ nhanh (pseudo):
```js
// contactAPI.js
export const contactAPI = createApi({
  reducerPath: 'contactAPI',
  baseQuery: axiosBaseQuery({ baseUrl: process.env.REACT_APP_API_URL }),
  endpoints: (build) => ({
    createContact: build.mutation({ query: (data) => ({ url: '/api/contact/create', method: 'post', data }) })
  })
});
export const { useCreateContactMutation } = contactAPI;
```

---

## 📬 Socket

- `src/service/socketService.js` — cấu hình socket.io-client:
```js
import { io } from 'socket.io-client';
export const socket = io('http://localhost:8080', { transports: ['websocket'], autoConnect: false });
```
- Sử dụng `socket.connect()` ở component và `socket.emit(...)` / `socket.on(...)` để gửi/nhận event.

Socket best practices:
 - Call `socket.connect()` in `useEffect` on mount and `socket.disconnect()` in cleanup to avoid memory leaks.
 - Use `socket.on` to register handlers and `socket.off` or `socket.removeListener` in cleanup.
 - For auth-based socket, pass token in connect options or make a separate `auth` handshake event after connect.

---

## 📐 Styling

- Sử dụng SCSS: file `*.scss` nhiều nơi trong `container/*`.
- Thư viện UI: `@mui/material`, `bootstrap`, `fontawesome`, `swiper`.

Tips for styling:
 - Use component scoped scss per component folder to avoid collisions and keep styles modular.
 - `index.scss` is the main global style — keep variables, theme, and CSS resets there.
 - Prefer MUI and design system for consistent look & responsive layout.

---

## 🔁 Cách mở rộng (How to add a feature)

1. Tạo component mới trong `src/container/<feature>/...`.
2. Thêm route vào `RouteIndex.js`.
3. Nếu cần gọi API: thêm 1 endpoint vào `src/store/slice/API/<api>.js` và sử dụng hook auto-generated.
4. Nếu cần state: thêm reducer vào `src/store/slice/Reducer/` và combine vào `store.js`.
5. Viết styles (scss) tương ứng.

Detailed checklist for new feature:
1. Create a new folder `src/container/<feature>` with `index.js` and `*.scss` for component styles.
2. Create any subcomponents under `components/` if needed and export from a central index.
3. Add route in `RouteIndex.js`, verifying layout (AuthLayout vs AccountLayout) is appropriate.
4. Add API (RTK Query) if the feature needs data. Follow `contact` example.
5. Add stateful logic in `src/store/slice/Reducer` if feature requires persistent UI state.
6. Add tests (`src/container/<feature>/__tests__`) and update `FE-HOWTO.md` with the steps you used.

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

Detailed troubleshooting checklist:
 - 401 Unauthorized: check cookie/token — ensure backend sets cookie and `axios` sends cookie with `withCredentials`.
 - CORS errors: check backend CORS `origin` and `credentials` values OR configure `nginx.conf` to pass headers properly.
 - SPA route 404: check `nginx.conf try_files` and `RouteIndex.js` — ensure BrowserRouter is supported by server fallback.
 - Socket messages not received: ensure `socket.connect()` is used and the client connects to the right domain/port.
 - Build mismatch: when deploying, verify the `REACT_APP_API_URL` used by the built bundle is correct and not hard-coded.

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

