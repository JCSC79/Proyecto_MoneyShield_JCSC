// src pages/AdminDashboard.jsx

import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import UserList from './UserList';
import AdminLayout from '../components/AdminLayout';

export default function AdminDashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.profile_id !== 1) return <Navigate to="/" />;
  return (
    <AdminLayout title="Panel de Administración">
      <UserList />
    </AdminLayout>
  );
}
