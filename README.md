# 🎓 Student Management System (Hệ thống Quản lý Sinh viên)

Hệ thống quản lý sinh viên toàn diện với các tính năng quản lý người dùng, lớp học phần, điểm số, lịch học và thống kê.

## 📋 Tính năng chính

### 👨‍💼 Admin
- ✅ Quản lý người dùng (Thêm/Sửa/Xóa/Khóa tài khoản)
- ✅ Quản lý Khoa & Ngành học
- ✅ Quản lý Môn học
- ✅ Quản lý Lớp học phần
- ✅ Xếp lịch học
- ✅ Gán sinh viên vào lớp
- ✅ Duyệt bảng điểm
- ✅ Xử lý yêu cầu học vụ
- ✅ Thống kê & Báo cáo

### 👨‍🏫 Giảng viên
- ✅ Xem danh sách lớp giảng dạy
- ✅ Xem danh sách sinh viên
- ✅ Nhập và quản lý điểm

### 👨‍🎓 Sinh viên
- 🚧 Xem lịch học (Đang phát triển)
- 🚧 Xem điểm số (Đang phát triển)
- 🚧 Gửi yêu cầu học vụ (Đang phát triển)

## 🛠️ Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** - Database
- **Firebase Admin SDK** - Authentication

### Frontend
- **React** + **Vite**
- **Ant Design** - UI Components
- **React Router** - Routing
- **Axios** - HTTP Client
- **Firebase** - Google Sign-in

## 📦 Cài đặt

### Yêu cầu
- Node.js (v14 trở lên)
- PostgreSQL (v12 trở lên)
- Firebase Account

### 1. Clone repository

```bash
git clone https://github.com/Sang2404/EDU-management.git
cd EDU-management
```

### 2. Cài đặt dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../web-app
npm install
```

### 3. Cấu hình Database

1. Tạo database PostgreSQL:
```sql
CREATE DATABASE student_management;
```

2. Chạy schema:
```bash
psql -U postgres -d student_management -f database/schema.sql
```

Hoặc dùng pgAdmin:
- Mở pgAdmin 4
- Right-click database → Query Tool
- Mở file `database/schema.sql`
- Execute (F5)

### 4. Cấu hình Backend

Tạo file `server/.env`:

```env
PORT=5001
DB_USER=postgres
DB_HOST=127.0.0.1
DB_NAME=student_management
DB_PASSWORD=your_password
DB_PORT=5432
```

### 5. Cấu hình Firebase

1. Tạo Firebase project tại [Firebase Console](https://console.firebase.google.com)
2. Enable Google Authentication
3. Download Service Account Key
4. Lưu vào `server/config/serviceAccountKey.json`
5. Cập nhật Firebase config trong `web-app/src/config/firebase.js`

### 6. Khởi động ứng dụng

```bash
# Backend (Terminal 1)
cd server
npm start

# Frontend (Terminal 2)
cd web-app
npm run dev
```

Backend: http://localhost:5001  
Frontend: http://localhost:3000

## 🔐 Tài khoản mặc định

Sau khi chạy schema, hệ thống có 3 tài khoản test:

| Role | Email | Username |
|------|-------|----------|
| Admin | skillsaanh@gmail.com | ADMIN01 |
| Lecturer | sinfour503@gmail.com | GV001 |
| Student | 2224802010365@student.tdmu.edu.vn | 2224802010365 |

**Lưu ý:** Hệ thống sử dụng Google Sign-in, không có mật khẩu truyền thống.

## 📁 Cấu trúc dự án

```
EDU-management/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database & Firebase config
│   ├── controllers/       # Business logic
│   ├── routes/           # API routes
│   └── server.js         # Entry point
├── web-app/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── config/       # Axios & Firebase config
│   │   └── App.jsx       # Main app component
│   └── index.html
├── database/             # Database schema & migrations
│   ├── schema.sql        # Main schema
│   └── migrations/       # Migration scripts
└── README.md
```

## 🧪 Testing

```bash
# Test database connection
cd server
node test_db_direct.js

# Test login flow
node test_login_flow.js

# Test specific features
node test_statistics.js
node test_grades.js
node test_schedules.js
```

## 📚 Tài liệu

- [Quick Setup Guide](QUICK_SETUP_GUIDE.md) - Hướng dẫn setup nhanh
- [Login Troubleshooting](LOGIN_TROUBLESHOOTING.md) - Khắc phục lỗi đăng nhập
- [Account Setup](ACCOUNT_SETUP.md) - Quản lý tài khoản
- [Implementation Report](IMPLEMENTATION_REPORT.md) - Báo cáo triển khai

## 🐛 Troubleshooting

### Lỗi đăng nhập
- Kiểm tra email có trong database không
- Kiểm tra Firebase config
- Xem chi tiết: [LOGIN_TROUBLESHOOTING.md](LOGIN_TROUBLESHOOTING.md)

### Lỗi database
- Kiểm tra PostgreSQL đang chạy
- Kiểm tra thông tin kết nối trong `.env`
- Chạy lại schema nếu cần

### Lỗi port
- Backend mặc định: 5001
- Frontend mặc định: 3000
- Đảm bảo không có ứng dụng khác dùng các port này

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📝 License

Dự án này được phát triển cho mục đích học tập.

## 👥 Tác giả

- **Sang Nguyen** - [GitHub](https://github.com/Sang2404)

## 🙏 Acknowledgments

- Ant Design team
- Firebase team
- PostgreSQL community
