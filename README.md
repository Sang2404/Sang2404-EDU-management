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
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── config/            # Cấu hình
├── web-app/               # Frontend
│   ├── src/
│   │   ├── pages/         # Trang chính
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

## 🎯 API Chính

### Nhập Điểm
- `POST /grades` - Lưu điểm
- `POST /grades/submit` - Gửi duyệt
- `GET /grades/students/:studentId` - Xem điểm

### Duyệt Điểm
- `GET /admin/grades/pending` - Danh sách chờ duyệt
- `POST /admin/sections/:sectionId/grades/approve` - Phê duyệt
- `POST /admin/sections/:sectionId/grades/reject` - Từ chối

## � Công Thức Tính Điểm

```
Điểm tổng kết = Chuyên cần × 10% + Giữa kỳ × 30% + Cuối kỳ × 60%
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
**Cập nhật**: 2026-03-11

