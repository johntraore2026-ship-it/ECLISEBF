import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, SUPABASE_CONFIG_MESSAGE } from '../lib/supabase';
import { Profile, Role, Permission, Church } from '../types';
import { DEMO_CHURCH, DEMO_PROFILES, DEMO_ROLES, DEMO_PERMISSIONS, DEMO_CHURCHES_LIST } from '../data/demoData';
import { churchService, RegisterChurchParams } from '../services/churchService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: Role[];
  permissions: Permission[];
  churchId: string | null;
  currentChurch: Church | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  demoRole: string;
  configMessage: string;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, metadata?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  switchChurch: (newChurchId: string) => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
  setDemoRole: (roleCode: string) => void;
  registerNewChurch: (params: RegisterChurchParams) => Promise<{ success: boolean; church_id: string }>;
  hasRole: (roleCode: string) => boolean;
  hasPermission: (permCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [churchId, setChurchId] = useState<string | null>(null);
  const [currentChurch, setCurrentChurch] = useState<Church | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Demo mode state: default to demo mode if Supabase credentials are not set,
  // or default to live if configured
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return !isSupabaseConfigured;
  });
  const [demoRole, setDemoRoleState] = useState<string>('CHURCH_ADMIN');

  // Load user data and profile from Supabase
  const loadSupabaseUserData = async (activeUser: User) => {
    try {
      // 1. Fetch Profile
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', activeUser.id)
        .single();

      if (profError && profError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profError);
      }

      if (profData) {
        setProfile(profData as Profile);
        const userChurchId = profData.church_id;
        setChurchId(userChurchId);

        if (userChurchId) {
          // Fetch church details
          const { data: churchData } = await supabase
            .from('churches')
            .select('*')
            .eq('id', userChurchId)
            .single();

          if (churchData) {
            setCurrentChurch(churchData as Church);
          }
        }
      }

      // 2. Fetch User Roles & Permissions
      const { data: userRolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          role:roles (
            id,
            code,
            name,
            level,
            is_system,
            role_permissions (
              permission:permissions (*)
            )
          )
        `)
        .eq('user_id', activeUser.id);

      if (!rolesError && userRolesData) {
        const parsedRoles: Role[] = [];
        const parsedPermissions: Permission[] = [];

        userRolesData.forEach((item: any) => {
          if (item.role) {
            parsedRoles.push({
              id: item.role.id,
              code: item.role.code,
              name: item.role.name,
              level: item.role.level,
              is_system: item.role.is_system,
            });

            if (item.role.role_permissions) {
              item.role.role_permissions.forEach((rp: any) => {
                if (rp.permission) {
                  parsedPermissions.push(rp.permission);
                }
              });
            }
          }
        });

        setRoles(parsedRoles);
        setPermissions(parsedPermissions);
      }
    } catch (err) {
      console.error('Initialization error in loadSupabaseUserData:', err);
    }
  };

  // Initialize Demo Mode
  const initDemoData = (roleCode: string = demoRole) => {
    setUser({
      id: DEMO_PROFILES[0].id,
      email: DEMO_PROFILES[0].email || 'pasteur@bethel-ouaga.bf',
      app_metadata: {},
      user_metadata: { first_name: DEMO_PROFILES[0].first_name, last_name: DEMO_PROFILES[0].last_name },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as unknown as User);

    setProfile(DEMO_PROFILES[0]);
    setChurchId(DEMO_CHURCH.id);
    setCurrentChurch(DEMO_CHURCH);

    const activeRole = DEMO_ROLES.find(r => r.code === roleCode) || DEMO_ROLES[1];
    setRoles([activeRole]);
    setPermissions(DEMO_PERMISSIONS);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured || isDemoMode) {
      initDemoData();
      return;
    }

    // Live Supabase session management
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        loadSupabaseUserData(currentSession.user).finally(() => {
          if (isMounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadSupabaseUserData(newSession.user);
      } else {
        setProfile(null);
        setRoles([]);
        setPermissions([]);
        setChurchId(null);
        setCurrentChurch(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [isDemoMode]);

  const signIn = async (email: string, pass: string) => {
    if (isDemoMode || !isSupabaseConfigured) {
      initDemoData();
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (error) throw new Error(error.message);
  };

  const signUp = async (email: string, pass: string, metadata?: Record<string, unknown>) => {
    if (isDemoMode || !isSupabaseConfigured) {
      initDemoData();
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: metadata }
    });
    setLoading(false);
    if (error) throw new Error(error.message);
  };

  const signOut = async () => {
    if (isDemoMode || !isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      setRoles([]);
      setPermissions([]);
      setChurchId(null);
      setCurrentChurch(null);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setLoading(false);
    if (error) throw new Error(error.message);
  };

  const resetPassword = async (email: string) => {
    if (isDemoMode || !isSupabaseConfigured) {
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
  };

  const refreshProfile = async () => {
    if (user && isSupabaseConfigured && !isDemoMode) {
      await loadSupabaseUserData(user);
    }
  };

  const switchChurch = async (newChurchId: string) => {
    setLoading(true);
    try {
      const church = await churchService.getChurch(newChurchId, isDemoMode);
      setChurchId(newChurchId);
      setCurrentChurch(church);
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (roleCode: string) => {
    setDemoRoleState(roleCode);
    if (isDemoMode) {
      initDemoData(roleCode);
    }
  };

  const registerNewChurch = async (params: RegisterChurchParams) => {
    const res = await churchService.registerChurch(params, isDemoMode);
    if (res.church_id) {
      await switchChurch(res.church_id);
    }
    return res;
  };

  const hasRole = (roleCode: string): boolean => {
    if (roles.some(r => r.code === 'SUPER_ADMIN')) return true;
    return roles.some(r => r.code === roleCode);
  };

  const hasPermission = (permCode: string): boolean => {
    if (hasRole('SUPER_ADMIN') || hasRole('CHURCH_ADMIN')) return true;
    return permissions.some(p => p.code === permCode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        roles,
        permissions,
        churchId,
        currentChurch,
        loading,
        isConfigured: isSupabaseConfigured,
        isDemoMode,
        demoRole,
        configMessage: SUPABASE_CONFIG_MESSAGE,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
        switchChurch,
        setDemoMode: setIsDemoMode,
        setDemoRole,
        registerNewChurch,
        hasRole,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
