# Mô tả chi tiết các file FE

Tài liệu này giải thích từng file quan trọng trong `Fe-commerce` và `Fe-commerce/src`, nêu rõ mục đích của file, lý do bố cục mã như vậy và ảnh hưởng/tác dụng của mỗi phần.

---

## Các file ở gốc dự án

- `package.json` — dependencies và scripts
  - Mục đích: liệt kê các gói NPM dùng trong dự án và các script như `start`, `build`, `test`.
  - Tại sao: Quản lý tránh lặp lại, dễ cài đặt, bao gồm `@craco/craco` để tuỳ chỉnh CRA.
  - Ảnh hưởng: Chạy `npm start` sẽ gọi `craco start` và khởi chạy dev server.

- `Dockerfile` — build và image production
  - Mục đích: Build bundle React và phục vụ bằng nginx.
  - Tại sao: Multi-stage build giúp image nhỏ gọn, production-ready, và `ARG REACT_APP_API_URL` cho phép set API endpoint khi build.
  - Ảnh hưởng: Bundle production sẽ gọi đúng API khi build-arg được cấu hình.

- `craco.config.js` — tuỳ chỉnh webpack cho CRA
  - Mục đích: tuỳ chỉnh cấu hình webpack mà không cần eject khỏi CRA.
  - Tại sao: CRA ẩn cấu hình; craco cho phép sửa các tùy chọn resolve, alias, fallback hoặc plugin.
  - Ảnh hưởng: Cho phép fix các lỗi runtime và thêm alias cho import path.

- `nginx.conf` — cấu hình nginx
  - Mục đích: phục vụ các file tĩnh trong `build` và proxy `/api` tới backend.
  - Tại sao: Dùng nginx để handle static file nhanh hơn và dễ cấu hình path cho API.
  - Ảnh hưởng: Lưu ý đồng bộ cấu hình CORS và cookie với backend.

- `.babelrc` — cấu hình Babel
  - Mục đích: Cấu hình Babel transpilation cho môi trường dev/production.
  - Tại sao: Dự án dùng JS hiện đại; Babel giúp transpile sang code tương thích.

---

## Thư mục `src` (mã nguồn chính)

### Các file cấp gốc

- `index.js`
  - Mục đích: Điểm vào React — bọc `App` bằng Redux `Provider`, `PersistGate` và render vào DOM.
  - Tại sao: Thiết lập store và persist tại root giúp state toàn cục có thể truy cập được ở mọi component.

- `App.js`
  - Mục đích: Container chính của ứng dụng — render router (`RouteIndex`), `ToastContainer`, các layout cơ bản.
  - Tại sao: Tách routing và layout ra khỏi logic tính năng; cho phép cấu hình toast/set global UI.

- `index.scss` & `App.scss`
  - Mục đích: Các style toàn cục và theme của app.
  - Tại sao: Thay vì style rải rác, gom biến và quy tắc CSS tại một chỗ giúp dễ bảo trì.

- `reportWebVitals.js` & `setupTests.js`
  - Mục đích: Hỗ trợ đo lường hiệu năng và cấu hình cho test (Jest, Testing Library).

---

### `config/`

- `config/axios.js`
  - Mục đích: Tạo instance axios dùng chung cho toàn app, cấu hình baseURL, interceptors, withCredentials.
  - Tại sao: Tập trung config request giúp thống nhất xử lý lỗi, token, header.

---

### `container/` (theo feature)

Tổ chức theo feature (feature-first) giúp gom các component, styles và logic liên quan vào một chỗ, thuận tiện cho việc mở rộng và bảo trì.

- `container/home/`
  - Các file: `Home.js`, `NavigationHome.js`, `Footer.js`, `auth/` (Login, Register), `profile/`, `complication/` (chat, OpenAI,..).
  - Mục đích: Tập hợp các trang UI cho người dùng bình thường (homepage, auth, profile).
  - Tại sao: Phân tách rõ ràng giữa các module tránh lẫn lộn code.

- `container/product/`
  - Các file: `Product.js`, `ShoppingCart.js`, `CheckOut.js`, component con như `Review`, `MyFitSize`.
  - Mục đích: Chứa UI liên quan đến sản phẩm, giỏ hàng và quá trình checkout.

- `container/system/` (Admin)
  - Các file: `SystemHome.js`, `ManageClothes.js`, `ManageOrder.js`, `ManageSupport.js`.
  - Mục đích: Giao diện quản trị - bố cục khác và có quyền truy cập khác so với phần FE user.

---

### `store/` (Redux + RTK Query)

- `store.js`
  - Mục đích: Cấu hình store, combine reducers, đăng ký redux-persist và middleware RTK Query.
  - Lưu ý: Khi thêm API mới bằng RTK Query, cần thêm `api.reducerPath` vào `combineReducers` và `api.middleware` vào `middleware`.

- `store/slice/API/*`
  - Mục đích: File định nghĩa các endpoints dùng RTK Query (ví dụ: `userAPI.js`, `otherAPI.js`).
  - Tại sao: RTK Query tạo hook sẵn cho truy vấn & mutation, xử lý cache và trạng thái.

- `store/slice/Reducer/*`
  - Mục đích: Reducer cho các state UI/local (user, shopping cart, hệ thống, contact...).
  - Tại sao: Không phải mọi state đều nên lưu trong RTK Query; UI state cục bộ vẫn cần reducer.

---

### `service/`

- `service/userService.js`
  - Mục đích: Gói các call axios đơn giản, dùng khi không muốn dùng RTK Query.
  - Tại sao: Một vài call nhỏ hoặc legacy code có thể dùng service trực tiếp.

- `service/socketService.js`
  - Mục đích: Cấu hình `socket.io-client` dùng chung; export một instance tổng thể.
  - Tại sao: Tránh kết nối nhiều lần và đơn giản hoá việc sử dụng socket trong component khác nhau.

---

### `utils/`

- `utils/constant.js`
  - Mục đích: Nơi chứa các hằng số dùng chung (ví dụ: `GROUPID`, `SYSTEM_NAV`).
  - Tại sao: Tránh ‘magic strings’, dễ refactor và giảm lỗi do gõ sai.

---

### `route/`

- `route/RouteIndex.js`
  - Mục đích: Đăng ký toàn bộ route, mount các layout (AccountLayout, AuthLayout, SystemLayout).
  - Tại sao: Giúp dễ quan sát và chỉnh sửa navigation cho ứng dụng.

---

## Lý do tổ chức mã (Thiết kế)

- Tổ chức theo feature (`container`) giúp nhóm code liên quan lại, tăng hiệu quả phát triển và dễ bảo trì.
- Dùng RTK Query để chuẩn hoá cách gọi API và cache, giảm lặp mã.
- Instance axios tập trung tạo hành vi nhất quán cho request; interceptors xử lý lỗi chung.
- `craco` cho phép chỉnh webpack mà không cần `eject` từ CRA.
- Docker + nginx đơn giản hóa quy trình triển khai; nginx proxy ` /api` giúp giữ cùng origin giữa FE và BE.

---

## Hướng dẫn thêm code mới (Tóm tắt nhanh)

- Thêm UI mới: tạo thư mục `src/container/<feature>` với component và scss.
- Nếu cần data mới: tạo RTK Query API slice trong `src/store/slice/API` và đăng ký vào `store.js`.
- Nếu cần state cục bộ: tạo reducer trong `src/store/slice/Reducer` và thêm vào `combineReducers`.
- Với realtime: thêm event & listener trong `src/service/socketService.js`.

---

## Mẹo & lưu ý

- Luôn thêm cleanup (ví dụ socket.disconnect()) trong `useEffect` khi dùng socket hoặc subscription.
- Với side-effect sau mutation dùng `invalidateTags`/`refetch` để giữ UI đồng bộ.
- Tổ chức component con dưới `components/` trong mỗi feature để tái sử dụng.

---

Nếu bạn muốn, mình có thể:
- Thêm checklist per-file cho khi thêm tính năng mới.
- Thêm ví dụ unit test cho component & slice.
# FE Files Detailed Explanation

This document explains each important file inside `Fe-commerce` and `Fe-commerce/src` explaining what the file does, why the code is structured that way, and the purpose/impact.

---

## Project-root files

- `package.json` — dependencies and scripts
  - Purpose: lists all NPM packages used and scripts like `start`, `build`, `test`.
  - Why: Centralizes dependency management; includes `@craco/craco` to customize CRA and other libs used across the app.
  - Impact: Running `npm start` triggers `craco start` which uses CRA dev server.

- `Dockerfile` — build & production image
  - Purpose: builds the React app and serves static assets with nginx.
  - Why: Multi-stage build keeps image size small and provides production-ready static server. `ARG REACT_APP_API_URL` is used to inject backend address at build time.
  - Impact: Building with `docker build --build-arg REACT_APP_API_URL=<API>` ensures the built bundle will call the correct API in production.

- `craco.config.js` — overrides for CRA webpack
  - Purpose: customize default CRA webpack config without ejecting.
  - Why: CRA hides webpack config; craco allows small tweaks like `resolve.fullySpecified`, aliasing, fallbacks, and plugin additions.
  - Impact: Fixes runtime issues (like `.mjs` handling) and allows us to add aliases and fallback logic.

- `nginx.conf` — nginx reverse proxy & static server config
  - Purpose: serving the `build` files and proxy `/api` calls to backend.
  - Why: For production, static content served directly by nginx is faster and robust; proxying simplifies API paths and domain handling.
  - Impact: Sets up a single host for FE and proxies API to backend; important to align proxy settings with backend CORS and cookie auth.

- `.babelrc` — babel overrides for build/runtime
  - Purpose: configure babel for transpilation.
  - Why: The project uses newer ES features; Babel transpiles to compatible JS.
  - Impact: Enables use of modern JS features consistently.

---

## src (main source directory)

### Root-level files
- `index.js`
  - Purpose: React entry point: wraps `App` with Redux `Provider`, `PersistGate`, and renders into DOM.
  - Why: Setting up `store` & `persist` at the root ensures state is available to the whole app. Using `PersistGate` ensures persisted store state loads prior to rendering children.
  - Impact: Provides highly available global state & persistence across sessions.

- `App.js`
  - Purpose: Top-level app container — renders `RouteIndex` with toast container.
  - Why: Keeps routing and main layout centralized; using `ToastContainer` for centralized toasts.
  - Impact: Clean separation of layout & routing from app initialization.

- `index.scss` & `App.scss`
  - Purpose: Global styles and app-level theme styles.
  - Why: Put global CSS variables and base rules in `index.scss` and component-related layout styling in `App.scss`.
  - Impact: Centralized style base; allow consistent design across components.

- `reportWebVitals.js`
  - Purpose: Optional performance metrics collector.
  - Why: CRA includes this to collect metrics if desired.
  - Impact: No runtime effect unless developer hooks it up to analytics.

- `setupTests.js`
  - Purpose: Jest setup.
  - Why: Common testing setup for `react-testing-library`.
  - Impact: Used when `npm test` is invoked.

---

### config

- `config/axios.js`
  - Purpose: Single axios instance used across the app. Configures `baseURL`, `withCredentials`, and interceptors.
  - Why: Centralizes API request configuration (base URL, error handling, interceptors) to avoid duplicate code and maintain consistent behavior.
  - Impact: Interceptors standardize API response/error handling; `withCredentials` ensures cookies (e.g. auth tokens) are sent across domains.

---

### container (features)

Organized by domain features so each folder reflects a vertical slice of the app. Each folder has `*.js` and `*.scss` for component and style.

- `container/home/` (Home & auth views)
  - `Home.js` — homepage: combines `AdsHome`, `BestItemSection`, `CollectionSection`, etc.
  - `NavigationHome.js` — top navigation: central for rendering nav links and login/register states.
  - `Footer.js` — footer shared across pages.
  - `auth/` — login and register flows
    - `Login.js` — uses RTK Query `useLazyLoginQuery`, MUI components, and `AppProvider` from `@toolpad` to show sign in UI.
    - `Register.js` — uses `useCreateUserMutation` or `useRegisterMutation` to create account.
  - `profile/` — user pages (profile, orders, ratings)
  - `complication/` — support chat, OpenAI features and other small utilities.

Why structuring like this: Feature folders keep related components and styles in one place for easier discovery & maintenance.

---

### container/product

- `Product.js` — product details view, shows product info and uses `Review` components.
- `ShoppingCart.js` — local cart UI and calls `userAPI` to create a bill.
- `CheckOut.js` — checkout flow; calls `createBill` RTK mutation.

Why: Separates concerns: Product view (single item), Cart (collection), Checkout (order creation & validation).

---

### container/system (Admin UI)

Admin UI structure uses `@toolpad` for dashboard layout.

- `SystemHome.js` — orchestrates dashboard navigation and `DashboardLayout`.
- `ManageClothes.js`, `ManageOrder.js`, `ManageSupport.js` — CRUD pages for admin.

Why: Admin is a separate flow and has different layout needs and routes; keeping it modular prevents mixing user-facing logic.

---

### store (redux & RTK Query)

- `store.js` — central store configuration
  - Purpose: combineReducers, setup `redux-persist` and add RTK Query middlewares.
  - Why: Keep state & cache in one place, persist some slices for UX (shopping cart, user data), and manage API cache using RTK Query.
  - Impact: Adding a new API requires adding reducerPath & middleware to `store.js`.

- `slice/API/*` — RTK Query files (userAPI.js, systemAPI.js, otherAPI.js, checkOutAPI.js)
  - Purpose: Define endpoints for API and export hooks.
  - Why: RTK Query provides hooks that simplify the component code and handle caching, status and data normalization.

- `slice/Reducer/*` — redux standard reducers for user, cart, system, other, and contact.
  - Purpose: Local UI state that needs to be independent of API cache.
  - Why: Not all data fits into RTK Query; some are UI states (multi-step form state, session state, shopping cart items).

---

### service

- `service/userService.js`
  - Purpose: small helper wrapper for `axios` based calls; example used for direct API calls outside RTK Query.
  - Why: RTK Query is preferred but some legacy or small direct calls are made through a simple service.
  - Impact: Keeps direct usage consistent and simple in small components.

- `service/socketService.js`
  - Purpose: central `socket.io-client` configuration, used across the app to open real-time connections.
  - Why: Centralizing socket instance avoids multiple connections and simplifies usage — only import `socket` reference and call `socket.connect()`.

---

### utils

- `utils/constant.js` — central place for constants used across app (e.g., group ids, system nav string constants).
  - Purpose: prevent magic strings and consolidate domain constants.
  - Why: clarity & maintainability; helps avoid typos and makes refactoring easier.

---

### route

- `route/RouteIndex.js` — central router configuration
  - Purpose: mounts `AccountLayout`, `AuthLayout`, and `SystemLayout`, then defines all routes.
  - Why: Centralizing routing makes it easy to view and modify navigation and ensures that layouts are consistently applied.

---

## Why code is arranged like this (Design rationale)
- Feature-first folders (`container/`) improve developer productivity & onboarding because related files live together.
- Use of RTK Query standardizes API calls and cache logic, reducing code duplication.
- Centralized axios instance ensures consistent error handling and credential sending.
- `craco` gives just enough flexibility to change webpack without losing CRA convenience.
- Docker + nginx used to simplify deployment; nginx proxying `/api` keeps a single origin for both FE & API.

---

## Where to add new code (quick guidance)
- Use `src/container/<feature>` to add new page — include component and styles.
- If new data is needed, add an RTK Query API slice under `src/store/slice/API` and add to store.
- For simple form/state local only, add a small slice in `src/store/slice/Reducer`.
- For real-time, add events & listeners using `src/service/socketService.js`.

---

## Helpful tools & tips
- Always add `useEffect` cleanup for sockets and any long-living subscriptions.
- For API mutation side effects, use `invalidateTags` or `refetch` to keep UI in sync.
- Wrap complex features into `container` subfolder with `components/` for reusability.  

---

If you'd like, I can also:
- Provide a per-file checklist of what to update when adding a new feature (e.g., list of files to touch).
- Add sample unit tests for a sample component and a store slice.

