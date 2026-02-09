# Hướng dẫn Push lên GitHub

## Vấn đề hiện tại
Lỗi "Repository not found" có thể do:
1. Chưa đăng nhập GitHub trong Git
2. Repository là private và cần authentication
3. Cần Personal Access Token

## Giải pháp

### Cách 1: Dùng GitHub Desktop (Dễ nhất)

1. Tải và cài đặt GitHub Desktop: https://desktop.github.com/
2. Đăng nhập tài khoản GitHub
3. File → Add Local Repository
4. Chọn thư mục: `E:\School\Năm 4_HK2\DACN\Project\1`
5. Click "Publish repository"
6. Chọn tên: `EDU-management`
7. Bỏ chọn "Keep this code private" nếu muốn public
8. Click "Publish repository"

### Cách 2: Dùng Personal Access Token

1. Tạo token:
   - Vào: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Chọn scopes: `repo` (full control)
   - Click "Generate token"
   - **Copy token** (chỉ hiện 1 lần!)

2. Push với token:
```bash
git remote set-url origin https://YOUR_TOKEN@github.com/Sang2404/EDU-management.git
git push -u origin main
```

Thay `YOUR_TOKEN` bằng token vừa copy.

### Cách 3: Dùng SSH (Nếu đã setup SSH key)

```bash
git remote set-url origin git@github.com:Sang2404/EDU-management.git
git push -u origin main
```

### Cách 4: Xác thực qua Git Credential Manager

```bash
# Windows
git credential-manager-core configure
git push -u origin main
```

Sẽ mở browser để đăng nhập GitHub.

## Sau khi push thành công

Truy cập: https://github.com/Sang2404/EDU-management

Bạn sẽ thấy:
- ✅ README.md với hướng dẫn đầy đủ
- ✅ 99 files đã được commit
- ✅ Cấu trúc dự án rõ ràng
- ✅ .gitignore đã loại trừ file nhạy cảm

## Lưu ý quan trọng

⚠️ **KHÔNG** commit các file sau (đã có trong .gitignore):
- `server/config/serviceAccountKey.json` - Firebase credentials
- `server/.env` - Database password
- `node_modules/` - Dependencies

Những file này phải được cấu hình riêng trên mỗi máy.
