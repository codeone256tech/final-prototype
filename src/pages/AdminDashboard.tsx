import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Plus, Activity, Settings, LogOut } from 'lucide-react';
import AddDoctorForm from '@/components/admin/AddDoctorForm';
import ViewDoctors from '@/components/admin/ViewDoctors';
import AuditLogs from '@/components/admin/AuditLogs';

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'add-doctor':
        return <AddDoctorForm onSuccess={() => setActiveTab('view-doctors')} />;
      case 'view-doctors':
        return <ViewDoctors />;
      case 'audit-logs':
        return <AuditLogs />;
      default:
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-medical-blue" />
                  Total Doctors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-medical-blue">24</p>
                <p className="text-sm text-muted-foreground">Active healthcare providers</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-medical-green" />
                  Records Processed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-medical-green">1,247</p>
                <p className="text-sm text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-medical-orange" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-medical-green">99.9%</p>
                <p className="text-sm text-muted-foreground">Uptime</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('overview')}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === 'add-doctor' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('add-doctor')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                  </Button>
                  <Button
                    variant={activeTab === 'view-doctors' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('view-doctors')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Doctors
                  </Button>
                  <Button
                    variant={activeTab === 'audit-logs' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('audit-logs')}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Audit Logs
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;