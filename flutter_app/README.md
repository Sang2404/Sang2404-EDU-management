# EDU Student Mobile App

Ứng dụng di động dành cho sinh viên của hệ thống quản lý giáo dục EDU Management System.

## Tính năng

### 🎓 Dành cho Sinh viên
- **Xem lịch học**: Lịch học theo tuần với thông tin chi tiết về môn học, giảng viên, phòng học
- **Xem điểm số**: Bảng điểm chi tiết, GPA tổng kết và theo từng học kỳ
- **Quản lý khóa học**: Danh sách các môn học đã đăng ký
- **Yêu cầu học vụ**: Gửi yêu cầu phúc khảo, bảo lưu, học lại
- **Thông báo**: Nhận thông báo push về điểm số, lịch học, phản hồi yêu cầu

### 🔧 Tính năng kỹ thuật
- **Authentication**: Đăng nhập bảo mật với JWT token
- **State Management**: Quản lý trạng thái với Provider pattern
- **API Integration**: Tích hợp với backend API hiện có
- **Push Notifications**: Thông báo real-time với Firebase
- **Material Design 3**: Giao diện hiện đại, hỗ trợ dark/light theme
- **Offline Support**: Cache dữ liệu cơ bản khi offline

## Công nghệ sử dụng

- **Flutter**: Framework phát triển cross-platform
- **Dart**: Ngôn ngữ lập trình
- **Provider**: State management
- **GoRouter**: Navigation
- **Firebase**: Push notifications
- **HTTP**: API calls
- **Secure Storage**: Lưu trữ token bảo mật

## Cài đặt

### Yêu cầu
- Flutter SDK >= 3.10.0
- Dart SDK >= 3.0.0
- Android Studio / VS Code
- Firebase project (cho push notifications)

### Các bước cài đặt

1. **Clone repository**
   ```bash
   git clone https://github.com/Sang2404/Sang2404-EDU-management.git
   cd Sang2404-EDU-management/flutter_app
   ```

2. **Cài đặt dependencies**
   ```bash
   flutter pub get
   ```

3. **Cấu hình Firebase**
   - Tạo Firebase project
   - Thêm Android/iOS app vào project
   - Tải file `google-services.json` (Android) và `GoogleService-Info.plist` (iOS)
   - Đặt file vào thư mục tương ứng

4. **Cấu hình API endpoint**
   - Mở file `lib/utils/constants.dart`
   - Cập nhật `baseUrl` với địa chỉ server của bạn:
   ```dart
   static const String baseUrl = 'http://your-server-ip:5001/api';
   ```

5. **Chạy ứng dụng**
   ```bash
   flutter run
   ```

## Cấu trúc dự án

```
flutter_app/
├── lib/
│   ├── main.dart                 # Entry point
│   ├── models/                   # Data models
│   │   ├── user.dart
│   │   ├── schedule.dart
│   │   ├── grade.dart
│   │   └── academic_request.dart
│   ├── services/                 # API và business logic
│   │   ├── api_service.dart
│   │   ├── auth_service.dart
│   │   └── notification_service.dart
│   ├── providers/                # State management
│   │   ├── auth_provider.dart
│   │   ├── schedule_provider.dart
│   │   ├── grade_provider.dart
│   │   └── request_provider.dart
│   ├── screens/                  # Màn hình chính
│   │   ├── login_screen.dart
│   │   ├── home_screen.dart
│   │   ├── schedule_screen.dart
│   │   ├── grades_screen.dart
│   │   ├── courses_screen.dart
│   │   └── requests_screen.dart
│   ├── widgets/                  # Components tái sử dụng
│   └── utils/                    # Utilities
│       ├── constants.dart
│       ├── app_theme.dart
│       └── app_router.dart
├── pubspec.yaml                  # Dependencies
└── README.md
```

## API Endpoints

Ứng dụng sử dụng các API endpoints sau từ backend:

- `POST /api/auth/login` - Đăng nhập
- `GET /api/academic/student-schedule` - Lấy lịch học
- `GET /api/grades/student` - Lấy điểm số
- `GET /api/academic/student-courses` - Lấy khóa học
- `GET /api/requests` - Lấy yêu cầu học vụ
- `POST /api/requests` - Gửi yêu cầu học vụ
- `GET /api/academic/student-sections` - Lấy lớp học phần

## Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Liên hệ

- Email: skillsanh@gmail.com
- GitHub: [@Sang2404](https://github.com/Sang2404)
- Project Link: [https://github.com/Sang2404/Sang2404-EDU-management](https://github.com/Sang2404/Sang2404-EDU-management)