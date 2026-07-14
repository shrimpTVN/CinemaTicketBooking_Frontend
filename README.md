# 🎬 CinemaTicketBooking — Frontend

Chào mừng bạn đến với dự án **CinemaTicketBooking (Frontend)**! Đây là giao diện người dùng của hệ thống đặt vé xem phim trực tuyến, được xây dựng bằng công nghệ hiện đại, tối ưu hiệu năng và trải nghiệm người dùng.

> 💡 **Tài liệu chi tiết:** Để hiểu rõ hơn về luồng dữ liệu, cấu trúc cây thư mục chi tiết, sơ đồ định tuyến và cách quản lý trạng thái, vui lòng tham khảo tài liệu [ARCHITECTURE.md](file:///e:/CTU/KTPM%20K49/NLCS/NLCS_FE/CinemaTicketBooking_Frontend/ARCHITECTURE.md).

---

## ⚡ Công nghệ sử dụng (Tech Stack)

*   **UI Library:** React 19 (sử dụng các tính năng mới, tối ưu hóa render).
*   **Build Tool:** Vite 8 (Hot Module Replacement cực nhanh).
*   **CSS Framework:** TailwindCSS v4 (Styling mượt mà, responsive tốt).
*   **State Management:** Zustand v5 (Quản lý state toàn cục gọn nhẹ, dễ bảo trì).
*   **Routing:** React Router DOM v7.
*   **HTTP Client:** Axios v1 (Cấu hình Interceptor tự động lưu và đính kèm token JWT).
*   **Slider/Carousel:** Swiper v12.

---

## ✨ Các chức năng chính

1.  **Trang chủ (Home):** Banner slider phim nổi bật, lọc danh sách phim đang chiếu / sắp chiếu.
2.  **Đặt vé (Booking Flow):** Chọn suất chiếu, sơ đồ chọn ghế trực quan (realtime giả lập), chọn combo bắp nước và các phương thức thanh toán.
3.  **Chi tiết phim (Movie Detail):** Thông tin phim, giới hạn tuổi, trailer, đánh giá và nhận xét từ người dùng.
4.  **Hồ sơ cá nhân (Profile):** Cập nhật thông tin cá nhân, xem lịch sử đặt vé và trạng thái vé Holographic.
5.  **Quản trị (Admin Dashboard):** Thống kê doanh thu, quản lý phim (CRUD) với đầy đủ bộ lọc, toast thông báo trạng thái.

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án

### 📋 Yêu cầu hệ thống
*   [Node.js](https://nodejs.org/) (Khuyến nghị phiên bản LTS từ 18 trở lên).
*   Đã cài đặt `npm` hoặc `yarn`.

### 🛠️ Các bước thực hiện

1.  **Cài đặt các gói phụ thuộc (dependencies):**
    ```bash
    npm install
    ```

2.  **Cấu hình biến môi trường (`.env`):**
    Tạo file `.env` tại thư mục gốc của frontend (hoặc sao chép từ file `.env.example`):
    ```env
    VITE_API_URL=http://localhost:8080/api
    VITE_USE_MOCK_DATA=true
    ```
    *   `VITE_API_URL`: Đường dẫn API kết nối đến Backend Spring Boot.
    *   `VITE_USE_MOCK_DATA`: Đặt `true` để sử dụng dữ liệu giả lập (mock data) từ local khi không có backend chạy. Đặt `false` để kết nối dữ liệu thật từ Backend.

3.  **Chạy server phát triển (Development Server):**
    ```bash
    npm run dev
    ```
    Mở trình duyệt và truy cập: `http://localhost:5173`.

4.  **Xây dựng phiên bản production (Build production):**
    ```bash
    npm run build
    ```

---

## ⚙️ Chế độ Mock Data vs Real API

Trong quá trình phát triển Frontend độc lập, bạn có thể dễ dàng chuyển đổi dữ liệu hiển thị:
*   Mở **Console** của trình duyệt (F12).
*   Để sử dụng API thật từ Backend:
    ```javascript
    window.toggleMockData(false)
    ```
*   Để quay lại sử dụng Mock Data (không cần chạy Backend):
    ```javascript
    window.toggleMockData(true)
    ```
    *(Hệ thống sẽ tự động tải lại trang để áp dụng cấu hình mới).*

---

## 🤝 Liên hệ đóng góp

Nếu bạn gặp lỗi hoặc có đề xuất cải tiến cho giao diện dự án, vui lòng tạo **Issue** hoặc gửi **Pull Request**. Xin cảm ơn!
