# Hướng dẫn sử dụng tính năng Nhập Excel

## Tính năng đã hoàn thành
✅ Nhập người dùng hàng loạt từ Excel
✅ Nhập môn học hàng loạt từ Excel
✅ Nhập lớp học phần hàng loạt từ Excel
✅ Nhập lịch dạy hàng loạt từ Excel
✅ Nhập khoa hàng loạt từ Excel

## Cách sử dụng

### 1. Nhập người dùng (Users)

1. Đăng nhập với tài khoản Admin
2. Vào trang "Người dùng" (Users)
3. Nhấn nút "Nhập Excel"
4. Tải file mẫu xuống bằng nút "Tải file mẫu"
5. Mở file mẫu và điền thông tin người dùng:
   - **email**: Email người dùng (bắt buộc, phải hợp lệ)
   - **username**: Mã sinh viên/giảng viên (bắt buộc, không trùng)
   - **full_name**: Họ và tên (bắt buộc)
   - **role**: STUDENT, LECTURER hoặc ADMIN (bắt buộc)
   - **is_active**: true hoặc false (mặc định: true)
6. Lưu file Excel
7. Nhấn "Chọn file Excel" và chọn file vừa chỉnh sửa
8. Hệ thống sẽ xử lý và hiển thị kết quả

### Ví dụ dữ liệu trong Excel

| email | username | full_name | role | is_active |
|-------|----------|-----------|------|-----------|
| student1@gmail.com | 2224802010001 | Nguyễn Văn A | STUDENT | true |
| student2@gmail.com | 2224802010002 | Trần Thị B | STUDENT | true |
| lecturer1@gmail.com | GV001 | Lê Văn C | LECTURER | true |

### 2. Nhập môn học (Subjects)

1. Đăng nhập với tài khoản Admin
2. Vào trang "Môn học" (Subjects)
3. Nhấn nút "Nhập Excel"
4. Tải file mẫu xuống
5. Điền thông tin môn học:
   - **subject_id**: Mã môn học (bắt buộc, tối đa 20 ký tự, không trùng)
   - **subject_name**: Tên môn học (bắt buộc)
   - **credits**: Số tín chỉ (bắt buộc, từ 1-20)
   - **description**: Mô tả môn học (tùy chọn)
6. Upload file Excel

### Ví dụ dữ liệu môn học

| subject_id | subject_name | credits | description |
|------------|--------------|---------|-------------|
| TIN01 | Nhập môn Lập trình | 3 | Môn học cơ bản về lập trình |
| TOAN01 | Giải tích 1 | 4 | Toán cao cấp A1 |

### 3. Nhập lớp học phần (Course Sections)

1. Đăng nhập với tài khoản Admin
2. Vào trang "Lớp học phần" (Course Sections)
3. Nhấn nút "Nhập Excel"
4. Tải file mẫu xuống
5. Điền thông tin lớp học phần:
   - **subject_id**: Mã môn học (bắt buộc, phải tồn tại trong hệ thống)
   - **lecturer_id**: Mã giảng viên (bắt buộc, phải tồn tại trong hệ thống)
   - **semester**: Học kỳ - HK1, HK2 hoặc HK3 (bắt buộc)
   - **academic_year**: Năm học VD: 2024-2025 (bắt buộc)
   - **section_code**: Mã lớp (bắt buộc, không trùng)
   - **max_capacity**: Sĩ số tối đa (bắt buộc)
   - **room_default**: Phòng học (tùy chọn)
   - **is_locked**: true hoặc false (mặc định: false)
6. Upload file Excel

### Ví dụ dữ liệu lớp học phần

| subject_id | lecturer_id | semester | academic_year | section_code | max_capacity | room_default | is_locked |
|------------|-------------|----------|---------------|--------------|--------------|--------------|-----------|
| TIN01 | GV001 | HK1 | 2024-2025 | TIN01-01 | 40 | A101 | false |
| TOAN01 | GV002 | HK1 | 2024-2025 | TOAN01-01 | 50 | B202 | false |

### 4. Nhập lịch dạy (Schedules)

1. Đăng nhập với tài khoản Admin
2. Vào trang "Lịch học" (Schedules)
3. Nhấn nút "Nhập Excel"
4. Tải file mẫu xuống
5. Điền thông tin lịch học:
   - **section_code**: Mã lớp học phần (bắt buộc, phải tồn tại)
   - **day_of_week**: Thứ từ 2-8 (8 là Chủ nhật) (bắt buộc)
   - **start_period**: Tiết bắt đầu từ 1-15 (bắt buộc)
   - **end_period**: Tiết kết thúc từ 1-15 (bắt buộc, phải lớn hơn tiết bắt đầu)
   - **room**: Phòng học (tùy chọn)
6. Upload file Excel

### Ví dụ dữ liệu lịch học

| section_code | day_of_week | start_period | end_period | room |
|--------------|-------------|--------------|------------|------|
| TIN01-01 | 2 | 1 | 3 | A101 |
| TIN01-01 | 4 | 7 | 9 | A101 |
| TOAN01-01 | 3 | 4 | 6 | B202 |

**Lưu ý:** Hệ thống sẽ tự động kiểm tra trùng lịch (cùng lớp, cùng thứ, cùng tiết).

### 5. Nhập khoa (Faculties)

1. Đăng nhập với tài khoản Admin
2. Vào trang "Khoa" (Faculties)
3. Nhấn nút "Nhập Excel"
4. Tải file mẫu xuống
5. Điền thông tin khoa:
   - **faculty_id**: Mã khoa (bắt buộc, không trùng)
   - **faculty_name**: Tên khoa (bắt buộc)
   - **description**: Mô tả (tùy chọn)
6. Upload file Excel

### Ví dụ dữ liệu khoa

| faculty_id | faculty_name | description |
|------------|--------------|-------------|
| CNTT | Công nghệ Thông tin | Khoa Công nghệ Thông tin |
| KTDN | Kinh tế Doanh nghiệp | Khoa Kinh tế Doanh nghiệp |

## Xử lý lỗi

Hệ thống sẽ kiểm tra và báo lỗi cho từng dòng nếu:
- Thiếu thông tin bắt buộc
- Dữ liệu không hợp lệ (email, số tín chỉ, học kỳ, thứ, tiết, v.v.)
- Dữ liệu đã tồn tại (mã trùng)
- Tham chiếu không tồn tại (môn học, giảng viên, lớp học phần)
- Trùng lịch học (cùng lớp, cùng thứ, cùng tiết)

Các dòng hợp lệ sẽ được nhập thành công, các dòng lỗi sẽ được hiển thị chi tiết.

## Lưu ý quan trọng

### Thứ tự nhập dữ liệu
Để tránh lỗi tham chiếu, hãy nhập theo thứ tự:
1. **Khoa** (Faculties) - Tạo khoa trước (nếu cần)
2. **Người dùng** (Users) - Tạo tài khoản giảng viên
3. **Môn học** (Subjects) - Tạo môn học
4. **Lớp học phần** (Course Sections) - Cần có môn học và giảng viên
5. **Lịch dạy** (Schedules) - Cần có lớp học phần

### Kiểm tra dữ liệu trước khi nhập
- Đảm bảo mã môn học, mã giảng viên, mã lớp đã tồn tại khi tạo dữ liệu phụ thuộc
- Kiểm tra không có dữ liệu trùng lặp
- Đảm bảo định dạng dữ liệu đúng (email, số, học kỳ, thứ, tiết)
- Kiểm tra logic (tiết kết thúc > tiết bắt đầu)

### Giá trị hợp lệ
- **Học kỳ**: HK1, HK2, HK3
- **Thứ**: 2, 3, 4, 5, 6, 7, 8 (8 là Chủ nhật)
- **Tiết**: 1-15
- **Vai trò**: STUDENT, LECTURER, ADMIN
- **Boolean**: true, false

## Tính năng đã hoàn thành

1. ✅ Người dùng (Users) - Đã hoàn thành
2. ✅ Môn học (Subjects) - Đã hoàn thành
3. ✅ Lớp học phần (Course Sections) - Đã hoàn thành
4. ✅ Lịch dạy (Schedules) - Đã hoàn thành
5. ✅ Khoa (Faculties) - Đã hoàn thành

## Lưu ý

- File Excel phải có định dạng .xlsx hoặc .xls
- Dòng đầu tiên phải là tiêu đề cột (header)
- Không được để trống các cột bắt buộc
- Các mã (ID) phải là duy nhất trong hệ thống
- Hệ thống xử lý từng dòng độc lập, dòng lỗi không ảnh hưởng dòng khác
