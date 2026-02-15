# 🚀 Hướng dẫn Khởi động Nhanh

## Bước 1: Chuẩn bị (Chỉ làm 1 lần)

### 1.1. Cài đặt PostgreSQL
- Tải và cài đặt PostgreSQL
- Tạo database: `student_management`
- Chạy file: `database/schema.sql`

### 1.2. Cài đặt Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd web-app
npm install
```

### 1.3. Cấu hình Backend
Tạo file `server/.env`:
```env
PORT=5001
DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=student_management
DB_PASSWORD=your_password
DB_PORT=5432
```

### 1.4. Cấu hình Firebase
- Tạo Firebase project
- Enable Google Authentication
- Download Service Account Key → `server/config/serviceAccountKey.json`
- Cập nhật config trong `web-app/src/config/firebase.js`

---

## Bước 2: Khởi động (Mỗi lần sử dụng)

### Windows:
```bash
# Khởi động
start.bat

# Dừng
stop.bat
```

### Mac/Linux:
```bash
# Terminal 1
cd server && npm start

# Terminal 2
cd web-app && npm run dev
```

---

## Bước 3: Truy cập

- 🌐 **Web App**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:5001

---

## Tài khoản Test

| Role | Email |
|------|-------|
| Admin | skillsaanh@gmail.com |
| Lecturer | sinfour503@gmail.com |
| Student | 2224802010365@student.tdmu.edu.vn |

**Lưu ý:** Đăng nhập bằng Google Sign-in

---

## Troubleshooting

### ❌ Lỗi: Port đã được sử dụng
```bash
# Dừng tất cả Node.js processes
stop.bat
```

### ❌ Lỗi: Cannot connect to database
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra thông tin trong `server/.env`

### ❌ Lỗi: Firebase authentication failed
- Kiểm tra `serviceAccountKey.json`
- Kiểm tra Firebase config trong `web-app/src/config/firebase.js`

---

## Tính năng chính

✅ Quản lý Users, Subjects, Course Sections, Schedules, Faculties
✅ Nhập Excel hàng loạt
✅ Quản lý điểm số
✅ Thống kê & Báo cáo
✅ Phân quyền: Admin, Lecturer, Student

---

**📚 Xem thêm:** [README.md](README.md) | [EXCEL_IMPORT_GUIDE.md](EXCEL_IMPORT_GUIDE.md)
