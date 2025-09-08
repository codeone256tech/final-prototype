import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DoctorDashboard from '@/components/dashboard/DoctorDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const Dashboard = () => {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  if (userRole.role === 'admin') {
    return <AdminDashboard />;
  }

  return <DoctorDashboard />;
};

export default Dashboard;