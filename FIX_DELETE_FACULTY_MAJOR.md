# Sửa lỗi không xóa được Khoa và Ngành

## Nguyên nhân

Không xóa được vì có **Foreign Key Constraints** từ các bảng khác:

### Khoa (faculties):
- Bảng `lecturers` có `faculty_id` tham chiếu đến `faculties`
- Bảng `majors` có `faculty_id` tham chiếu đến `faculties`
- Khi có giảng viên hoặc ngành thuộc khoa đó → PostgreSQL chặn xóa

### Ngành (majors):
- Bảng `classes` có `major_id` tham chiếu đến `majors`
- Khi có lớp thuộc ngành đó → PostgreSQL chặn xóa

## Giải pháp

### Cách 1: Chạy Migration SQL (Khuyến nghị)

Chạy file `database/migrations/fix_faculty_major_delete.sql`:

```bash
# Trên Windows
psql -U postgres -d student_management -f database/migrations/fix_faculty_major_delete.sql

# Hoặc trong pgAdmin
# Mở Query Tool và paste nội dung file, sau đó Execute
```

Migration này sẽ:
- Sửa constraint của `lecturers.faculty_id` → `ON DELETE SET NULL`
- Sửa constraint của `classes.major_id` → `ON DELETE SET NULL`

Sau khi chạy:
- Xóa khoa → `faculty_id` của giảng viên sẽ = NULL
- Xóa ngành → `major_id` của lớp sẽ = NULL

### Cách 2: Xóa dữ liệu liên quan trước

Nếu không muốn chạy migration, phải xóa theo thứ tự:

**Xóa Khoa:**
1. Xóa tất cả giảng viên thuộc khoa đó
2. Xóa tất cả ngành thuộc khoa đó (và lớp của ngành)
3. Mới xóa được khoa

**Xóa Ngành:**
1. Xóa tất cả lớp thuộc ngành đó
2. Mới xóa được ngành

## Kiểm tra sau khi sửa

Chạy query này để xem các constraint:

```sql
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (ccu.table_name = 'faculties' OR ccu.table_name = 'majors')
ORDER BY tc.table_name;
```

Kết quả mong muốn:
- `lecturers.faculty_id` → `delete_rule = SET NULL`
- `classes.major_id` → `delete_rule = SET NULL`

## Test

Sau khi sửa, test bằng cách:

1. Tạo 1 khoa mới
2. Tạo 1 giảng viên thuộc khoa đó
3. Xóa khoa
4. Kiểm tra giảng viên → `faculty_id` phải = NULL

## Lưu ý

- Backup database trước khi chạy migration
- Nếu đã có dữ liệu quan trọng, cân nhắc kỹ trước khi sửa constraint
- `ON DELETE SET NULL` phù hợp vì khoa/ngành là dữ liệu tham chiếu, không nên xóa cascade
