import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, SUPABASE_CONFIG_MESSAGE } from '../lib/supabase';
import { Profile, Role, Permission, Church } from '../types';
import { DEMO_CHURCH, DEMO_PROFILES, DEMO_ROLES, DEMO_PERMISSIONS, DEMO_CHURCHES_LIST } from '../data/demoData';
import { churchService, RegisterChurchParams } from '../services/churchService';

export const ROLE_PERMISSIONS_MAP: Record<string, string[]> = {
  SUPER_ADMIN: [
    'members.read', 'members.create', 'members.edit', 'members.delete',
    'finance.read', 'finance.create', 'finance.approve',
    'pastoral.read', 'pastoral.create', 'pastoral.confidential',
    'attendance.read', 'attendance.create',
    'departments.manage', 'config.manage', 'audit.read'
  ],
  CHURCH_ADMIN: [
    'members.read', 'members.create', 'members.edit', 'members.delete',
    'finance.read', 'finance.create', 'finance.approve',
    'pastoral.read', 'pastoral.create', 'pastoral.confidential',
    'attendance.read', 'attendance.create',
    'departments.manage', 'config.manage', 'audit.read'
  ],
  PASTOR: [
    'members.read', 'members.create', 'members.edit',
    'pastoral.read', 'pastoral.create', 'pastoral.confidential',
    'attendance.read', 'attendance.create',
    'departments.manage'
  ],
  TREASURER: [
    'members.read',
    'finance.read', 'finance.create', 'finance.approve',
    'attendance.read'
  ],
  SECRETARY: [
    'members.read', 'members.create', 'members.edit',
    'attendance.read', 'attendance.create',
    'departments.manage'
  ],
  LEADER: [
    'members.read',
    'attendance.read', 'attendance.create',
    'departments.manage'
  ],
  DEPARTMENT_LEADER: [
    'members.read',
    'attendance.read', 'attendance.create',
    'departments.manage'
  ],
  MEMBER: [
    'attendance.read'
  ]
};

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
  canAccessTab: (tabId: string) => boolean;
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
      } else {
        // Fallback for new users before profile record is created or if RLS restricts query
        const meta = activeUser.user_metadata || {};
        const fallbackProfile: Profile = {
          id: activeUser.id,
          church_id: DEMO_CHURCH.id,
          first_name: (meta.first_name as string) || activeUser.email?.split('@')[0] || 'Responsable',
          last_name: (meta.last_name as string) || '',
          email: activeUser.email,
          phone: meta.phone as string | undefined,
          status: 'ACTIVE',
          created_at: activeUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        setChurchId(DEMO_CHURCH.id);
        setCurrentChurch(DEMO_CHURCH);
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

      if (!rolesError && userRolesData && userRolesData.length > 0) {
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

            if (item.role.role_permissions && item.role.role_permissions.length > 0) {
              item.role.role_permissions.forEach((rp: any) => {
                if (rp.permission) {
                  parsedPermissions.push(rp.permission);
                }
              });
            }
          }
        });

        if (parsedPermissions.length === 0 && parsedRoles.length > 0) {
          const mainCode = parsedRoles[0].code;
          const rolePermCodes = ROLE_PERMISSIONS_MAP[mainCode] || ROLE_PERMISSIONS_MAP['MEMBER'];
          rolePermCodes.forEach((code, idx) => {
            parsedPermissions.push({ id: `p_${idx}`, code, name: code, module: code.split('.')[0] });
          });
        }

        setRoles(parsedRoles);
        setPermissions(parsedPermissions);
      } else {
        // Default role when no explicit user_roles exist in Supabase
        const metaRoleCode = (activeUser.user_metadata?.role_code as string) || 'CHURCH_ADMIN';
        const defaultRole = DEMO_ROLES.find(r => r.code === metaRoleCode) || DEMO_ROLES.find(r => r.code === 'CHURCH_ADMIN') || DEMO_ROLES[1];
        setRoles([defaultRole]);

        const rolePermCodes = ROLE_PERMISSIONS_MAP[metaRoleCode] || ROLE_PERMISSIONS_MAP['CHURCH_ADMIN'];
        const activePerms: Permission[] = rolePermCodes.map((code, idx) => ({
          id: `p_meta_${idx}`,
          code,
          name: code,
          module: code.split('.')[0]
        }));
        setPermissions(activePerms);
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

    const activeRole = DEMO_ROLES.find(r => r.code === roleCode || (roleCode === 'DEPARTMENT_LEADER' && r.code === 'LEADER')) || DEMO_ROLES[1];
    setRoles([activeRole]);

    const rolePermCodes = ROLE_PERMISSIONS_MAP[roleCode] || ROLE_PERMISSIONS_MAP['CHURCH_ADMIN'];
    const activePerms: Permission[] = rolePermCodes.map((code, idx) => ({
      id: `p_demo_${idx}`,
      code,
      name: code,
      module: code.split('.')[0]
    }));
    setPermissions(activePerms);
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
    try {
      // Ensure data is always a valid key-value map object for Supabase GoTrue backend
      const userMetadata: Record<string, unknown> = 
        typeof metadata === 'object' && metadata !== null && !Array.isArray(metadata)
          ? metadata
          : {};

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: userMetadata
        }
      });

      if (error) throw new Error(error.message);

      // If user is returned and session exists, ensure profile record is created
      if (data?.user) {
        try {
          const firstName = (userMetadata.first_name as string) || email.split('@')[0] || 'Responsable';
          const lastName = (userMetadata.last_name as string) || '';
          const phone = (userMetadata.phone as string) || null;
          const roleCode = (userMetadata.role_code as string) || 'CHURCH_ADMIN';

          // Check if there is an existing church to link by default
          const { data: defaultChurch } = await supabase
            .from('churches')
            .select('id')
            .limit(1)
            .maybeSingle();

          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            first_name: firstName,
            last_name: lastName,
            phone: phone,
            church_id: defaultChurch?.id || null,
            status: 'ACTIVE'
          }, { onConflict: 'id' });

          // Also attempt to assign user_roles in Supabase DB if roles table exists
          try {
            const { data: roleRecord } = await supabase
              .from('roles')
              .select('id')
              .eq('code', roleCode)
              .maybeSingle();

            if (roleRecord?.id) {
              await supabase.from('user_roles').upsert({
                user_id: data.user.id,
                role_id: roleRecord.id,
                church_id: defaultChurch?.id || null
              }, { onConflict: 'user_id,role_id,church_id' });
            }
          } catch (rErr) {
            console.warn('Auto user_roles record notice:', rErr);
          }
        } catch (profileErr) {
          console.warn('Auto profile initialization notice:', profileErr);
        }
      }
    } finally {
      setLoading(false);
    }
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
    const activeRole = DEMO_ROLES.find(r => r.code === roleCode || (roleCode === 'DEPARTMENT_LEADER' && r.code === 'LEADER')) || DEMO_ROLES[1];
    setRoles([activeRole]);
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
    if (roles.some(r => r.code === 'SUPER_ADMIN' || r.code === 'CHURCH_ADMIN')) return true;
    return permissions.some(p => p.code === permCode);
  };

  const canAccessTab = (tabId: string): boolean => {
    if (roles.some(r => r.code === 'SUPER_ADMIN' || r.code === 'CHURCH_ADMIN')) return true;
    const currentCode = roles[0]?.code || demoRole || 'MEMBER';

    switch (tabId) {
      case 'dashboard':
        return true;
      case 'members':
        return hasPermission('members.read') || ['PASTOR', 'TREASURER', 'SECRETARY', 'LEADER', 'DEPARTMENT_LEADER'].includes(currentCode);
      case 'departments':
      case 'attendance':
      case 'events':
      case 'media':
      case 'training':
        return true;
      case 'finance':
        return hasPermission('finance.read') || currentCode === 'TREASURER';
      case 'pastoral':
        return hasPermission('pastoral.read') || currentCode === 'PASTOR';
      case 'audit':
        return hasPermission('audit.read') || ['SUPER_ADMIN', 'CHURCH_ADMIN'].includes(currentCode);
      case 'config':
        return hasPermission('config.manage') || ['SUPER_ADMIN', 'CHURCH_ADMIN'].includes(currentCode);
      default:
        return true;
    }
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
        hasPermission,
        canAccessTab
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
