# FE Developer How-To: Fe-commerce — Hướng dẫn cụ thể cho dev mới

## Giới thiệu nhanh
Tài liệu này bao gồm các bước chi tiết cho một developer mới để: khởi tạo môi trường, thêm một feature mới (component + route + api + redux), triển khai socket.io, test, build và deploy.

---

## 1) Thiết lập môi trường dev (Local)

1. Clone repo và chuyển vào thư mục `Fe-commerce`.

```bash
cd Fe-commerce
npm install
```

2. Tạo file `.env` nếu cần (phù hợp với backend lokal):

```bash
# .env
REACT_APP_API_URL=http://localhost:8080
```

3. Chạy app:

```bash
npm start
```

App mặc định chạy ở `http://localhost:3000`

---

## 2) Thư mục & file quan trọng (nhanh)

- `src/config/axios.js` — Instance axios dùng cho mọi request.
- `src/store/store.js` — configureStore + persist
- `src/store/slice/API/` — file RTK Query API; export hooks like `useLazyLoginQuery`.
- `src/store/slice/Reducer/` — reducers (user, shoppingCart, system...)
- `src/container/` — nơi đặt UI theo features: `home/`, `product/`, `system/`.
- `src/route/RouteIndex.js` — nơi thêm route.
- `src/service/socketService.js` — socket.io-client config.

---

## 3) Thêm feature — ví dụ: "Contact" đơn giản

Mục tiêu: Thêm trang `/contact` với 1 form để gửi message tới backend.

Example files (đã có sẵn mẫu trong repo):
- `src/container/home/contact/Contact.js`
- `src/container/home/contact/Contact.scss`
- `src/store/slice/API/otherAPI.js` (mutation `createContact` ví dụ)
- Route: `src/route/RouteIndex.js` — `path="contact"`

### 3.1 Tạo component UI

1. Tạo file `src/container/home/contact/Contact.js` và `Contact.scss`.

Contact.js (mẫu):
```jsx
import React, { useState } from 'react';
import './Contact.scss';
import { useCreateContactMutation } from '../../../store/slice/API/otherAPI'; // ví dụ

function Contact() {
  const [msg, setMsg] = useState('');
  const [createContact] = useCreateContactMutation();

  const handleSubmit = async () => {
    const res = await createContact({ message: msg });
    if (res && res.data && res.data.EC === 0) {
      alert('Gửi thành công');
    } else {
      alert('Lỗi');
    }
  };

  return (
    <div className="contact-container">
      <h2>Contact us</h2>
      <textarea value={msg} onChange={(e)=> setMsg(e.target.value)} />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}

export default Contact;
```

2. Import style, module scss để phù hợp với project.

### 3.2 Thêm route

- Edit `src/route/RouteIndex.js` để thêm route mới:
```jsx
import Contact from '../container/home/contact/Contact';
...
<Route path="contact" element={<Contact />} />
```

### 3.3 Thêm RTK Query / API

- Nếu backend đúng với path `/api/contact/create`:

1. Update `src/store/slice/API/otherAPI.js` (tạo endpoint nếu chưa có):
```js
createContact: build.mutation({
  query: (data) => ({ url: '/api/contact/create', method: 'post', data }),
}),
```

2. Export hook `useCreateContactMutation` (hàm hoán tự động export dưới file `otherAPI.js`):
```js
export const { useCreateContactMutation, ... } = otherAPI;
```

3. Dùng hook `useCreateContactMutation` trong component như ví dụ `Contact.js`.

### 3.4 Thêm reducer (nếu cần)

- Nếu bạn cần state quản lý ở client (VD: contact form), hãy thêm 1 reducer vào `src/store/slice/Reducer` và `store.js`.

Ví dụ:
- Tạo `contactSlice.js` (export default contactReducer) và thêm vào `combineReducers` trong `store.js`.

---

## 4) RTK Query — Mẹo & Patterns

- File mẫu `userAPI.js` cho vài pattern tốt:
  - Sử dụng `axiosBaseQuery` wrapper để đảm bảo consistent baseUrl.
  - `reducerPath` và `baseQuery` được định nghĩa ngay tại nơi.
  - Sử dụng `useLazy...` hoặc `useMutation` tùy theo nghiệp vụ.

- Khi tạo endpoint:
  - Tên endpoint rõ ràng: `getUserData`, `createBill`.
  - Nếu endpoint trả `EC/EM` định dạng, code FE kiểm `res.data.EC === 0`.

- Update store middleware & reducers nếu thêm API: trong `store.js` cần add API middleware và reducerPath.

---

## 5) Socket.io (Sử dụng socketService)

- `src/service/socketService.js` export `socket`:
```js
import io from 'socket.io-client';
export const socket = io('http://localhost:8080', { transports: ['websocket'], autoConnect: false });
```

- Connect trong component:
```jsx
import { socket } from '../../service/socketService';
useEffect(()=>{
  socket.connect();
  socket.on('some-event', (data) => { /* handle */ });
  // cleanup
  return () => socket.off('some-event');
}, []);
```

- Để gửi dữ liệu: `socket.emit('event', data)`.

---

## 6) Debugging & Troubleshooting

- CORS issues: kiểm tra backend có thêm dòng cho phép origin FE hoặc cấu hình nginx reverse proxy.
- Axios errors: `axios.js` interceptor trả về `error.response` - kiểm `error.response.data.EM`.
- Token & Authentication: JWT tokens nên được gửi qua cookie hoặc Authorization header — đảm bảo `instance.defaults.withCredentials = true;` nếu backend dùng cookie.
- React-router mismatch: Kiểm tra `BrowserRouter` và server side nginx `try_files` (nginx.conf) để fallback được `index.html`.

---

## 7) Testing & Lint

- Test commands: `npm test`.
- Linting: cài ESLint nếu chưa có — cấu hình `eslintConfig` trong `package.json` hiện dùng `react-app`.

---

## 8) Build & Docker

- Build: `npm run build`.
- Dockerfile: sử dụng ARG `REACT_APP_API_URL` để set môi trường khi build.

Build command ví dụ:
```bash
docker build --build-arg REACT_APP_API_URL=http://localhost:8080 -t fe-app .
docker run -p 80:80 fe-app
```

- Docker Compose (repository root): `docker-compose up --build` để build toàn bộ.

---

## 9) Code reviews & PR check-list (mẫu)

- [ ] Chạy `npm start` & `npm test`, mọi test pass.
- [ ] Kiểm tra lint & format.
- [ ] Kiểm tra flow: Thêm test data, đăng nhập và confirm features.
- [ ] Cập nhật README hoặc FE-HOWTO nếu thêm hoặc thay đổi quy tắc.
- [ ] Update store, API hooks, route và component code.
- [ ] Nếu thay đổi API, update env và README/FE-HOWTO.

---

## 10) FAQs & Tips nhanh

- Mất token: kiểm `axios` với cookies & `withCredentials`.
- Thay đổi `REACT_APP_API_URL` khi build sản phẩm: dùng build arg hoặc truyền env trong Docker.
- Nếu app 404 trên route client: kiểm tra `nginx.conf try_files` và `BrowserRouter`.

---

## Kết luận
- Tài liệu này là điểm khởi đầu. Nếu bạn muốn, mình có thể:
  - Thêm checklist CI/CD, unit test example cho component mới, hoặc mock API χρήση.
  - Tạo template PR and code snippet templates cho nhanh.


