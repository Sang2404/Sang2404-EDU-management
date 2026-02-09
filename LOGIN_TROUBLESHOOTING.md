# Hướng dẫn khắc phục lỗi đăng nhập

## ✅ Trạng thái hiện tại
- ✅ Backend đang chạy trên port 5001
- ✅ Frontend đang chạy trên port 3000
- ✅ Database có 3 tài khoản đã được cấu hình đúng:
  - `skillsaanh@gmail.com` (ADMIN)
  - `sinfour503@gmail.com` (LECTURER)
  - `2224802010365@student.tdmu.edu.vn` (STUDENT)
- ✅ Firebase Admin SDK đã được khởi tạo

## 🔍 Các bước kiểm tra khi không đăng nhập được

### Bước 1: Kiểm tra Console trong trình duyệt
1. Mở http://localhost:3000
2. Nhấn F12 để mở Developer Tools
3. Chuyển sang tab "Console"
4. Click "Đăng nhập bằng Google"
5. Xem có lỗi gì không

### Bước 2: Kiểm tra Network Request
1. Trong Developer Tools, chuyển sang tab "Network"
2. Click "Đăng nhập bằng Google"
3. Tìm request đến `/auth/login`
4. Xem Response có lỗi gì không

### Bước 3: Kiểm tra Backend Logs
Xem output của backend server để thấy lỗi chi tiết:
```bash
# Trong terminal đang chạy backend, bạn sẽ thấy:
✅ Email đã xác thực từ Token: [email của bạn]
```

## 🚨 Các lỗi thường gặp

### Lỗi 1: "Không được phép. Tài khoản không tồn tại..."
**Nguyên nhân**: Email bạn đăng nhập không có trong database

**Giải pháp**: 
- Đảm bảo bạn đăng nhập bằng một trong 3 email sau:
  - skillsaanh@gmail.com
  - sinfour503@gmail.com
  - 2224802010365@student.tdmu.edu.vn

### Lỗi 2: "Firebase: Error (auth/popup-blocked)"
**Nguyên nhân**: Trình duyệt chặn popup

**Giải pháp**:
- Cho phép popup từ localhost:3000
- Hoặc thử trình duyệt khác (Chrome, Edge)

### Lỗi 3: "Network Error" hoặc không kết nối được backend
**Nguyên nhân**: Backend không chạy hoặc sai port

**Giải pháp**:
```bash
# Kiểm tra backend có chạy không
netstat -ano | findstr :5001

# Nếu không có kết quả, khởi động lại backend
cd server
npm start
```

### Lỗi 4: "Firebase Admin SDK not initialized"
**Nguyên nhân**: Thiếu file serviceAccountKey.json

**Giải pháp**:
1. Vào Firebase Console: https://console.firebase.google.com
2. Chọn project "student-management-cc48e"
3. Settings > Service Accounts
4. Click "Generate new private key"
5. Lưu file vào `server/config/serviceAccountKey.json`

## 🧪 Test thủ công

### Test 1: Kiểm tra database
```bash
cd server
node check_users.js
```
Kết quả mong đợi: Hiển thị 3 users

### Test 2: Kiểm tra toàn bộ login flow
```bash
cd server
node test_login_flow.js
```
Kết quả mong đợi: Tất cả checks đều pass

### Test 3: Kiểm tra backend API trực tiếp
Mở Postman hoặc curl:
```bash
# Test health check
curl http://localhost:5001/api/health
```

## 📝 Quy trình đăng nhập đúng

1. Mở http://localhost:3000
2. Click "Đăng nhập bằng Google"
3. Chọn tài khoản Google (phải là một trong 3 email trên)
4. Cho phép quyền truy cập
5. Hệ thống sẽ:
   - Lấy token từ Firebase
   - Gửi token đến backend
   - Backend xác thực token
   - Backend kiểm tra email trong database
   - Trả về thông tin user và role
   - Frontend chuyển hướng đến trang tương ứng:
     - Admin → /admin/dashboard
     - Lecturer → /lecturer/dashboard
     - Student → /student/dashboard

## 🔧 Khởi động lại toàn bộ hệ thống

Nếu vẫn không được, thử khởi động lại:

```bash
# 1. Dừng tất cả processes
# Nhấn Ctrl+C trong các terminal đang chạy

# 2. Khởi động backend
cd server
npm start

# 3. Khởi động frontend (terminal mới)
cd web-app
npm run dev

# 4. Mở trình duyệt
# http://localhost:3000
```

## 📞 Liên hệ hỗ trợ

Nếu vẫn gặp vấn đề, cung cấp thông tin sau:
1. Screenshot lỗi trong Console (F12)
2. Screenshot Network tab khi gọi /auth/login
3. Output của backend terminal
4. Email bạn đang dùng để đăng nhập
