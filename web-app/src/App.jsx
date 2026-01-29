import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import FacultiesPage from './pages/admin/FacultiesPage';
import UsersPage from './pages/admin/UsersPage';
import SubjectsPage from './pages/admin/SubjectsPage';
import { Result } from 'antd';

// Dashboard Overview -> Tổng quan hệ thống
const Dashboard = () => <div><h1>Tổng quan </h1></div>;
const NotFound = () => <Result status="404" title="404" subTitle="Xin lỗi, trang bạn truy cập không tồn tại." />;

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Các Route được bảo vệ */}
      <Route path="/" element={<MainLayout />}>
        {/* Chuyển hướng root về dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="admin/dashboard" element={<Dashboard />} />
          <Route path="admin/faculties" element={<FacultiesPage />} />
          <Route path="admin/subjects" element={<SubjectsPage />} />
          <Route path="admin/users" element={<UsersPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
