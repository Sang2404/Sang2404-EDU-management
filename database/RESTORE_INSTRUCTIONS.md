# Hướng dẫn Restore Database

## File Backup
- **File chính**: `FINAL_DATABASE_BACKUP.sql` ⭐ (Khuyến nghị sử dụng)
- **Ngày tạo**: 06/03/2026
- **Database**: student_management
- **Encoding**: UTF-8 (Tiếng Việt hiển thị đúng)
- **Mô tả**: Backup đầy đủ tất cả dữ liệu của hệ thống quản lý sinh viên

## Nội dung Database

### 1. Tài khoản (Users)
- **ADMIN**: skillsanh@gmail.com
- **Giảng viên 1**: sinfour503@gmail.com (GV001)
  - 10 lớp học phần HK1 2024-2025
  - Môn: Nhập môn Lập trình, CTDL, CSDL, Web, Mạng, HĐH, OOP, Phân tích TK, An toàn TT, AI
- **Giảng viên 2**: trunggiangvien123@gmail.com (GV002)
  - 10 lớp học phần HK2 2024-2025
  - Môn: Python, ML, Computer Vision, Mobile, Blockchain, Cloud, DevOps, Big Data, IoT, Ethical Hacking
- **Sinh viên 1**: 2224802010365@student.tdmu.edu.vn (MSSV: 2224802010365)
  - Đăng ký 10 lớp của GV001
  - Có điểm đầy đủ (7 môn APPROVED, 2 môn SUBMITTED, 1 môn DRAFT)
- **Sinh viên 2**: trungloptruong123@gmail.com (MSSV: 2224802010366)
  - Đăng ký 10 lớp của GV001 (giống sinh viên 1)
  - Đăng ký 10 lớp của GV002 (chưa có điểm - DRAFT)

### 2. Dữ liệu chính
- **Khoa**: 1 khoa (Viện Kỹ thuật - Công nghệ)
- **Ngành**: 1 ngành (Công nghệ thông tin)
- **Lớp hành chính**: 1 lớp (D22HT01)
- **Môn học**: 20 môn
- **Lớp học phần**: 20 lớp (10 HK1 + 10 HK2)
- **Lịch học**: 20 lịch (tiết 1-5 sáng hoặc 6-10 chiều)
- **Điểm**: 30 bản ghi điểm
- **Yêu cầu học vụ**: 6 yêu cầu (PENDING, APPROVED, REJECTED)
- **Thông báo**: 9 thông báo

### 3. Lịch học
Tất cả lịch học được xếp theo quy tắc:
- **Tiết 1-5**: Buổi sáng
- **Tiết 6-10**: Buổi chiều
- **Thứ 2-6**: Mỗi ngày có 2 lớp (1 sáng, 1 chiều)

## Cách Restore

### Phương pháp 1: Sử dụng psql (Khuyến nghị)

```bash
# 1. Xóa database cũ (nếu có)
dropdb -U postgres student_management

# 2. Tạo database mới với encoding UTF-8
createdb -U postgres -E UTF8 student_management

# 3. Restore từ file backup
psql -U postgres -d student_management -f FINAL_DATABASE_BACKUP.sql
```

### Phương pháp 2: Trên Windows với PowerShell

```powershell
# Set encoding UTF-8
chcp 65001

# Set password
$env:PGPASSWORD='123'

# Xóa database cũ
dropdb -U postgres student_management

# Tạo database mới
createdb -U postgres -E UTF8 student_management

# Restore
psql -U postgres -d student_management -f FINAL_DATABASE_BACKUP.sql
```

### Phương pháp 3: Từ pgAdmin
1. Mở pgAdmin
2. Kết nối đến PostgreSQL server
3. Tạo database mới: `student_management` với Encoding = UTF8
4. Chuột phải vào database → Query Tool
5. Mở file `FINAL_DATABASE_BACKUP.sql`
6. Click Execute (F5)

## Lưu ý quan trọng về Encoding
- ⚠️ **Bắt buộc**: Database phải được tạo với encoding UTF-8
- ⚠️ **Windows**: Chạy `chcp 65001` trước khi restore để set UTF-8
- ⚠️ **Kiểm tra**: Sau khi restore, kiểm tra tiếng Việt hiển thị đúng
- ✅ **File đúng**: `FINAL_DATABASE_BACKUP.sql` (đã fix encoding)

## Kiểm tra sau khi Restore

```sql
-- Kiểm tra số lượng users
SELECT role, COUNT(*) FROM users GROUP BY role;
-- Kết quả: ADMIN (1), LECTURER (2), STUDENT (2)

-- Kiểm tra số lượng lớp học phần
SELECT semester, academic_year, COUNT(*) 
FROM course_sections 
GROUP BY semester, academic_year;
-- Kết quả: HK1 2024-2025 (10), HK2 2024-2025 (10)

-- Kiểm tra lịch học
SELECT COUNT(*) FROM schedules;
-- Kết quả: 20

-- Kiểm tra điểm
SELECT status, COUNT(*) FROM grades GROUP BY status;
-- Kết quả: APPROVED (14), SUBMITTED (4), DRAFT (12)
```

## Lưu ý
- File backup này chứa cả schema và data
- Đảm bảo PostgreSQL version tương thích (>= 12)
- Nếu restore vào database đã có dữ liệu, nên xóa database cũ trước
- Password mặc định cho PostgreSQL user: `123` (có thể thay đổi trong file .env)

## Thông tin liên hệ
- Database: student_management
- User: postgres
- Port: 5432
- Host: localhost

## Changelog
- **06/03/2026**: Tạo backup đầy tiên với 4 users, 20 lớp học phần, 30 bản ghi điểm
