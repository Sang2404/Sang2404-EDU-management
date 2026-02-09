# 🚀 Hướng dẫn Setup Nhanh Database

## ✅ TRẠNG THÁI HIỆN TẠI (Updated: 2026-02-09)

**Hệ thống đã sẵn sàng sử dụng!**

- ✅ Backend đang chạy: http://localhost:5001
- ✅ Frontend đang chạy: http://localhost:3000
- ✅ Database đã có 3 tài khoản test
- ✅ Axios đã được cấu hình đúng port (5001)

## 🎯 ĐĂNG NHẬP NGAY

1. Mở trình duyệt: **http://localhost:3000**
2. Click **"Đăng nhập bằng Google"**
3. Chọn một trong 3 email sau:

| Role | Email | Username |
|------|-------|----------|
| **ADMIN** | skillsaanh@gmail.com | ADMIN01 |
| **LECTURER** | sinfour503@gmail.com | GV001 |
| **STUDENT** | 2224802010365@student.tdmu.edu.vn | 2224802010365 |

---

## 🔧 Setup từ đầu (Nếu cần khởi động lại)

## Bước 1: Reset Database trong pgAdmin

1. Mở **pgAdmin 4**
2. Kết nối đến **PostgreSQL** (nhập password nếu cần)
3. Click phải vào database **"student_management"** → **Delete/Drop**
4. Xác nhận xóa

## Bước 2: Tạo lại Database

1. Click phải vào **Databases** → **Create** → **Database**
2. Nhập tên: `student_management`
3. Click **Save**

## Bước 3: Chạy Schema

1. Click vào database **student_management** 
2. Click phải → **Query Tool**
3. Mở file `database/schema.sql` trong project
4. Copy toàn bộ nội dung
5. Paste vào Query Tool
6. Nhấn **Execute** (▶️) hoặc F5
7. Đợi cho đến khi thấy "Query returned successfully"

## Bước 4: Khởi động Backend

Mở Terminal/CMD:

```bash
cd server
npm start
```

Bạn sẽ thấy:
```
✅ Firebase Admin Initialized
🚀 Server running on port 5001
```

## Bước 5: Khởi động Frontend

Mở Terminal/CMD khác:

```bash
cd web-app
npm run dev
```

Bạn sẽ thấy:
```
Local: http://localhost:3000/
```

**Lưu ý**: Frontend chạy trên port **3000**, không phải 5173

## Bước 6: Đăng nhập

1. Mở trình duyệt: `http://localhost:3000`
2. Nhấn **"Đăng nhập bằng Google"**
3. Chọn một trong các email ở trên

## ✅ Xong!

Sau khi đăng nhập, bạn sẽ được chuyển đến:
- **Admin** → Dashboard với đầy đủ chức năng quản trị
- **Lecturer** → Trang danh sách lớp giảng dạy
- **Student** → Trang lịch học (sẽ làm sau)

---

## 🔧 Nếu gặp lỗi:

### "Email not found in database" hoặc "Không được phép"
→ Email chưa có trong database. Kiểm tra lại bước 3 (chạy schema.sql)

### "Cannot connect to server" hoặc "Network Error"
→ Backend chưa chạy hoặc sai port. Kiểm tra:
- Backend phải chạy trên port **5001**
- File `web-app/src/config/axios.js` phải có `baseURL: 'http://localhost:5001/api'`

### "Firebase error" hoặc "popup blocked"
→ Cho phép popup từ localhost:3000 trong trình duyệt

### "Database connection error"
→ Kiểm tra PostgreSQL đang chạy và password trong `server/.env` đúng

### Xem thêm chi tiết
→ Đọc file `LOGIN_TROUBLESHOOTING.md` để biết thêm chi tiết

---

## 🧪 Test Commands (Nếu cần kiểm tra)

```bash
cd server

# Test database connection
node test_db_direct.js

# Check users in database
node check_users.js

# Test full login flow
node test_login_flow.js
```

---

## 📝 Lưu ý:

- ✅ File `schema.sql` đã được cập nhật với 3 email mới
- ✅ Không cần chạy script `update_accounts.js` nữa
- ✅ Chỉ cần chạy `schema.sql` là đủ
- ⚠️ Email phải là email thật để đăng nhập Google
- ⚠️ Backend chạy trên port **5001** (không phải 5000)
- ⚠️ Frontend chạy trên port **3000** (không phải 5173)

---

**Thời gian setup**: ~5 phút  
**Độ khó**: ⭐⭐☆☆☆ (Dễ)
