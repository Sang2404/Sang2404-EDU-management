# ✅ Đã khắc phục lỗi đăng nhập

## 🐛 Vấn đề đã tìm thấy
Frontend đang kết nối đến **port 5000** nhưng backend đang chạy trên **port 5001**

## 🔧 Đã sửa
- File: `web-app/src/config/axios.js`
- Thay đổi: `http://localhost:5000/api` → `http://localhost:5001/api`

## ✅ Trạng thái hiện tại
- ✅ Backend đang chạy: http://localhost:5001
- ✅ Frontend đang chạy: http://localhost:3000
- ✅ Database có 3 tài khoản:
  - skillsaanh@gmail.com (ADMIN)
  - sinfour503@gmail.com (LECTURER)
  - 2224802010365@student.tdmu.edu.vn (STUDENT)
- ✅ Axios đã được cấu hình đúng port
- ✅ Frontend đã tự động reload với cấu hình mới

## 🎯 Bây giờ bạn có thể đăng nhập

1. Mở trình duyệt: http://localhost:3000
2. Click "Đăng nhập bằng Google"
3. Chọn một trong 3 email trên
4. Hệ thống sẽ tự động chuyển hướng:
   - Admin → /admin/dashboard
   - Lecturer → /lecturer/dashboard
   - Student → /student/dashboard

## 🧪 Kiểm tra nhanh

Nếu vẫn gặp vấn đề, mở Console (F12) và kiểm tra:
- Tab Console: Xem có lỗi JavaScript không
- Tab Network: Xem request đến `/api/auth/login` có thành công không

## 📝 Lưu ý quan trọng

Hệ thống sử dụng **Google Sign-in** (Firebase Authentication):
- KHÔNG có mật khẩu truyền thống
- Chỉ email trong database mới được phép đăng nhập
- Email phải khớp chính xác với một trong 3 email trên
