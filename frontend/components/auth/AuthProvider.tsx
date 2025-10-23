"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, type User, type RegisterData } from '@/lib/auth';

type AuthContextType = {
  user: User | null;
  signIn: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (userData: RegisterData) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
  loading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize authentication state on mount
  const initializeAuth = useCallback(async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          // Cache user data
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Clear invalid tokens and cached user data
        await authService.logout();
        localStorage.removeItem('user');
        setUser(null);
        
        // Redirect to login if authentication is required and we're not already on auth pages
        const isAuthPage = pathname === '/login' || pathname === '/signup';
        const isPublicPage = pathname === '/' || pathname === '/about' || pathname === '/methodology';
        
        if (!isAuthPage && !isPublicPage) {
          console.log('Authentication expired, redirecting to login...');
          router.push('/login?redirect=' + encodeURIComponent(pathname));
        }
      } finally {
        setLoading(false);
      }
    }, [pathname, router]);

    useEffect(() => {
    // Check if we have tokens before trying to authenticate
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!accessToken || !refreshToken) {
        // No tokens available, user is not authenticated
        setLoading(false);
        return;
      }
      
      // Load cached user data immediately for better UX
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          localStorage.removeItem('user');
        }
      }
    }
    
    // Verify authentication with server
    initializeAuth();
  }, [initializeAuth]);

  const signIn = async (username: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { ok: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, error: msg || 'Login failed' };
  }
  };

  const signUp = async (userData: RegisterData): Promise<{ ok: true } | { ok: false; error: string }> => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { ok: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return { ok: false, error: msg || 'Registration failed' };
  }
  };

  const signOut = async () => {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('user');
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    signIn,
    signUp,
    signOut,
    loading,
    isAuthenticated: !!user && authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

// Protected Route Component
interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Please log in to access this page.</p>
          <a 
            href="/auth/login" 
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}