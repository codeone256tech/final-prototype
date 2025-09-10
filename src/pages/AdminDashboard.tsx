import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Plus, Activity, Settings, LogOut, FileText, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AddDoctorForm from '@/components/admin/AddDoctorForm';
import ViewDoctors from '@/components/admin/ViewDoctors';
import AuditLogs from '@/components/admin/AuditLogs';

const AdminDashboard = () => {
  const { signOut, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalRecords: 0,
    recordsThisMonth: 0
  });
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchAllRecords();
  }, []);

  const fetchStats = async () => {
    try {
      // Get total doctors (exclude admin)
      const { data: doctors, error: doctorError } = await supabase
        .from('profiles')
        .select('*')
        .neq('username', 'admin');

      if (doctorError) throw doctorError;

      // Get total medical records
      const { data: records, count: totalRecords, error: recordError } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact' });

      if (recordError) throw recordError;

      // Get records from this month
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const { count: monthRecords, error: monthError } = await supabase
        .from('medical_records')
        .select('*', { count: 'exact' })
        .gte('created_at', thisMonth.toISOString());

      if (monthError) throw monthError;

      setStats({
        totalDoctors: doctors?.length || 0,
        totalRecords: totalRecords || 0,
        recordsThisMonth: monthRecords || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          profiles:created_by (username, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAllRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this medical record?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical record deleted successfully"
      });

      fetchAllRecords();
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete medical record",
        variant: "destructive"
      });
    }
  };

  const handleExportRecord = (record: any) => {
    const dataStr = JSON.stringify(record, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `medical_record_${record.patient_name}_${record.record_date}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'add-doctor':
        return <AddDoctorForm onSuccess={() => { setActiveTab('view-doctors'); fetchStats(); }} />;
      case 'view-doctors':
        return <ViewDoctors />;
      case 'audit-logs':
        return <AuditLogs />;
      case 'all-records':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                All Medical Records
              </CardTitle>
              <CardDescription>
                View and manage all medical records in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {allRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No medical records found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient Name</TableHead>
                      <TableHead>Patient ID</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.patient_name}</TableCell>
                        <TableCell>{record.patient_id}</TableCell>
                        <TableCell>{record.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(record.record_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportRecord(record)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRecord(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-medical-blue" />
                    Total Doctors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-medical-blue">
                    {loading ? '...' : stats.totalDoctors}
                  </p>
                  <p className="text-sm text-muted-foreground">Active healthcare providers</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-medical-green" />
                    Total Records
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-medical-green">
                    {loading ? '...' : stats.totalRecords}
                  </p>
                  <p className="text-sm text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-medical-orange" />
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-medical-orange">
                    {loading ? '...' : stats.recordsThisMonth}
                  </p>
                  <p className="text-sm text-muted-foreground">New records</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('all-records')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-medical-blue" />
                    View All Records
                  </CardTitle>
                  <CardDescription>
                    Access and manage all medical records across all doctors
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('view-doctors')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-medical-green" />
                    Manage Doctors
                  </CardTitle>
                  <CardDescription>
                    View, add, and manage doctor accounts and permissions
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
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
                    variant={activeTab === 'all-records' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveTab('all-records')}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    All Records
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