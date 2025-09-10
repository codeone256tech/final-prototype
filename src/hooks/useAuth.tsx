import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  username: string;
  full_name: string;
  user_id: string;
}

interface UserRole {
  role: 'admin' | 'doctor';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ error: any }>;
  signIn: (username: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile and role data
          setTimeout(async () => {
            await fetchUserData(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          await fetchUserData(session.user.id);
        }, 0);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setProfile(profileData);
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (roleError) {
        console.error('Error fetching role:', roleError);
      } else {
        setUserRole(roleData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // For simplicity, we'll use a consistent email format
      const userEmail = `${username}@mediscan.ai`;
      
      const { error } = await supabase.auth.signUp({
        email: userEmail,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
            full_name: fullName
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Account created successfully. You can now log in with your username and password."
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      // Special case for admin login
      if (username === 'admin' && password === 'admin') {
        // Use hardcoded admin credentials
        const { error } = await supabase.auth.signInWithPassword({
          email: 'admin@mediscan.ai',
          password: 'admin123'
        });

        if (error) {
          toast({
            title: "Login failed",
            description: "Invalid admin credentials",
            variant: "destructive"
          });
        }

        return { error };
      }

      // For regular doctors, we'll use email format based on username
      const { error } = await supabase.auth.signInWithPassword({
        email: `${username}@mediscan.ai`,
        password
      });

      if (error) {
        toast({
          title: "Login failed",
          description: "Invalid username or password",
          variant: "destructive"
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async () => {
    try {
      if (!user) return { error: new Error('No user logged in') };

      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        toast({
          title: "Delete account failed",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted."
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Delete account failed",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    userRole,
    loading,
    signUp,
    signIn,
    signOut,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};