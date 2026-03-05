# Hướng dẫn Debug Lỗi Đăng Nhập

## Tình trạng hiện tại

✅ User `skillsanh@gmail.com` đã được thêm vào database với role ADMIN và is_active = TRUE

## Các bước kiểm tra

### 1. Kiểm tra Backend đang chạy

```bash
# Kiểm tra server có đang chạy không
curl http://localhost:5001/api/auth/login
```

Nếu server chưa chạy:
```bash
cd server
npm start
```

### 2. Kiểm tra Firebase Configuration

Backend cần file `server/config/serviceAccountKey.json` để xác thực Firebase token.

Kiểm tra xem file có tồn tại không:
```bash
ls server/config/serviceAccountKey.json
```

Nếu thiếu file này, tải về từ Firebase Console:
1. Vào https://console.firebase.google.com/
2. Chọn project: student-management-cc48e
3. Project Settings > Service Accounts
4. Generate New Private Key
5. Lưu file vào `server/config/serviceAccountKey.json`

### 3. Kiểm tra logs khi đăng nhập

Khi bạn thử đăng nhập, backend sẽ in ra logs chi tiết:

```
🔐 Đang xác thực token...
✅ Email đã xác thực từ Token: skillsanh@gmail.com
🔍 Đang tìm user trong database: skillsanh@gmail.com
📊 Kết quả tìm kiếm: 1 user(s)
✅ Đăng nhập thành công: skillsanh@gmail.com - ADMIN
```

Nếu thấy lỗi "❌ User không tồn tại", chạy lại script:
```bash
node server/check_and_add_user.js
```

### 4. Kiểm tra CORS

Lỗi "Cross-Origin-Opener-Policy" trong console là warning từ Firebase, không ảnh hưởng đến login.

### 5. Các email admin có thể dùng

- skillsanh@gmail.com (ADMIN)
- admin@gmail.com (ADMIN)
- admin1@tdmu.edu.vn (ADMIN)
- admin2@tdmu.edu.vn (ADMIN)

## Lỗi thường gặp

### Lỗi 401: "Tài khoản không tồn tại hoặc chưa kích hoạt"

**Nguyên nhân:**
- Email trong Firebase khác với email trong database
- User chưa được thêm vào database
- User có is_active = FALSE

**Giải pháp:**
1. Kiểm tra email chính xác trong Firebase (xem console logs)
2. Chạy script thêm user: `node server/check_and_add_user.js`
3. Kiểm tra database:
```sql
SELECT * FROM users WHERE email = 'skillsanh@gmail.com';
```

### Lỗi: "Firebase Admin Initialization Error"

**Nguyên nhân:** Thiếu file serviceAccountKey.json

**Giải pháp:** Tải file từ Firebase Console (xem bước 2)

### Lỗi: "password authentication failed"

**Nguyên nhân:** Sai password PostgreSQL

**Giải pháp:** Kiểm tra file `server/.env`:
```
DB_PASSWORD=123456
```

## Debug nâng cao

### Kiểm tra token Firebase

Thêm log vào `web-app/src/pages/Login.jsx`:

```javascript
const token = await result.user.getIdToken();
console.log('🔑 Token:', token.substring(0, 50) + '...');
console.log('📧 Email:', result.user.email);
```

### Kiểm tra request đến backend

Mở Network tab trong DevTools, xem request POST đến `/api/auth/login`:
- Status: 401 = Lỗi xác thực
- Response body: Xem message lỗi chi tiết

### Test API trực tiếp

Dùng Postman hoặc curl:

```bash
# Lấy token từ Firebase (copy từ console log)
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_FIREBASE_TOKEN_HERE"}'
```

## Checklist trước khi đăng nhập

- [ ] Backend đang chạy (port 5001)
- [ ] Frontend đang chạy (port 3000)
- [ ] Database đang chạy (PostgreSQL)
- [ ] File serviceAccountKey.json tồn tại
- [ ] User đã được thêm vào database
- [ ] Email đăng nhập khớp với database

## Liên hệ

Nếu vẫn gặp lỗi, cung cấp:
1. Screenshot console logs (cả frontend và backend)
2. Email đang dùng để đăng nhập
3. Response body từ API
