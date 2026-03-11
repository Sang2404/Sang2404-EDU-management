import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingFallback from './components/LoadingFallback';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
import { Result } from 'antd';

// Lazy load admin pages
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const FacultiesPage = React.lazy(() => import('./pages/admin/FacultiesPage'));
const UsersPage = React.lazy(() => import('./pages/admin/UsersPage'));
const SubjectsPage = React.lazy(() => import('./pages/admin/SubjectsPage'));
const CourseSectionsPage = React.lazy(() => import('./pages/admin/CourseSectionsPage'));
const SchedulesPage = React.lazy(() => import('./pages/admin/RoomSchedulePage'));
const GradeApprovalPage = React.lazy(() => import('./pages/admin/GradeApprovalPage'));
const AcademicRequestsPage = React.lazy(() => import('./pages/admin/AcademicRequestsPage'));
const StatisticsPage = React.lazy(() => import('./pages/admin/StatisticsPage'));

// Lazy load lecturer pages
const GradeEntryPage = React.lazy(() => import('./pages/lecturer/GradeEntryPage'));
const TeachingSchedulePage = React.lazy(() => import('./pages/lecturer/TeachingSchedulePage'));

// Lazy load student pages
const SchedulePage = React.lazy(() => import('./pages/student/SchedulePage'));
const GradesPage = React.lazy(() => import('./pages/student/GradesPage'));
const MyCoursesPage = React.lazy(() => import('./pages/student/MyCoursesPage'));
const StudentAcademicRequestsPage = React.lazy(() => import('./pages/student/AcademicRequestsPage'));

const NotFound = () => <Result status="404" title="404" subTitle="Xin lỗi, trang bạn truy cập không tồn tại." />;

function App() {
  return (
    <ChunkErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Các Route được bảo vệ */}
        <Route path="/" element={<MainLayout />}>
          {/* Chuyển hướng root về dashboard dựa trên role */}
          <Route index element={
            <Navigate to={
              localStorage.getItem('user') 
                ? JSON.parse(localStorage.getItem('user')).role === 'ADMIN' 
                  ? '/admin/dashboard' 
                  : JSON.parse(localStorage.getItem('user')).role === 'LECTURER'
                  ? '/lecturer/schedule'
                  : '/student/schedule'
                : '/login'
            } replace />
          } />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="admin/dashboard" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Dashboard..." />}>
                <DashboardPage />
              </Suspense>
            } />
            <Route path="admin/faculties" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Khoa..." />}>
                <FacultiesPage />
              </Suspense>
            } />
            <Route path="admin/subjects" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Môn học..." />}>
                <SubjectsPage />
              </Suspense>
            } />
            <Route path="admin/users" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Người dùng..." />}>
                <UsersPage />
              </Suspense>
            } />
            <Route path="admin/course-sections" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Lớp học phần..." />}>
                <CourseSectionsPage />
              </Suspense>
            } />
            <Route path="admin/schedules" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Lịch học..." />}>
                <SchedulesPage />
              </Suspense>
            } />
            <Route path="admin/grade-approval" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Duyệt điểm..." />}>
                <GradeApprovalPage />
              </Suspense>
            } />
            <Route path="admin/academic-requests" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Yêu cầu học vụ..." />}>
                <AcademicRequestsPage />
              </Suspense>
            } />
            <Route path="admin/statistics" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Thống kê..." />}>
                <StatisticsPage />
              </Suspense>
            } />
          </Route>

          {/* Lecturer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['LECTURER']} />}>
            <Route path="lecturer/schedule" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Lịch dạy..." />}>
                <TeachingSchedulePage />
              </Suspense>
            } />
            <Route path="lecturer/grade-entry" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Nhập điểm..." />}>
                <GradeEntryPage />
              </Suspense>
            } />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
            <Route path="student/schedule" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Lịch học..." />}>
                <SchedulePage />
              </Suspense>
            } />
            <Route path="student/grades" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Bảng điểm..." />}>
                <GradesPage />
              </Suspense>
            } />
            <Route path="student/courses" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Khóa học..." />}>
                <MyCoursesPage />
              </Suspense>
            } />
            <Route path="student/requests" element={
              <Suspense fallback={<LoadingFallback message="Đang tải Yêu cầu..." />}>
                <StudentAcademicRequestsPage />
              </Suspense>
            } />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ChunkErrorBoundary>
  );
}

export default App;
