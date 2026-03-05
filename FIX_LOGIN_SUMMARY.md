# Tóm tắt Fix Lỗi Đăng Nhập

## Vấn đề
User không đăng nhập được bằng email `skillsanh@gmail.com`, gặp lỗi 401 Unauthorized.

## Đã làm gì

### 1. Thêm user vào database ✅
- Tạo script `server/check_and_add_user.js` để kiểm tra và thêm user
- Xác nhận user `skillsanh@gmail.com` đã có trong database với:
  - role: ADMIN
  - is_active: TRUE
  - user_id: 12

### 2. Cải thiện logging ✅

**Backend (`server/controllers/authController.js`):**
- Thêm logs chi tiết cho từng bước xác thực
- Hiển thị email được xác thực từ Firebase token
- Hiển thị kết quả tìm kiếm trong database
- Hiển thị thông tin user khi đăng nhập thành công

**Frontend (`web-app/src/pages/Login.jsx`):**
- Thêm logs cho từng bước đăng nhập
- Hiển thị email và token (50 ký tự đầu)
- Hiển thị response từ backend
- Hiển thị lỗi chi tiết khi thất bại

### 3. Tạo tài liệu debug ✅
- Cập nhật `TEST_LOGIN.md` với hướng dẫn chi tiết
- Thêm checklist kiểm tra trước khi đăng nhập
- Hướng dẫn kiểm tra Firebase configuration
- Hướng dẫn debug nâng cao

## Các bước tiếp theo

### Bước 1: Restart Backend
```bash
# Dừng server hiện tại (Ctrl+C)
cd server
npm start
```

### Bước 2: Restart Frontend (nếu cần)
```bash
# Dừng dev server (Ctrl+C)
cd web-app
npm run dev
```

### Bước 3: Thử đăng nhập lại
1. Mở http://localhost:3000
2. Click "Đăng nhập bằng Google"
3. Chọn tài khoản `skillsanh@gmail.com`
4. Xem logs trong:
   - Chrome DevTools Console (F12)
   - Terminal Backend

### Bước 4: Kiểm tra logs

**Logs thành công sẽ như thế này:**

Frontend Console:
```
🚀 Bắt đầu đăng nhập Google...
✅ Đăng nhập Google thành công
📧 Email: skillsanh@gmail.com
🔑 Token đã lấy được (50 ký tự đầu): eyJhbGciOiJSUzI1NiIsImtpZCI6IjJkOWE...
📡 Đang gửi request đến backend...
✅ Backend response: {message: "Đăng nhập thành công", user: {...}}
```

Backend Terminal:
```
🔐 Đang xác thực token...
✅ Email đã xác thực từ Token: skillsanh@gmail.com
🔍 Đang tìm user trong database: skillsanh@gmail.com
📊 Kết quả tìm kiếm: 1 user(s)
✅ Đăng nhập thành công: skillsanh@gmail.com - ADMIN
```

## Nếu vẫn lỗi

### Kiểm tra Firebase serviceAccountKey.json
```bash
# Kiểm tra file có tồn tại không
ls server/config/serviceAccountKey.json
```

Nếu thiếu file:
1. Vào https://console.firebase.google.com/
2. Chọn project: student-management-cc48e
3. Project Settings > Service Accounts
4. Generate New Private Key
5. Lưu vào `server/config/serviceAccountKey.json`

### Kiểm tra database connection
```bash
node server/check_and_add_user.js
```

Kết quả phải hiển thị user `skillsanh@gmail.com` với is_active = true.

### Kiểm tra email chính xác
Email phải khớp chính xác:
- ✅ skillsanh@gmail.com (đúng)
- ❌ skillsaanh@gmail.com (sai - có 2 chữ a)

## Files đã thay đổi

1. `server/controllers/authController.js` - Thêm logs chi tiết
2. `web-app/src/pages/Login.jsx` - Thêm logs chi tiết
3. `server/check_and_add_user.js` - Script kiểm tra và thêm user
4. `TEST_LOGIN.md` - Hướng dẫn debug
5. `FIX_LOGIN_SUMMARY.md` - File này

## Kết luận

Đã chuẩn bị đầy đủ để debug lỗi đăng nhập. Hãy restart backend và thử đăng nhập lại, sau đó kiểm tra logs để xác định vấn đề chính xác.
