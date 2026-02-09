# Course Sections API - Hướng dẫn sử dụng

## Endpoints

### 1. Create Course Section
```
POST http://localhost:5000/api/academic/course-sections
```

### 2. Get All Course Sections
```
GET http://localhost:5000/api/academic/course-sections
GET http://localhost:5000/api/academic/course-sections?semester=HK1
GET http://localhost:5000/api/academic/course-sections?academic_year=2024-2025
GET http://localhost:5000/api/academic/course-sections?semester=HK1&academic_year=2024-2025
```

### 3. Get Single Course Section
```
GET http://localhost:5000/api/academic/course-sections/:id
```

### 4. Update Course Section
```
PUT http://localhost:5000/api/academic/course-sections/:id
```

### 5. Delete Course Section
```
DELETE http://localhost:5000/api/academic/course-sections/:id
```

---

## 1. CREATE Course Section

### Request Body
```json
{
  "subject_id": "TIN01",
  "teacher_id": "GV001",
  "semester": "HK1",
  "year": "2024-2025",
  "max_students": 60,
  "section_code": "TIN01-HK1-2024"
}
```

## Response Examples

### Success (201 Created)
```json
{
  "message": "Tạo lớp học phần thành công",
  "data": {
    "id": 1,
    "subject_id": "TIN01",
    "teacher_id": "GV001",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 60,
    "section_code": "TIN01-HK1-2024"
  }
}
```

### Error - Missing Required Field (400 Bad Request)
```json
{
  "error": "subject_id is required"
}
```

### Error - Invalid max_students (400 Bad Request)
```json
{
  "error": "max_students must be a positive integer"
}
```

### Error - Empty section_code (400 Bad Request)
```json
{
  "error": "section_code cannot be empty"
}
```

### Error - Subject Not Found (400 Bad Request)
```json
{
  "error": "Subject does not exist"
}
```

### Error - Teacher Not Found (400 Bad Request)
```json
{
  "error": "Teacher does not exist"
}
```

### Error - Duplicate Section Code (409 Conflict)
```json
{
  "error": "Mã lớp học phần đã tồn tại"
}
```

## Test Cases

### 1. Test với dữ liệu hợp lệ
```bash
curl -X POST http://localhost:5000/api/academic/course-sections \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "TIN01",
    "teacher_id": "GV001",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 60,
    "section_code": "TIN01-HK1-2024"
  }'
```

### 2. Test thiếu trường bắt buộc
```bash
curl -X POST http://localhost:5000/api/academic/course-sections \
  -H "Content-Type: application/json" \
  -d '{
    "teacher_id": "GV001",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 60,
    "section_code": "TIN01-HK1-2024"
  }'
```

### 3. Test max_students không hợp lệ
```bash
curl -X POST http://localhost:5000/api/academic/course-sections \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "TIN01",
    "teacher_id": "GV001",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 0,
    "section_code": "TIN01-HK1-2024"
  }'
```

### 4. Test section_code trống
```bash
curl -X POST http://localhost:5000/api/academic/course-sections \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "TIN01",
    "teacher_id": "GV001",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 60,
    "section_code": "   "
  }'
```

### 5. Test môn học không tồn tại
```bash
curl -X POST http://localhost:5000/api/academic/course-sections \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "INVALID",
    "teacher_id": "GV001",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 60,
    "section_code": "TIN01-HK1-2024"
  }'
```

### 6. Test giảng viên không tồn tại
```bash
curl -X POST http://localhost:5000/api/academic/course-sections \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "TIN01",
    "teacher_id": "INVALID",
    "semester": "HK1",
    "year": "2024-2025",
    "max_students": 60,
    "section_code": "TIN01-HK1-2024"
  }'
```

### 7. Test mã lớp trùng lặp
Gọi API tạo lớp học phần 2 lần với cùng section_code

## Chuẩn bị Database

Trước khi test, đảm bảo database đã có:

1. **Môn học mẫu** (subjects table):
```sql
INSERT INTO subjects (subject_id, subject_name, credits, description) 
VALUES ('TIN01', 'Lập trình cơ bản', 3, 'Môn học về lập trình');
```

2. **Giảng viên mẫu** (lecturers table):
Đã có sẵn từ seed data: `GV001`

3. **Chạy migration** để thêm cột section_code:
```bash
psql -U postgres -d student_management -f database/migrations/add_section_code.sql
```

## Chạy Test Script

```bash
cd server
node test_course_sections.js
```

## Validation Rules

1. **Required Fields**: subject_id, teacher_id, semester, year, max_students, section_code
2. **max_students**: Phải là số dương (> 0)
3. **section_code**: Không được rỗng hoặc chỉ chứa khoảng trắng
4. **subject_id**: Phải tồn tại trong bảng subjects
5. **teacher_id**: Phải tồn tại trong bảng lecturers
6. **section_code**: Phải là duy nhất (không trùng lặp)


---

## 2. GET All Course Sections

### Endpoint
```
GET /api/academic/course-sections
```

### Query Parameters (Optional)
- `semester`: Filter by semester (e.g., 'HK1', 'HK2', 'HK3')
- `academic_year`: Filter by academic year (e.g., '2024-2025')

### Success Response (200 OK)
```json
[
  {
    "section_id": 1,
    "subject_id": "TIN01",
    "subject_name": "Lập trình cơ bản",
    "lecturer_id": "GV001",
    "lecturer_name": "Thầy Nguyễn Văn A",
    "semester": "HK1",
    "academic_year": "2024-2025",
    "max_capacity": 60,
    "section_code": "TIN01-HK1-2024",
    "room_default": "A101",
    "is_locked": false,
    "enrolled_count": "45"
  }
]
```

### Examples
```bash
# Get all course sections
curl http://localhost:5000/api/academic/course-sections

# Filter by semester
curl http://localhost:5000/api/academic/course-sections?semester=HK1

# Filter by academic year
curl http://localhost:5000/api/academic/course-sections?academic_year=2024-2025

# Filter by both
curl "http://localhost:5000/api/academic/course-sections?semester=HK1&academic_year=2024-2025"
```

---

## 3. GET Single Course Section

### Endpoint
```
GET /api/academic/course-sections/:id
```

### Success Response (200 OK)
```json
{
  "section_id": 1,
  "subject_id": "TIN01",
  "subject_name": "Lập trình cơ bản",
  "credits": 3,
  "lecturer_id": "GV001",
  "lecturer_name": "Thầy Nguyễn Văn A",
  "semester": "HK1",
  "academic_year": "2024-2025",
  "room_default": "A101",
  "max_capacity": 60,
  "section_code": "TIN01-HK1-2024",
  "is_locked": false,
  "enrolled_count": "45"
}
```

### Error Response (404 Not Found)
```json
{
  "error": "Course section not found"
}
```

### Example
```bash
curl http://localhost:5000/api/academic/course-sections/1
```

---

## 4. UPDATE Course Section

### Endpoint
```
PUT /api/academic/course-sections/:id
```

### Request Body
```json
{
  "subject_id": "TIN01",
  "teacher_id": "GV001",
  "semester": "HK2",
  "year": "2024-2025",
  "max_students": 70,
  "section_code": "TIN01-HK2-2024",
  "room_default": "A102",
  "is_locked": false
}
```

### Success Response (200 OK)
```json
{
  "message": "Cập nhật lớp học phần thành công",
  "data": {
    "section_id": 1,
    "subject_id": "TIN01",
    "teacher_id": "GV001",
    "semester": "HK2",
    "year": "2024-2025",
    "max_students": 70,
    "section_code": "TIN01-HK2-2024",
    "room_default": "A102",
    "is_locked": false
  }
}
```

### Error Responses

**404 Not Found:**
```json
{
  "error": "Course section not found"
}
```

**400 Bad Request:**
```json
{
  "error": "max_students must be a positive integer"
}
```

**409 Conflict:**
```json
{
  "error": "Mã lớp học phần đã tồn tại"
}
```

### Example
```bash
curl -X PUT http://localhost:5000/api/academic/course-sections/1 \
  -H "Content-Type: application/json" \
  -d '{
    "subject_id": "TIN01",
    "teacher_id": "GV001",
    "semester": "HK2",
    "year": "2024-2025",
    "max_students": 70,
    "section_code": "TIN01-HK2-2024",
    "room_default": "A102",
    "is_locked": false
  }'
```

---

## 5. DELETE Course Section

### Endpoint
```
DELETE /api/academic/course-sections/:id
```

### Success Response (200 OK)
```json
{
  "message": "Xóa lớp học phần thành công"
}
```

### Error Responses

**404 Not Found:**
```json
{
  "error": "Course section not found"
}
```

**400 Bad Request:**
```json
{
  "error": "Cannot delete course section with 45 enrolled student(s). Please remove students first."
}
```

### Example
```bash
curl -X DELETE http://localhost:5000/api/academic/course-sections/1
```

---

## Complete CRUD Test

Run the comprehensive test script:
```bash
cd server
node test_course_sections_crud.js
```

This will test:
- ✅ Create course section
- ✅ Get all course sections
- ✅ Get all with filters (semester, academic_year)
- ✅ Get single course section by ID
- ✅ Get non-existent course section (404)
- ✅ Update course section
- ✅ Update with invalid data (400)
- ✅ Update non-existent course section (404)
- ✅ Update to duplicate section_code (409)
- ✅ Delete course section
- ✅ Delete non-existent course section (404)
