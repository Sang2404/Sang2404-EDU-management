# 🎓 Phần mềm Quản Lý Sinh Viên (EDU Management System)

## 📌 1. Giới Thiệu Dự Án (Introduction)
Dự án **EDU Management System** là một giải pháp phần mềm toàn diện nhằm số hóa và tối ưu hóa quy trình quản lý đào tạo tại các cơ sở giáo dục. Hệ thống giải quyết các bài toán phức tạp trong việc quản lý điểm số, thời khóa biểu, yêu cầu học vụ và phân quyền người dùng đa cấp (Admin, Giảng viên, Sinh viên). Với việc cung cấp cả giao diện Web cho cán bộ/giảng viên và ứng dụng Mobile cho sinh viên, dự án hướng tới trải nghiệm người dùng đồng bộ, xuyên suốt và có khả năng vận hành thời gian thực.

## 🛠 2. Công Nghệ Sử Dụng (Technologies Used)
Dự án được xây dựng dựa trên các công nghệ hiện đại, đảm bảo hiệu suất xử lý, tính bảo mật và khả năng mở rộng:

### 2.1. Backend (Server)
| Trọng Tâm | Công Nghệ | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Runtime & Framework** | `Node.js` & `Express.js` | Cơ chế non-blocking I/O của Node.js kết hợp với Express giúp xử lý hàng ngàn request đồng thời với độ trễ thấp, phù hợp cho hệ thống quản lý có lượng truy cập cao. |
| **Cơ sở dữ liệu** | `PostgreSQL` | RDBMS mạnh mẽ, hỗ trợ ACID và xử lý giao dịch (transactions) phức tạp, tối quan trọng trong việc bảo toàn tính toàn vẹn dữ liệu điểm số và thông tin sinh viên. |
| **Bảo mật & Xác thực** | `JWT` & `Bcrypt` | Bảo vệ thông tin bằng công nghệ mã hóa tiên tiến và cơ chế token-based stateless, phù hợp với kiến trúc RESTful phân tán và tích hợp Google Sign-in. |
| **Real-time** | `Socket.IO` | Thiết lập kết nối web-socket hai chiều, cho phép cập nhật thông báo và trạng thái điểm số tức thời ngay khi có thay đổi từ hệ thống. |
| **Tiện ích mở rộng** | `Firebase Admin`, `Nodemailer`, `Gemini AI` | Cung cấp push notifications cho Mobile, gửi email xác thực tự động và tích hợp mô hình AI (@google/generative-ai) để hỗ trợ phân tích dữ liệu, tự động hóa tương tác. |

### 2.2. Frontend (Web Application)
| Trọng Tâm | Công Nghệ | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Core Framework** | `React 18` & `Vite` | React tiêu chuẩn hóa việc tái sử dụng UI qua Virtual DOM cho trải nghiệm mượt mà, trong khi Vite mang lại tốc độ build/HMR cực nhanh nhằm đẩy nhanh tiến độ phát triển. |
| **UI Components** | `Ant Design (antd)` | Cung cấp hệ thống giao diện chuẩn doanh nghiệp (Enterprise), đầy đủ layout, table, forms; giúp đồng nhất trải nghiệm UI/UX toàn hệ thống. |
| **Quản lý State & Route** | `Context API` & `React Router 7` | Phục vụ điều hướng trang tốc độ cao (SPA) và quản lý trạng thái luồng dữ liệu (User Auth, Settings) không bị prop drilling. |
| **Data Fetching** | `Axios` | Client HTTP mạnh mẽ với cơ chế interceptors thông minh, thuận tiện cho việc đính kèm Authentication Token cho mọi API call. |

### 2.3. Mobile (Flutter App)
| Trọng Tâm | Công Nghệ | Lý do lựa chọn |
| :--- | :--- | :--- |
| **Framework** | `Flutter` | Biên dịch native (native code) ra đa nền tảng (iOS, Android) từ một codebase chung duy nhất, mang lại hiệu suất cao với FPS ổn định. |
| **State Management** | `Provider` | Giải pháp quản lý state chuẩn mực do Google khuyến nghị, dễ bảo trì, ràng buộc chặt chẽ UI với business logic ở tầng dưới. |
| **Networking & Router** | `Dio`, `http` & `go_router` | Xử lý giao tiếp HTTP mạnh mẽ (hỗ trợ phân trang, cache) và cho phép điều hướng màn hình an toàn chuyên sâu. |

---

## 🏗 3. Giải Pháp & Kiến Trúc (Architecture & Solutions)

Dự án áp dụng kiến trúc phần mềm phân tầng (Layered Architecture), tách biệt mức độ phụ thuộc giữa Business Logic, Data Access và Presentation, giúp code đạt chuẩn Clean Code và khả năng mở rộng (Scalability) cao.

### 3.1. Cấu Trúc Tổng Thể (Monorepo Ecosystem)
Mô hình tổ chức thư mục ứng dụng theo dạng Monorepo giúp quản lý tập trung và tích hợp dễ dàng:
```text
├── server/                 # Backend API (Node.js/Express)
│   ├── routes/             # Định tuyến, Cổng tiếp nhận Request HTTP (Endpoints)
│   ├── controllers/        # Điều phối logic, Validate Dữ liệu In/Out
│   ├── services/           # Trọng tâm xử lý Business Logic phức tạp
│   ├── config/             # Tích hợp môi trường (Firebase, DB Pool, AI configs)
│   └── (SQL Queries)       # Logic tương tác Database PostgreSQL bằng thư viện pg
├── web-app/                # Web Dashboard Dành cho Cán bộ / Giảng viên (React)
│   ├── src/components/     # UI Component tái sử dụng
│   ├── src/pages/          # Routing Pages phân bổ theo (Admin/Lecturer/Student)
│   └── src/context/        # Global State Context cho Auth, Preferences
└── flutter_app/            # Ứng dụng di động (Frontend Client Sinh viên)
    └── lib/                # Source code chính của ứng dụng
```

### 3.2. Technical Solutions & Design Patterns Cốt Lõi

**A. Kiến trúc Backend: Controller - Service - Route Pattern**
- **Vấn đề giải quyết:** Các dự án thuần Express thường gặp phải lỗi "Fat Controller" (Trộn lẫn API handling, logic tính toán số liệu và query SQL vào chung 1 file), gây ác mộng khi Unit Test, refactor và không tuân thủ Single Responsibility Principle.
- **Giải pháp:** Áp dụng triệt để Pattern phân tầng. Tầng `Routes` chỉ lo định tuyến. `Controllers` chỉ tiếp nhận Input, gọi `Services` tương ứng và xuất Response format JSON chuẩn. Tầng `Services` sẽ là "Black Box" chứa toàn bộ công thức tính toán điểm rườm rà hay thuật toán Import - hoàn toàn độc lập với Express HTTP.

**B. Hệ thống Kiểm Soát Truy Cập Dựa Trên Vai Trò (RBAC - Role-Based Access Control)**
- **Vấn đề giải quyết:** Bài toán phân quyền đa cấp. Ví dụ: Cán bộ Đào Tạo có quyền sinh sát toàn bộ, trong khi đó Giảng Viên chỉ được chỉnh sửa cấu hình Lớp Học Phần họ dạy và Sinh viên chỉ có đặc quyền xem, cấm thao tác ghi nhận (Write).
- **Giải pháp:** Sử dụng bộ Middleware tùy biến gắn kèm chu trình sống của mọi request. Payload mã hóa trong JWT tự động cung cấp định danh và Role. Trước khi Request chọc vào Endpoint nhảy vào Controller, nó bắt buộc phải qua được trạm thu phí Middleware kiểm tra: token hợp lệ + Role có mặt trong mảng quyền hạn cho phép của `[Route]` đó.

**C. Xử lý State Machine cho Luồng Chốt Điểm (Grade Approval Workflow Cycle)**
- **Vấn đề giải quyết:** Bảo vệ tính toàn vẹn của một bảng điểm, không cho phép kẽ hở việc sửa đổi điểm trái phép sau khi đã nghiệm thu.
- **Giải pháp:** Xây dựng cơ chế *Trạng thái trạng thái (State Machine)* đối với trạng thái bảng điểm, hoạt động khép kín theo 3 nút mạng:
  - `DRAFT` (Bản Nháp): Quyền thao tác thuộc về Giảng viên biên soạn trực tiếp.
  - `SUBMITTED` (Chờ Duyệt): Khóa toàn bộ Endpoint ghi/sửa dữ liệu từ Giảng viên. Bàn giao quyền xem/kiểm duyệt sang màn hình Admin.
  - `APPROVED` (Chốt sổ): Giai đoạn khóa Vĩnh viễn. Real-time kích hoạt Socket.IO push Notification về thiết bị Mobile của tất cả sinh viên trong Lớp học phần hiện tại.

**D. Kỹ Thuật Xử Lý Khối Lượng Dữ Liệu Lớn (Bulk Import Transactions)**
- **Vấn đề giải quyết:** Hành động Admin upload ngàn mẫu tin bảng điểm, sinh viên bằng File Excel (.xlsx) dễ làm tràn bộ nhớ, làm nghẽn DB. Hoặc chèn 99 dòng thành công, 1 dòng hỏng khiến dữ liệu bảng bị ô nhiễm gãy rác.
- **Giải pháp:** Sử dụng chiến lược *Batch Processing* đi kèm tư tưởng *Database Transactions* (`BEGIN`, `COMMIT`, `ROLLBACK`). Phân mảnh hàng chục ngàn dòng dư liệu array trong node. Tự động kiểm tra Validation trùng lặp (Conflicts). Nếu có 1 field gây ra lỗi logic (vd: Mã Môn Học không tồn tại) - Hệ thống kích hoạt `ROLLBACK` hủy lập tức toàn chu kỳ bảo vệ database 100% nguyên vẹn, trả về HTTP kèm Report chi tiết số dòng lỗi cho UI React khắc phục.

**E. Bảo Mật Luồng Dữ Liệu (Secure Pipeline)**
- Mô phỏng môi trường HTTPS/CORS chặt chẽ. Trách tấn công XSS và CSRF qua việc lưu trữ Auth JWT bằng quy chuẩn Best Practice `Secure Storage/HttpOnly`. 

---

## 🚀 4. Hướng Dẫn Cài Đặt (Setup & Installation)

Để deploy dự án trên môi trường Local Development, bạn yêu cầu thực hiện đầy đủ các bước dưới đây.

### 4.1. Môi trường yêu cầu (Prerequisites)
- **Node.js** Environment (Phiên bản v16.x trở lên).
- Hệ quản trị CSDL **PostgreSQL** (v12 trở lên).
- **Flutter SDK** v3.10.x trở lên (Dành cho việc dev App Mobile).

### 4.2. Trình tự Khởi chạy Hệ thống Local

**BƯỚC 1: Clone và lấy Source Code**
```bash
git clone https://github.com/HuynSang2404/Sang2404-EDU-management.git
cd Sang2404-EDU-management
```

**BƯỚC 2: Cài Đặt Môi Trường Khép Kín (Sử dụng lệnh root)**
Một lệnh cài đặt toàn bộ `node_modules` ở Core Root lẫn Sub-directories một phát nhờ cấu hình script thông minh tại `package.json`:
```bash
npm run install-all
```

**BƯỚC 3: Triển khai Database**
1. Đăng nhập Postgres, tạo Database mang tên tùy theo cấu hình (vd: `edu_management`).
2. Mở thư mục `database/` và thực thi kịch bản file SQL cung cấp vào DB nói trên, giúp khởi chạy toàn bộ Entity Schemas cần thiết.
3. Chỉnh sửa file `.env` tại thư mục `/server` để cấu hình string connection (HOST, PORT, USER, PASS) hợp lệ.

**BƯỚC 4: Boot Hệ Sinh Thái Web/Server**
Quay trở lại thư mục nguồn Root và kích hoạt cơ chế `concurrently`:
```bash
npm run dev
```
Tự động kích hoạt song song 2 dịch vụ:
- 🌐 **Web Frontend (React/Vite Dashboard):** Truy cập tại `http://localhost:3001`
- 🖥️ **Backend Server (Node.js API):** Listener tại `http://localhost:5001`

**BƯỚC 5: Khởi Chạy Môi Trường Mobile (Optional cho Flutter)**
Tại một màn hình Terminal thứ hai, di chuyển trong cây thư mục `flutter_app`:
```bash
cd flutter_app
flutter pub get
flutter run
```
Chọn giả lập Android/iOS Simulator hoặc cài lên thiết bị trực tiếp để trải nghiệm giao diện người dùng Sinh viên.

---
**Tác giả:** Huỳnh Văn Sang  
**Bản quyền:** Đề tài Môn Học - MIT License
