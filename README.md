# Quản Lý Sinh Viên

Ứng dụng quản lý sinh viên toàn diện với các chức năng: quản lý môn học, lớp học phần, nhập điểm, duyệt điểm, xem điểm, điểm danh, và thống kê.

## 🚀 Công Nghệ

- **Frontend**: React + Vite + Ant Design
- **Backend**: Node.js + Express + PostgreSQL
- **Authentication**: Google Sign-in
- **Real-time**: Socket.io

## � Chức Năng Chính

### Admin
- Quản lý người dùng (sinh viên, giảng viên)
- Quản lý môn học và lớp học phần
- Duyệt bảng điểm
- Xem thống kê

### Giảng Viên
- Nhập điểm cho sinh viên
- Gửi bảng điểm để duyệt
- Xem danh sách lớp học phần
- Ghi danh sinh viên

### Sinh Viên
- Xem bảng điểm đã duyệt
- Xem lịch học
- Xem thông báo
- Gửi yêu cầu học vụ

## 🔧 Cài Đặt

### Yêu Cầu
- Node.js 16+
- PostgreSQL 12+
- npm hoặc yarn

### Backend
```bash
cd server
npm install
npm start
# Server chạy trên port 5001
```

### Frontend
```bash
cd web-app
npm install
npm run dev
# Web app chạy trên port 3001
```

## 📊 Cấu Trúc Dự Án

```
├── server/                 # Backend
│   ├── controllers/        # Logic xử lý
│   │   ├── authController.js           # Xác thực & phân quyền
│   │   ├── adminController.js          # Quản lý & import dữ liệu
│   │   ├── gradesController.js         # Quản lý điểm
│   │   ├── schedulesController.js      # Quản lý lịch học
│   │   ├── requestsController.js       # Xử lý yêu cầu học vụ
│   │   ├── statisticsController.js     # Thống kê & báo cáo
│   │   └── ...
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── config/            # Cấu hình
├── web-app/               # Frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/     # Trang Admin
│   │   │   ├── lecturer/  # Trang Giảng Viên
│   │   │   └── student/   # Trang Sinh Viên
│   │   ├── components/    # Thành phần UI
│   │   ├── context/       # State management
│   │   └── config/        # Cấu hình
│   └── public/            # Static files
└── database/              # Database schema
```

## 🔐 Xác Thực

Ứng dụng sử dụng Google Sign-in. Cần cấu hình:
1. Google OAuth 2.0 credentials
2. Whitelist email trong database

## 📈 Quy Trình Nhập Điểm

1. **Giảng viên nhập điểm** → Status: DRAFT
2. **Giảng viên gửi duyệt** → Status: SUBMITTED
3. **Admin duyệt** → Status: APPROVED
4. **Sinh viên xem điểm** → Chỉ xem APPROVED

## ✨ Tính Năng Nổi Bật

### 1. 🔐 Phân Quyền Người Dùng (Role-Based Access Control)
- 3 vai trò: Admin, Giảng Viên, Sinh Viên
- Kiểm soát truy cập dựa trên role
- Whitelist email cho phép đăng nhập
- Bảo vệ route tự động

### 2. 📊 Nhập Dữ Liệu Hàng Loạt từ Excel (Bulk Import)
- Import người dùng, môn học, lớp học phần, lịch học
- Validate dữ liệu tự động
- Phát hiện trùng lặp và xung đột
- Báo cáo chi tiết: Thành công/Bỏ qua/Lỗi

### 3. 📝 Hệ Thống Quản Lý Điểm & Duyệt Điểm (Grade Flow)
- Quy trình 3 bước: Nhập → Gửi duyệt → Phê duyệt
- Tính điểm tự động: Chuyên cần 10% + Giữa kỳ 30% + Cuối kỳ 60%
- Chuyển đổi thang điểm: 10 → 4 → Chữ (A, B+, C, D, F)
- Sinh viên chỉ xem điểm đã phê duyệt

### 4. 📅 Quản Lý Đào Tạo & Thời Khóa Biểu (Curriculum & Schedule)
- Quản lý môn học, lớp học phần, khoa, ngành
- Lịch học chi tiết: Ngày, tiết, phòng, tuần
- Xem lịch riêng cho sinh viên và giảng viên
- Quản lý phòng học và sức chứa

### 5. 📋 Xử Lý Yêu Cầu Học Vụ (Academic Requests)
- 3 loại yêu cầu: Phúc khảo, Bảo lưu, Học lại
- Quy trình: Sinh viên gửi → Admin xử lý → Phản hồi
- Yêu cầu phản hồi chi tiết từ Admin
- Lịch sử yêu cầu đầy đủ

### 6. 📈 Thống Kê và Báo Cáo (Statistics & Reports)
- Tổng quan: Người dùng, sinh viên, giảng viên, môn học
- Phân tích sinh viên: GPA, top 10, phân bố theo khoa/ngành
- Thống kê lớp: Tỷ lệ lấp đầy, lớp đông/ít nhất
- Phân bố điểm: Tỷ lệ đạt/trượt, điểm trung bình
- Thống kê yêu cầu: Loại, trạng thái, thời gian xử lý

## 🎯 API Chính

### Nhập Điểm
- `POST /grades` - Lưu điểm
- `POST /grades/submit` - Gửi duyệt
- `GET /grades/students/:studentId` - Xem điểm

### Duyệt Điểm
- `GET /admin/grades/pending` - Danh sách chờ duyệt
- `POST /admin/sections/:sectionId/grades/approve` - Phê duyệt
- `POST /admin/sections/:sectionId/grades/reject` - Từ chối

### Nhập Dữ Liệu
- `POST /admin/import/users` - Import người dùng
- `POST /admin/import/subjects` - Import môn học
- `POST /admin/import/course-sections` - Import lớp học phần
- `POST /admin/import/schedules` - Import lịch học

### Yêu Cầu Học Vụ
- `POST /requests` - Gửi yêu cầu
- `GET /requests/my-requests` - Xem yêu cầu của sinh viên
- `GET /admin/requests` - Danh sách yêu cầu (Admin)
- `POST /admin/requests/:id/approve` - Phê duyệt
- `POST /admin/requests/:id/reject` - Từ chối

### Thống Kê
- `GET /statistics/overview` - Tổng quan
- `GET /statistics/students` - Thống kê sinh viên
- `GET /statistics/courses` - Thống kê lớp học phần
- `GET /statistics/grades` - Thống kê điểm
- `GET /statistics/requests` - Thống kê yêu cầu

## 🧮 Công Thức Tính Điểm

```
Điểm tổng kết = Chuyên cần × 10% + Giữa kỳ × 30% + Cuối kỳ × 60%

Chuyển đổi thang điểm:
- Thang 10 → Thang 4: điểm_4 = (điểm_10 × 4) / 10
- Thang 4 → Chữ:
  - A: 3.5 - 4.0
  - B+: 3.0 - 3.4
  - B: 2.5 - 2.9
  - C+: 2.0 - 2.4
  - C: 1.5 - 1.9
  - D+: 1.0 - 1.4
  - D: 0.5 - 0.9
  - F: < 0.5
```

## 🧪 Kiểm Tra

### Tài Khoản Test
- Admin: skillsaanh@gmail.com
- Giảng viên: sinfour503@gmail.com
- Sinh viên: 2224802010365@student.tdmu.edu.vn

### Kiểm Tra Chức Năng
1. Đăng nhập với tài khoản test
2. Thực hiện các chức năng theo vai trò
3. Kiểm tra console (F12) không có lỗi

## 🐛 Troubleshooting

**Lỗi 404 trên endpoint mới**
- Restart server để load routes mới

**Không thể đăng nhập**
- Kiểm tra email có trong whitelist
- Kiểm tra Google OAuth credentials

**Điểm không hiển thị**
- Kiểm tra status là APPROVED
- Refresh page (F5)

## � Hỗ Trợ

Kiểm tra server logs:
```bash
# Terminal server
npm start
```

Kiểm tra browser console:
- Nhấn F12
- Xem tab Console

## � License

MIT

---

**Phiên bản**: 1.0  
**Cập nhật**: 2026-03-12

