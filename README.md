# 🎓 Hệ thống Quản lý Sinh viên Đa nền tảng

Hệ thống quản lý sinh viên hiện đại được xây dựng với kiến trúc đa nền tảng, hỗ trợ web, mobile và admin panel với AI chatbot tích hợp.

## 🏗️ Kiến trúc Hệ thống

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Flutter App   │    │   React Web     │    │   Admin Panel   │
│   (Mobile)      │    │   (Desktop)     │    │   (Web)         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   REST API      │
                    │   (Node.js)     │
                    │   + Socket.IO   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │   Database      │
                    └─────────────────┘
```

## 🚀 Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js** - REST API Server
- **PostgreSQL** - Cơ sở dữ liệu chính
- **Socket.IO** - Real-time communication
- **JWT** - Authentication & Authorization
- **Firebase Admin SDK** - Push notifications
- **Google Generative AI** - AI Chatbot
- **bcrypt** - Password hashing
- **Nodemailer** - Email service

### Frontend Web
- **React 18** - UI Framework
- **Vite** - Build tool & dev server
- **Ant Design** - UI Component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time updates
- **Firebase** - Authentication & notifications

### Mobile App
- **Flutter** - Cross-platform framework
- **Dart** - Programming language
- **Provider** - State management
- **HTTP/Dio** - API communication
- **Firebase** - Push notifications
- **Shared Preferences** - Local storage

## 📱 Tính năng chính

### Cho Sinh viên
- 🔐 Đăng nhập bảo mật (Firebase Auth + JWT)
- 📅 Xem lịch học theo tuần/tháng
- 📊 Xem điểm số và kết quả học tập
- 📚 Quản lý khóa học đã đăng ký
- 📝 Gửi yêu cầu học vụ
- 🔔 Nhận thông báo real-time
- 🤖 AI Chatbot tư vấn học tập
- 📱 Ứng dụng mobile đa nền tảng

### Cho Giảng viên
- 👨‍🏫 Quản lý lớp học và sinh viên
- 📝 Nhập và cập nhật điểm số
- 📅 Quản lý lịch giảng dạy
- 📊 Báo cáo và thống kê
- 💬 Giao tiếp với sinh viên

### Cho Quản trị viên
- 👥 Quản lý người dùng (sinh viên, giảng viên)
- 🏫 Quản lý khóa học và môn học
- 📈 Thống kê và báo cáo tổng quan
- ⚙️ Cấu hình hệ thống
- 📤 Import/Export dữ liệu Excel

## 🛠️ Cài đặt và Chạy

### Yêu cầu hệ thống
- **Node.js** 16+ 
- **PostgreSQL** 12+
- **Flutter SDK** 3.10+
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/your-username/edu-management-system.git
cd edu-management-system
```

### 2. Cài đặt Backend
```bash
cd server
npm install

# Tạo file .env từ template
cp .env.example .env
# Cập nhật thông tin database và API keys trong .env

# Khởi tạo database (nếu có migration scripts)
# npm run db:migrate
# npm run db:seed

# Chạy server
npm start
# hoặc development mode
npm run dev
```

### 3. Cài đặt Web App
```bash
cd web-app
npm install

# Tạo file .env từ template
cp .env.example .env
# Cập nhật API URL và Firebase config

# Chạy development server
npm run dev

# Build cho production
npm run build
```

### 4. Cài đặt Flutter App
```bash
cd flutter_app

# Cài đặt dependencies
flutter pub get

# Chạy trên emulator/device
flutter run

# Build APK
flutter build apk
```

## 🔧 Cấu hình

### Database Setup
1. Tạo PostgreSQL database
2. Cập nhật thông tin kết nối trong `server/.env`
3. Import database từ `database/` folder

### Firebase Setup
1. Tạo Firebase project
2. Enable Authentication và Cloud Messaging
3. Download service account key
4. Cập nhật config trong `.env` files

### Google AI Setup
1. Tạo Google Cloud project
2. Enable Generative AI API
3. Tạo API key và cập nhật `GEMINI_API_KEY`

## 📚 API Documentation

### Authentication
```
POST /api/auth/login          # Đăng nhập web
POST /api/auth/login-mobile   # Đăng nhập mobile
GET  /api/auth/verify         # Verify JWT token
```

### Academic Management
```
GET    /api/academic/courses     # Lấy danh sách khóa học
GET    /api/academic/subjects    # Lấy danh sách môn học
POST   /api/academic/enroll      # Đăng ký khóa học
DELETE /api/academic/unenroll    # Hủy đăng ký
```

### Grades & Schedules
```
GET /api/grades              # Xem điểm số
GET /api/schedules           # Xem lịch học
GET /api/schedules/week      # Lịch theo tuần
```

### AI Chatbot
```
POST /api/ai-chat/message      # Gửi tin nhắn
GET  /api/ai-chat/suggestions  # Câu hỏi gợi ý
```

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test                    # Unit tests (nếu có)
```

### Frontend Testing
```bash
cd web-app
npm test                   # Unit tests
npm run test:e2e          # E2E tests với Playwright
npm run test:coverage     # Coverage report
```

### Flutter Testing
```bash
cd flutter_app
flutter test              # Unit & Widget tests
```

## 🚀 Deployment

### Backend (Node.js)
- **Railway**: `railway up`
- **Render**: Connect GitHub repo
- **Heroku**: `git push heroku main`

### Frontend Web
- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **Firebase Hosting**: `firebase deploy`

### Mobile App
- **Android**: `flutter build apk --release`
- **iOS**: `flutter build ios --release`

## 📁 Cấu trúc Dự án

```
├── server/                 # Backend API
│   ├── config/            # Database & Firebase config
│   ├── controllers/       # API controllers
│   ├── middleware/        # Auth & validation middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── scripts/          # Utility scripts
├── web-app/              # React Web Application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── config/       # App configuration
│   │   └── styles/       # CSS styles
│   └── public/           # Static assets
├── flutter_app/          # Flutter Mobile App
│   ├── lib/
│   │   ├── models/       # Data models
│   │   ├── providers/    # State management
│   │   ├── screens/      # UI screens
│   │   ├── services/     # API services
│   │   └── widgets/      # Reusable widgets
│   └── assets/           # Images & fonts
└── database/             # Database scripts & templates
    ├── migrations/       # Database migrations
    ├── seeds/           # Sample data
    └── templates/       # Excel templates
```

## ✨ Tính năng nổi bật

### 1. 🤖 AI Chatbot tích hợp
- Sử dụng Google Generative AI (Gemini)
- Tư vấn học tập cho sinh viên
- Context-aware responses
- Câu hỏi gợi ý thông minh

### 2. 📱 Đa nền tảng
- Web app responsive
- Mobile app Flutter (Android/iOS)
- Đồng bộ dữ liệu real-time

### 3. 🔐 Bảo mật cao
- JWT authentication
- Firebase Auth integration
- Role-based access control
- Input validation & sanitization

### 4. 📊 Quản lý điểm số thông minh
- Quy trình duyệt điểm 3 bước
- Tính toán điểm tự động
- Chuyển đổi thang điểm
- Thống kê và báo cáo

## 🧮 Công thức tính điểm

```
Điểm tổng kết = Chuyên cần × 10% + Giữa kỳ × 30% + Cuối kỳ × 60%

Chuyển đổi thang điểm:
- Thang 10 → Thang 4: điểm_4 = (điểm_10 × 4) / 10
- Thang 4 → Chữ:
  - A: 3.5 - 4.0    - B+: 3.0 - 3.4    - B: 2.5 - 2.9
  - C+: 2.0 - 2.4   - C: 1.5 - 1.9     - D+: 1.0 - 1.4
  - D: 0.5 - 0.9    - F: < 0.5
```

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

Dự án này được phân phối dưới MIT License.

## 👥 Team

- **Backend Developer**: Node.js, PostgreSQL, API Design
- **Frontend Developer**: React, Flutter, UI/UX
- **AI Integration**: Google Generative AI, Chatbot

## 📞 Liên hệ

- **GitHub**: [Repository Link](https://github.com/your-username/edu-management-system)
- **Documentation**: [Wiki](https://github.com/your-username/edu-management-system/wiki)

---

⭐ **Star this repo if you find it helpful!**

