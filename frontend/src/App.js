import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Page Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ApplyPass from './pages/ApplyPass';
import MyPasses from './pages/MyPasses';
import PassDetails from './pages/PassDetails';
import Payment from './pages/Payment';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagePasses from './pages/admin/ManagePasses';
import ManageRoutes from './pages/admin/ManageRoutes';
import Reports from './pages/admin/Reports';
import Profile from './pages/Profile';

// Loading Component
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Login initialMode="register" /> : <Navigate to="/dashboard" />} 
        />

        {/* Protected User Routes */}
        <Route 
          path="/" 
          element={user ? <Layout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="apply-pass" element={<ApplyPass />} />
          <Route path="payment/:passId" element={<Payment />} />
          <Route path="my-passes" element={<MyPasses />} />
          <Route path="passes/:id" element={<PassDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminLayout /> : <Navigate to="/login" />}
        >
          <Route index element={<Navigate to="/admin/dashboard" />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="passes" element={<ManagePasses />} />
          <Route path="routes" element={<ManageRoutes />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

export default App;
