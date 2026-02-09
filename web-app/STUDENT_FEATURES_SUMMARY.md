# Student Features Summary - Web App

## Completed Tasks (43-47)

### Task 43: Xem thời khóa biểu cá nhân ✅
**File**: `web-app/src/pages/student/SchedulePage.jsx`

**Features**:
- Weekly calendar view (7 columns for days of week)
- Monthly calendar view with event details
- Filter by semester and year
- Display: Subject name, Period, Room, Lecturer, Section code
- Color-coded schedule items
- Responsive design

**API Used**: `GET /api/academic/students/:studentId/sections`

---

### Task 44: Xem bảng điểm cá nhân ✅
**File**: `web-app/src/pages/student/GradesPage.jsx`

**Features**:
- Statistics cards: GPA, Total credits, Total courses
- Detailed grade table grouped by semester
- Columns: Subject, Section, Attendance, Midterm, Final, Total (10), Grade, Pass/Fail
- Filter by semester and year
- Calculate semester GPA and cumulative GPA
- Color-coded pass/fail status

**API Used**: `GET /api/academic/students/:studentId/sections` + `GET /api/grades/section/:sectionId`

---

### Task 45: Xem danh sách lớp đã đăng ký ✅
**File**: `web-app/src/pages/student/MyCoursesPage.jsx`

**Features**:
- Statistics: Total courses, Total credits, Number of semesters
- Table grouped by semester
- Columns: Section code, Subject, Credits, Lecturer, Enrollment, Schedule, Room
- Filter by semester and year
- Detail modal showing course info and all schedules
- Responsive design

**API Used**: `GET /api/academic/students/:studentId/sections`

---

### Task 46-47: Gửi & Xem yêu cầu học vụ ✅
**File**: `web-app/src/pages/student/AcademicRequestsPage.jsx`

**Features**:
- View all academic requests history
- Submit new requests with 3 types:
  - **Phúc khảo điểm** (Grade Review) - requires selecting a graded course
  - **Bảo lưu** (Reserve/Defer)
  - **Học lại** (Retake)
- Request form validation:
  - Reason must be at least 20 characters
  - Grade selection required for review requests
- Status tracking: PENDING, APPROVED, REJECTED
- Detail modal showing:
  - Request ID, Type, Subject, Status
  - Reason, Admin response
  - Created date, Updated date
- Color-coded status tags

**APIs Used**:
- `POST /api/requests` - Create new request
- `GET /api/requests/students/:studentId` - Get student's requests
- `GET /api/academic/students/:studentId/sections` - Get enrolled courses
- `GET /api/grades/section/:sectionId` - Get grades for review requests

---

## Routes Added

```javascript
// Student Routes in App.jsx
<Route path="student/schedule" element={<SchedulePage />} />
<Route path="student/grades" element={<GradesPage />} />
<Route path="student/courses" element={<MyCoursesPage />} />
<Route path="student/requests" element={<AcademicRequestsPage />} />
```

## Menu Items Added

```javascript
// Student menu in MainLayout.jsx
{ key: '/student/schedule', icon: <CalendarOutlined />, label: 'Lịch học' }
{ key: '/student/courses', icon: <BookOutlined />, label: 'Lớp học phần' }
{ key: '/student/grades', icon: <FileTextOutlined />, label: 'Bảng điểm' }
{ key: '/student/requests', icon: <FileSearchOutlined />, label: 'Yêu cầu học vụ' }
```

---

## Testing Instructions

1. **Login as Student**: Use account `2224802010365@student.tdmu.edu.vn`

2. **Test Schedule Page**:
   - Navigate to "Lịch học"
   - Switch between weekly and monthly views
   - Filter by semester/year

3. **Test Grades Page**:
   - Navigate to "Bảng điểm"
   - Check GPA calculations
   - Filter by semester

4. **Test My Courses Page**:
   - Navigate to "Lớp học phần"
   - View course statistics
   - Click "Chi tiết" to see schedules

5. **Test Academic Requests**:
   - Navigate to "Yêu cầu học vụ"
   - Click "Gửi yêu cầu mới"
   - Try all 3 request types
   - View request details
   - Check status updates

---

## Notes

- All pages use Vietnamese language
- All pages are responsive and mobile-friendly
- Error handling with user-friendly messages
- Loading states for better UX
- Data validation on forms
- Color-coded status indicators
