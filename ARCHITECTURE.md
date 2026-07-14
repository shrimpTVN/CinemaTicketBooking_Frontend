# 🎬 CinemaTicketBooking — Frontend Architecture

> **Cập nhật lần cuối:** 2026-07-09  
> **Framework:** React 19 + Vite 8  
> **Styling:** TailwindCSS v4 (via `@tailwindcss/vite` plugin)  
> **State:** Zustand v5  
> **Router:** React Router DOM v7  
> **HTTP Client:** Axios v1 (với interceptor JWT tự động)

---

## 📦 Tech Stack tóm tắt

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| `react` | ^19.2.6 | UI framework |
| `react-dom` | ^19.2.6 | DOM rendering |
| `react-router-dom` | ^7.18.0 | Client-side routing |
| `zustand` | ^5.0.14 | Global state management |
| `axios` | ^1.18.0 | HTTP requests |
| `lucide-react` | ^1.21.0 | Icon library |
| `swiper` | ^12.2.0 | Carousel / Slider |
| `tailwindcss` | ^4.3.1 | Utility-first CSS |

---

## 🗂️ Cây thư mục dự án

```
CinemaTicketBooking_Frontend/
│
├── public/                          # Static assets (không qua Vite bundler)
│   ├── favicon.svg
│   ├── icons.svg
│   ├── fonts/                       # Font files tĩnh
│   └── images/                      # Hình ảnh tĩnh
│
├── src/                             # Source code chính
│   ├── main.jsx                     # Entry point — mount App vào #root
│   ├── App.jsx                      # Root component — cấu hình Router & Routes
│   ├── App.css                      # Global styles cho App
│   ├── index.css                    # Tailwind directives & CSS variables toàn cục
│   │
│   ├── assets/                      # Assets được Vite xử lý (import trực tiếp)
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   │
│   ├── layouts/                     # Layout wrapper cho từng nhóm trang
│   │   ├── MainLayout.jsx           # Layout cho người dùng: Header + Outlet + Footer
│   │   └── AdminLayout.jsx          # Layout cho admin: Sidebar + Outlet
│   │
│   ├── pages/                       # Các trang (lazy-loaded)
│   │   ├── Home.jsx                 # Trang chủ — hero slider, phim nổi bật
│   │   ├── MovieList.jsx            # Danh sách phim — filter, search
│   │   ├── Hall.jsx                 # Danh sách rạp chiếu
│   │   ├── HallDetail.jsx           # Chi tiết rạp — sơ đồ + suất chiếu
│   │   ├── Login.jsx                # Trang đăng nhập
│   │   │
│   │   ├── MovieDetail/             # Chi tiết phim (Đã modular hóa)
│   │   │   ├── index.jsx            # Entry point
│   │   │   └── components/          # ShowtimeSelector.jsx, ReviewSection.jsx, ReviewForm.jsx
│   │   │
│   │   ├── Booking/                 # Đặt vé (Đã modular hóa)
│   │   │   ├── index.jsx            # Entry point chính điều phối các bước
│   │   │   ├── bookingConstants.js  # Hằng số rạp, sơ đồ rạp, giá vé, combo
│   │   │   ├── bookingUtils.js      # Tiện ích định dạng, kiểm tra orphan seats, timer
│   │   │   └── components/          # StepIndicator, ShowtimeSelection, SeatSelection, ComboSelection, PaymentSelection, BookingSummary, SuccessScreen
│   │   │
│   │   ├── Register/                # Đăng ký tài khoản (Đã modular hóa)
│   │   │   ├── index.jsx            # Entry point chính điều phối step
│   │   │   └── components/          # ProjectorBackground.jsx, RegisterFormStep1.jsx, RegisterFormStep2.jsx
│   │   │
│   │   ├── Profile/                 # Trang hồ sơ cá nhân (Đã modular hóa)
│   │   │   ├── index.jsx            # Entry point chính điều phối các tab
│   │   │   └── components/          # InfoTab, HistoryTab, RewardsTab, PrivacyTab, PasswordModal, EmailModal
│   │   │
│   │   └── admin/                   # Trang dành riêng cho Admin (Protected)
│   │       ├── AdminDashboard.jsx   # Tổng quan thống kê
│   │       └── AdminMovies/         # Quản lý phim — CRUD (Đã modular hóa)
│   │           ├── index.jsx        # Entry point điều phối chính
│   │           └── components/      # Toast, StatusBadge, GenreChip, MovieFormModal, DeleteConfirmDialog
│   │
│   ├── components/                  # Shared/reusable UI components
│   │   ├── AgeRatingTag.jsx         # Component hiển thị nhãn giới hạn độ tuổi (ví dụ: T18, P, K...)
│   │   ├── AmbientGlow.jsx          # Hiệu ứng ánh sáng nền động
│   │   ├── HeroSlider.jsx           # Slider banner trang chủ (Swiper)
│   │   ├── HolographicTicket.jsx    # Component vé holographic 3D
│   │   ├── MovieCard.jsx            # Card hiển thị thông tin phim
│   │   ├── ProtectedRoute.jsx       # HOC bảo vệ route Admin
│   │   ├── SectionHeading.jsx       # Tiêu đề section có styling chuẩn
│   │   ├── TabFilter.jsx            # Component tab lọc (Đang chiếu / Sắp chiếu)
│   │   └── TrailerModal.jsx         # Modal phát trailer YouTube
│   │
│   ├── services/                    # API layer — giao tiếp với backend
│   │   ├── apiConfig.js             # Cấu hình API_URL + toggle MOCK/REAL mode
│   │   ├── apiClient.js             # Axios instance + interceptors (JWT, error)
│   │   ├── authService.js           # Các hàm: login, register, logout, getProfile
│   │   ├── movieService.js          # Facade: tự chọn mock hay real API
│   │   ├── movieApiService.js       # Gọi API thực (backend endpoints)
│   │   └── movieMockService.js      # Trả dữ liệu từ mocks/movies.json
│   │
│   ├── store/                       # Zustand global state
│   │   ├── authStore.js             # State: user, token | Actions: login, logout, updateUser
│   │   ├── bookingStore.js          # State đặt vé: ghế, suất chiếu, thanh toán
│   │   └── trailerStore.js          # State mở/đóng modal trailer
│   │
│   └── mocks/                       # Dữ liệu giả cho development
│       └── movies.json              # JSON danh sách phim mock
│
│
├── index.html                       # HTML shell — entry point Vite
├── vite.config.js                   # Vite config: React plugin + TailwindCSS plugin
├── eslint.config.js                 # ESLint config (flat config format)
├── package.json                     # Dependencies & scripts
├── .env                             # Biến môi trường (VITE_API_URL, VITE_USE_MOCK_DATA)
├── .env.example                     # Template .env
└── .gitignore
```

---

## 🔀 Routing Map (App.jsx)

```
/ (BrowserRouter)
│
├── /                    → MainLayout
│   ├── (index)          → Home.jsx
│   ├── /movies          → MovieList.jsx
│   ├── /movies/:id      → MovieDetail/index.jsx
│   ├── /booking         → Booking/index.jsx
│   ├── /hall            → Hall.jsx
│   ├── /hall/:id        → HallDetail.jsx
│   ├── /news            → (placeholder — chưa có trang)
│   └── /profile         → Profile/index.jsx
│
├── /register            → Register/index.jsx  (no layout)
├── /login               → Login.jsx     (no layout)
│
└── /admin               → ProtectedRoute → AdminLayout
    ├── (index)          → AdminDashboard.jsx
    └── /admin/movies    → AdminMovies/index.jsx
```

> Tất cả pages đều dùng React.lazy + Suspense để code-splitting.
> Do cấu hình dev server của Vite không tự động resolve thư mục cho các lazy load dynamic imports, các import này trong `App.jsx` được trỏ tường minh đến file `/index.jsx`.

---

## 🏪 State Management (Zustand)

### authStore.js
| State | Type | Mô tả |
|---|---|---|
| `user` | Object / null | Thông tin người dùng hiện tại |
| `token` | string / null | JWT token |

| Action | Mô tả |
|---|---|
| `login(userData, token)` | Lưu user + token vào localStorage & store |
| `logout()` | Xóa user + token khỏi localStorage & store |
| `updateUser(data)` | Cập nhật thông tin user |

### bookingStore.js
Quản lý toàn bộ luồng đặt vé: chọn phim → chọn suất → chọn ghế → xác nhận.

### trailerStore.js
Quản lý trạng thái mở/đóng TrailerModal.

---

## 🌐 Services Layer

```
services/
├── apiConfig.js       ← Đọc VITE_API_URL & VITE_USE_MOCK_DATA từ .env / localStorage
├── apiClient.js       ← Axios instance (baseURL, timeout, withCredentials)
│                         interceptors: auto-attach Bearer token | parse response.data
├── authService.js     ← login(), register(), getProfile(), updateProfile()
├── movieService.js    ← Facade: if(USE_MOCK) → movieMockService else → movieApiService
├── movieApiService.js ← Gọi real API: GET /movies, /movies/:id, ...
└── movieMockService.js← Đọc mocks/movies.json, giả lập delay
```

Chuyển đổi Mock vs Real API (trong console trình duyệt):
```js
window.toggleMockData(false)  // Dùng real API
window.toggleMockData(true)   // Dùng mock data
```

---

## 🔐 Authentication Flow

1. User đăng nhập qua `authService.login()` → backend trả về `{ user, token }`
2. `authStore.login()` lưu vào `localStorage` + Zustand store
3. `apiClient` tự động attach `Authorization: Bearer <token>` vào mọi request
4. `ProtectedRoute` kiểm tra `authStore.user` — nếu null redirect về `/login`
5. Admin role được kiểm tra từ `user.role === 'ADMIN'`

---

## 📝 Ghi chú quan trọng

- **Mock Mode mặc định `true`** — backend có thể offline trong quá trình phát triển FE
- **Tái cấu trúc (Refactoring):** Trang `Booking.jsx` (~2100 dòng) và `Profile.jsx` đã được tách nhỏ thành các sub-components mô-đun hóa độc lập nằm trong các thư mục cùng tên.
- `news` route chưa có trang, chỉ là placeholder `<div>`
- Backend base URL: `http://localhost:8080/api` (xem `.env`)
