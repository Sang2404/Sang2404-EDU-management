import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/admin/DashboardPage';
import FacultiesPage from './pages/admin/FacultiesPage';
import UsersPage from './pages/admin/UsersPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import CourseSectionsPage from './pages/admin/CourseSectionsPage';
import SchedulesPage from './pages/admin/SchedulesPage';
import StudentEnrollmentPage from './pages/admin/StudentEnrollmentPage';
import GradeApprovalPage from './pages/admin/GradeApprovalPage';
import AcademicRequestsPage from './pages/admin/AcademicRequestsPage';
import StatisticsPage from './pages/admin/StatisticsPage';
import MySectionsPage from './pages/lecturer/MySectionsPage';
import SchedulePage from './pages/student/SchedulePage';
import { Result } from 'antd';

const NotFound = () => <Result status="404" title="404" subTitle="Xin lỗi, trang bạn truy cập không tồn tại." />;

function App() {
  return (
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
                ? '/lecturer/my-sections'
                : '/student/schedule'
              : '/login'
          } replace />
        } />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="admin/dashboard" element={<DashboardPage />} />
          <Route path="admin/faculties" element={<FacultiesPage />} />
          <Route path="admin/subjects" element={<SubjectsPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/course-sections" element={<CourseSectionsPage />} />
          <Route path="admin/schedules" element={<SchedulesPage />} />
          <Route path="admin/student-enrollment" element={<StudentEnrollmentPage />} />
          <Route path="admin/grade-approval" element={<GradeApprovalPage />} />
          <Route path="admin/academic-requests" element={<AcademicRequestsPage />} />
          <Route path="admin/statistics" element={<StatisticsPage />} />
        </Route>

        {/* Lecturer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['LECTURER']} />}>
          <Route path="lecturer/my-sections" element={<MySectionsPage />} />
        </Route>

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="student/schedule" element={<SchedulePage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
