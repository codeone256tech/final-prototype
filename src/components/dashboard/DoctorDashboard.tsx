import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Search, 
  FileText, 
  User, 
  Calendar,
  Settings,
  LogOut,
  Upload,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MedicalRecordCapture from '@/components/MedicalRecordCapture';
import MedicalRecordsTable from '@/components/MedicalRecordsTable';

interface MedicalRecord {
  id: string;
  patient_id: string;
  patient_name: string;
  age: number | null;
  gender: string | null;
  diagnosis: string | null;
  prescription: string | null;
  record_date: string | null;
  created_at: string;
}

const DoctorDashboard = () => {
  const { profile, signOut, deleteAccount } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'dashboard' | 'capture' | 'records' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicalRecords(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching records",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = medicalRecords.filter(record =>
    record.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.patient_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (record.diagnosis && record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      await deleteAccount();
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'capture':
        return (
          <MedicalRecordCapture 
            onRecordSaved={() => {
              fetchMedicalRecords();
              setActiveView('records');
            }}
            onCancel={() => setActiveView('dashboard')}
          />
        );
      
      case 'records':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="text-2xl font-bold">Medical Records</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by patient name, ID, or diagnosis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={() => setActiveView('capture')}
                  className="bg-medical-blue hover:bg-medical-blue/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Record
                </Button>
              </div>
            </div>
            
            <MedicalRecordsTable 
              records={filteredRecords}
              loading={loading}
              onRefresh={fetchMedicalRecords}
            />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out of your account</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-destructive">Delete Account</h3>
                      <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount}>
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveView('capture')}>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-medical-blue/10 p-3 rounded-full">
                    <Camera className="h-6 w-6 text-medical-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Scan Record</h3>
                    <p className="text-sm text-muted-foreground">Capture new medical record</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-medical-green/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-medical-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{medicalRecords.length}</h3>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-medical-orange/10 p-3 rounded-full">
                    <User className="h-6 w-6 text-medical-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{new Set(medicalRecords.map(r => r.patient_name)).size}</h3>
                    <p className="text-sm text-muted-foreground">Unique Patients</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-medical-red/10 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-medical-red" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {medicalRecords.filter(r => {
                        const today = new Date();
                        const recordDate = new Date(r.created_at);
                        return recordDate.toDateString() === today.toDateString();
                      }).length}
                    </h3>
                    <p className="text-sm text-muted-foreground">Today's Records</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Records</CardTitle>
                <CardDescription>Your most recently captured medical records</CardDescription>
              </CardHeader>
              <CardContent>
                {medicalRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-medical-blue/10 p-2 rounded-full">
                        <User className="h-4 w-4 text-medical-blue" />
                      </div>
                      <div>
                        <p className="font-medium">{record.patient_name}</p>
                        <p className="text-sm text-muted-foreground">ID: {record.patient_id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {new Date(record.created_at).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                ))}
                {medicalRecords.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No records yet. Start by capturing your first medical record!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-medical-blue text-white p-2 rounded-lg">
                <Camera className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MediScan AI</h1>
                <p className="text-sm text-muted-foreground">
                  Hey, {profile?.full_name || 'Doctor'}
                </p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-1">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setActiveView('dashboard')}
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                variant={activeView === 'capture' ? 'default' : 'ghost'}
                onClick={() => setActiveView('capture')}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Capture
              </Button>
              <Button
                variant={activeView === 'records' ? 'default' : 'ghost'}
                onClick={() => setActiveView('records')}
                size="sm"
              >
                <FileText className="h-4 w-4 mr-2" />
                Records
              </Button>
              <Button
                variant={activeView === 'settings' ? 'default' : 'ghost'}
                onClick={() => setActiveView('settings')}
                size="sm"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </nav>
            
            {/* Mobile menu */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('capture')}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('settings')}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex items-center justify-around py-2">
          <Button
            variant={activeView === 'dashboard' ? 'default' : 'ghost'}
            onClick={() => setActiveView('dashboard')}
            size="sm"
            className="flex-col h-auto py-2"
          >
            <FileText className="h-4 w-4 mb-1" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant={activeView === 'capture' ? 'default' : 'ghost'}
            onClick={() => setActiveView('capture')}
            size="sm"
            className="flex-col h-auto py-2"
          >
            <Camera className="h-4 w-4 mb-1" />
            <span className="text-xs">Scan</span>
          </Button>
          <Button
            variant={activeView === 'records' ? 'default' : 'ghost'}
            onClick={() => setActiveView('records')}
            size="sm"
            className="flex-col h-auto py-2"
          >
            <Search className="h-4 w-4 mb-1" />
            <span className="text-xs">Records</span>
          </Button>
          <Button
            variant={activeView === 'settings' ? 'default' : 'ghost'}
            onClick={() => setActiveView('settings')}
            size="sm"
            className="flex-col h-auto py-2"
          >
            <Settings className="h-4 w-4 mb-1" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default DoctorDashboard;