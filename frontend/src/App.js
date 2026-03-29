import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequests';
import ActivityReporting from './pages/ActivityReporting';
import TeamManagement from './pages/TeamManagement';
import Layout from './components/Layout';
import ManagerDashboard from './pages/ManagerDashboard';
import './styles.css';

// Must be logged in
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

// Must NOT be logged in
const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
};

// Must have specific role(s)
const RoleRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* All roles */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leave-requests" element={<LeaveRequests />} />
            <Route path="activity-reporting" element={<ActivityReporting />} />

            <Route path="manager-dashboard" element={
              <RoleRoute roles={['manager', 'admin']}>
                <ManagerDashboard />
              </RoleRoute>
            } />

            {/* Manager & Admin only */}
            <Route path="team-management" element={
              <RoleRoute roles={['manager', 'admin']}>
                <TeamManagement />
              </RoleRoute>
            } />

            {/* Catch unknown routes */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;