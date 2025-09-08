import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  FileText, 
  Settings,
  LogOut,
  Trash2,
  Edit,
  UserX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  user_id: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'settings'>('dashboard');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching profiles",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (profileId: string, userId: string) => {
    const confirmed = confirm('Are you sure you want to delete this profile? This action cannot be undone.');
    if (!confirmed) return;

    try {
      // Delete the auth user (this will cascade to profile and user_roles)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;

      toast({
        title: "Profile deleted",
        description: "The profile has been successfully deleted."
      });
      
      fetchProfiles();
    } catch (error: any) {
      toast({
        title: "Error deleting profile",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <Button onClick={fetchProfiles} variant="outline">
                Refresh
              </Button>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading profiles...</p>
                </div>
              ) : profiles.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No user profiles found</p>
                  </CardContent>
                </Card>
              ) : (
                profiles.map((profile) => (
                  <Card key={profile.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-medical-blue/10 p-3 rounded-full">
                            <Users className="h-6 w-6 text-medical-blue" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{profile.full_name}</h3>
                            <p className="text-sm text-muted-foreground">@{profile.username}</p>
                            <Badge variant="outline" className="mt-1">
                              Joined {new Date(profile.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // In a real app, this would open an edit modal
                              toast({
                                title: "Edit feature",
                                description: "Edit functionality coming soon!"
                              });
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteProfile(profile.id, profile.user_id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Admin Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>System Administration</CardTitle>
                <CardDescription>Manage system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sign Out</h3>
                    <p className="text-sm text-muted-foreground">Sign out of admin account</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-medical-blue/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-medical-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{profiles.length}</h3>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-medical-green/10 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-medical-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold">System</h3>
                    <p className="text-sm text-muted-foreground">Running</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="bg-medical-orange/10 p-3 rounded-full">
                    <Shield className="h-6 w-6 text-medical-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Security</h3>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Most recently registered users</CardDescription>
              </CardHeader>
              <CardContent>
                {profiles.slice(0, 5).map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-medical-blue/10 p-2 rounded-full">
                        <Users className="h-4 w-4 text-medical-blue" />
                      </div>
                      <div>
                        <p className="font-medium">{profile.full_name}</p>
                        <p className="text-sm text-muted-foreground">@{profile.username}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                ))}
                {profiles.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No users registered yet.</p>
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
              <div className="bg-medical-red text-white p-2 rounded-lg">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MediScan AI - Admin</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {profile?.full_name || 'Administrator'}
                </p>
              </div>
            </div>
            <nav className="flex items-center space-x-1">
              <Button
                variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                onClick={() => setActiveView('dashboard')}
                size="sm"
              >
                Dashboard
              </Button>
              <Button
                variant={activeView === 'users' ? 'default' : 'ghost'}
                onClick={() => setActiveView('users')}
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Users
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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;