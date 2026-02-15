# 🎓 Xây dựng ứng dụng đa nền tảng quản lý sinh viên

## 📋 Tính năng chi tiết

### 👨‍💼 Admin (9 trang)
- ✅ Quản lý người dùng (Thêm/Sửa/Xóa/Khóa tài khoản + Nhập Excel)
- ✅ Quản lý Khoa & Ngành học (+ Nhập Excel)
- ✅ Quản lý Môn học (+ Nhập Excel)
- ✅ Quản lý Lớp học phần (+ Nhập Excel)
- ✅ Xếp lịch học (+ Nhập Excel)
- ✅ Gán sinh viên vào lớp
- ✅ Duyệt bảng điểm
- ✅ Xử lý yêu cầu học vụ (Phúc khảo/Bảo lưu/Học lại)
- ✅ Thống kê & Báo cáo (4 loại biểu đồ)

### 👨‍🏫 Giảng viên (3 trang)
- ✅ Xem danh sách lớp giảng dạy
- ✅ Xem danh sách sinh viên trong lớp
- ✅ Nhập và quản lý điểm (Chuyên cần, Giữa kỳ, Cuối kỳ)
- ✅ Gửi duyệt bảng điểm
- ✅ Xem lịch giảng dạy (Tuần/Tháng)

### 👨‍🎓 Sinh viên (4 trang)
- ✅ Xem thời khóa biểu (Tuần/Tháng)
- ✅ Xem bảng điểm (GPA, Điểm chữ, Xếp loại)
- ✅ Xem danh sách lớp đã đăng ký
- ✅ Gửi yêu cầu học vụ (Phúc khảo/Bảo lưu/Học lại)

## �️ Công nghệ sử dụng

### Backend
- **Node.js v22.20.0** + **Express.js v4.18.2**
- **PostgreSQL** - Database (15 tables)
- **Firebase Admin SDK v13.6.0** - Authentication
- **xlsx** - Excel import/export

### Frontend
- **React 18** + **Vite 5**
- **Ant Design v5** - UI Components
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **Firebase SDK** - Google Sign-in
- **xlsx** - Excel processing

## 📦 Cài đặt

### Yêu cầu
- Node.js (v18 trở lên)
- PostgreSQL (v12 trở lên)
- Firebase Account

### 1. Clone repository

```bash
git clone https://github.com/Sang2404/Sang2404-EDU-management.git
cd Sang2404-EDU-management
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

#### Cách 1: Khởi động đơn giản (Khuyến nghị)

**Windows:**
```bash
# Khởi động cả Backend và Frontend
start.bat

# Dừng tất cả
stop.bat
```

**Mac/Linux:**
```bash
# Terminal 1: Backend
cd server && npm start

# Terminal 2: Frontend  
cd web-app && npm run dev
```

#### Cách 2: Khởi động thủ công

```bash
# Backend (Terminal 1)
cd server
npm start

# Frontend (Terminal 2)
cd web-app
npm run dev
```

**Địa chỉ truy cập:**
- Backend API: http://localhost:5001
- Frontend Web: http://localhost:3000


## 📁 Cấu trúc dự án

```
Sang2404-EDU-management/
├── server/                 # Backend (Node.js + Express)
│   ├── config/            # Database & Firebase config
│   ├── controllers/       # Business logic
│   │   ├── adminController.js      # Admin APIs + Bulk Import
│   │   ├── authController.js       # Authentication
│   │   ├── gradesController.js     # Grades management
│   │   ├── lecturersController.js  # Lecturer APIs
│   │   └── ...
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   └── server.js         # Entry point
│
├── web-app/              # Frontend (React + Vite)
│   ├── public/           # Static assets (logo)
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   │   ├── MainLayout.jsx      # Main layout with sidebar
│   │   │   └── ProtectedRoute.jsx  # Route protection
│   │   ├── pages/        # Page components
│   │   │   ├── admin/    # 9 Admin pages
│   │   │   ├── lecturer/ # 3 Lecturer pages
│   │   │   ├── student/  # 4 Student pages
│   │   │   └── Login.jsx
│   │   ├── config/       # Axios & Firebase config
│   │   ├── utils/        # Helper functions
│   │   │   └── importResultModal.jsx  # Excel import result display
│   │   └── App.jsx       # Main app component
│   └── index.html
│
├── database/             # Database schema & migrations
│   ├── schema.sql        # Main schema (15 tables)
│   └── migrations/       # Migration scripts
│
├── EXCEL_IMPORT_GUIDE.md      # Hướng dẫn nhập Excel
├── IMPROVEMENT_ROADMAP.txt    # Kế hoạch phát triển
├── PROJECT_STATUS.md          # Trạng thái dự án
└── README.md
```

## 📊 Nhập Excel hàng loạt

Hệ thống hỗ trợ nhập dữ liệu hàng loạt qua Excel cho:

1. **Người dùng** (Users) - Email, Username, Full Name, Role
2. **Môn học** (Subjects) - Mã môn, Tên môn, Số tín chỉ
3. **Lớp học phần** (Course Sections) - Môn học, Giảng viên, Học kỳ
4. **Lịch dạy** (Schedules) - Thứ, Tiết, Phòng học
5. **Khoa** (Faculties) - Mã khoa, Tên khoa

Chi tiết: [EXCEL_IMPORT_GUIDE.md](EXCEL_IMPORT_GUIDE.md)

## � Tài liệu

- [📊 EXCEL_IMPORT_GUIDE.md](EXCEL_IMPORT_GUIDE.md) - Hướng dẫn nhập Excel
- [📈 PROJECT_STATUS.md](PROJECT_STATUS.md) - Trạng thái dự án chi tiết
- [🚀 IMPROVEMENT_ROADMAP.txt](IMPROVEMENT_ROADMAP.txt) - Kế hoạch phát triển

## � Thống kê dự áng

- **Web App**: 47/47 tasks (100% ✅)
- **Mobile App**: 0/41 tasks (0% ⏳)
- **Tổng tiến độ**: 47/88 tasks (53.4%)
- **Backend APIs**: ~50 endpoints
- **Frontend Pages**: 17 pages
- **Database Tables**: 15 tables
- **Lines of Code**: ~15,000+ lines

## 🎯 Roadmap

### Đã hoàn thành ✅
- [x] Web App (100%)
- [x] Excel Import/Export
- [x] Google Authentication
- [x] Role-based Access Control
- [x] Statistics & Reports

### Đang phát triển 🚧
- [ ] Mobile App (Flutter)
- [ ] Email Notifications
- [ ] Profile Management
- [ ] Advanced Search
- [ ] Audit Logs

### Kế hoạch tương lai 📅
- [ ] Real-time Notifications
- [ ] Chat/Messaging
- [ ] File Attachments
- [ ] PDF Transcript Generation
- [ ] Multi-language Support

Chi tiết: [IMPROVEMENT_ROADMAP.txt](IMPROVEMENT_ROADMAP.txt)


