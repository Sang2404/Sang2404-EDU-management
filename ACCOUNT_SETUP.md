# 🔐 Hướng dẫn Cập nhật Tài khoản

## 📋 Thông tin Tài khoản Mới

### 1. **ADMIN** (Quản trị viên)
```
Email:    skillsaanh@gmail.com
Username: ADMIN01
Role:     ADMIN
Họ tên:   Quản trị viên
```

### 2. **LECTURER** (Giảng viên)
```
Email:      sinfour503@gmail.com
Username:   GV001
Role:       LECTURER
Họ tên:     Nguyễn Văn A
Mã GV:      GV001
Khoa:       IET (Viện Kỹ thuật - Công nghệ)
Học vị:     Thạc sĩ
```

### 3. **STUDENT** (Sinh viên)
```
Email:      2224802010365@student.tdmu.edu.vn
Username:   2224802010365
Role:       STUDENT
Họ tên:     Nguyễn Văn B
MSSV:       2224802010365
Lớp:        D22HT01 (ĐH CNTT K14 - Lớp 01)
Ngành:      Công nghệ thông tin
```

## 🚀 Cách Cập nhật Database

### Phương pháp 1: Sử dụng Script Node.js (Khuyến nghị)

```bash
cd server
node update_accounts.js
```

Script này sẽ:
- ✅ Tự động cập nhật hoặc tạo mới các tài khoản
- ✅ Tạo các bảng liên quan (faculties, majors, classes, lecturers, students)
- ✅ Hiển thị kết quả xác nhận
- ✅ Không xóa dữ liệu cũ (an toàn)

### Phương pháp 2: Chạy SQL trực tiếp

1. Mở pgAdmin hoặc psql
2. Kết nối đến database `student_management`
3. Chạy file: `database/migrations/update_user_accounts.sql`

### Phương pháp 3: Reset toàn bộ Database (Nếu muốn bắt đầu lại)

```bash
# Trong pgAdmin hoặc psql
DROP DATABASE student_management;
CREATE DATABASE student_management;

# Sau đó chạy lại schema
psql -U postgres -d student_management -f database/schema.sql
```

## 🔑 Cách Đăng nhập

### Bước 1: Khởi động Server
```bash
cd server
npm start
```

### Bước 2: Khởi động Web App
```bash
cd web-app
npm run dev
```

### Bước 3: Truy cập và Đăng nhập
1. Mở trình duyệt: `http://localhost:5173`
2. Nhấn nút **"Đăng nhập bằng Google"**
3. Chọn tài khoản Google tương ứng:
   - `skillsaanh@gmail.com` → Vào trang Admin
   - `sinfour503@gmail.com` → Vào trang Giảng viên
   - `2224802010365@student.tdmu.edu.vn` → Vào trang Sinh viên

## ⚠️ Lưu ý Quan trọng

### 1. Firebase Authentication
- Các email này phải được đăng ký với Google
- Nếu email chưa có tài khoản Google, cần tạo trước
- Email sinh viên `@student.tdmu.edu.vn` phải là email thật của trường

### 2. Whitelist
- Chỉ email có trong database mới đăng nhập được
- Nếu đăng nhập bằng email khác → Sẽ bị từ chối

### 3. Phân quyền
- **ADMIN**: Truy cập tất cả chức năng quản trị
- **LECTURER**: Xem lớp giảng dạy, nhập điểm, xem lịch
- **STUDENT**: Xem lịch học, xem điểm, gửi yêu cầu học vụ

## 🔧 Xử lý Sự cố

### Lỗi: "Email not found in database"
**Nguyên nhân**: Email chưa có trong database  
**Giải pháp**: Chạy lại script `update_accounts.js`

### Lỗi: "User is not active"
**Nguyên nhân**: Tài khoản bị khóa (`is_active = false`)  
**Giải pháp**: 
```sql
UPDATE users SET is_active = true WHERE email = 'your-email@gmail.com';
```

### Lỗi: "Firebase authentication failed"
**Nguyên nhân**: Cấu hình Firebase chưa đúng  
**Giải pháp**: Kiểm tra file `server/config/firebase.js` và `web-app/src/config/firebase.js`

### Lỗi: "Cannot connect to database"
**Nguyên nhân**: PostgreSQL chưa chạy hoặc cấu hình sai  
**Giải pháp**: 
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra file `server/.env`:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=student_management
   DB_PASSWORD=your_password
   DB_PORT=5432
   ```

## 📊 Kiểm tra Tài khoản

### Xem tất cả users trong database:
```sql
SELECT 
    u.email,
    u.username,
    u.role,
    u.full_name,
    u.is_active,
    CASE 
        WHEN u.role = 'LECTURER' THEN l.lecturer_id
        WHEN u.role = 'STUDENT' THEN s.student_id
        ELSE NULL
    END as role_id
FROM users u
LEFT JOIN lecturers l ON u.user_id = l.user_id
LEFT JOIN students s ON u.user_id = s.user_id
ORDER BY u.role, u.email;
```

### Kiểm tra tài khoản cụ thể:
```sql
SELECT * FROM users WHERE email = 'skillsaanh@gmail.com';
SELECT * FROM lecturers WHERE lecturer_id = 'GV001';
SELECT * FROM students WHERE student_id = '2224802010365';
```

## 🎯 Thêm Tài khoản Mới

### Qua Admin UI (Sau khi đăng nhập):
1. Đăng nhập với tài khoản Admin
2. Vào **Quản lý Người dùng**
3. Nhấn **Thêm người dùng**
4. Điền thông tin và lưu

### Qua SQL:
```sql
-- Thêm user mới
INSERT INTO users (email, username, role, full_name, is_active) 
VALUES ('newemail@gmail.com', 'USER_CODE', 'ROLE', 'Họ và Tên', true);

-- Nếu là LECTURER
INSERT INTO lecturers (lecturer_id, user_id, faculty_id, degree) 
VALUES ('GV002', (SELECT user_id FROM users WHERE email='newemail@gmail.com'), 'IET', 'Thạc sĩ');

-- Nếu là STUDENT
INSERT INTO students (student_id, user_id, class_id, status) 
VALUES ('2224802010366', (SELECT user_id FROM users WHERE email='newemail@gmail.com'), 'D22HT01', 'STUDYING');
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. ✅ PostgreSQL đang chạy
2. ✅ Server backend đang chạy (port 5000)
3. ✅ Web app đang chạy (port 5173)
4. ✅ Firebase đã được cấu hình đúng
5. ✅ Email đã có trong database
6. ✅ Tài khoản `is_active = true`

---

**Cập nhật lần cuối**: 2024  
**Phiên bản**: 1.0
