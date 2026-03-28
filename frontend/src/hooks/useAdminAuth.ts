'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UseAdminAuthReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AdminUser | null;
  token: string | null;
  logout: () => void;
}

function parseJwtPayload(token: string): { exp?: number; role?: string } | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    const payload = JSON.parse(atob(base64Payload));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwtPayload(token);
  if (!payload?.exp) return true;
  // exp is in seconds, Date.now() is in ms
  return Date.now() >= payload.exp * 1000;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsAuthenticated(false);
    setUser(null);
    router.push('/admin/login');
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      router.push('/admin/login');
      setIsLoading(false);
      return;
    }
    setToken(token);

    // Check token expiry client-side first (avoids unnecessary network call)
    if (isTokenExpired(token)) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setToken(null);
      router.push('/admin/login?reason=expired');
      setIsLoading(false);
      return;
    }

    // Check the role from the JWT payload directly
    const payload = parseJwtPayload(token);
    if (payload?.role !== 'admin') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      setToken(null);
      router.push('/admin/login?reason=unauthorized');
      setIsLoading(false);
      return;
    }

    // Verify token is still valid on the server
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Token invalid');
        }
        const data = await res.json();
        const userData: AdminUser = data.data;

        if (userData.role !== 'admin') {
          throw new Error('Not an admin');
        }

        setUser(userData);
        // Keep localStorage in sync
        localStorage.setItem('adminUser', JSON.stringify(userData));
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        setToken(null);
        router.push('/admin/login?reason=invalid');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  return { isAuthenticated, isLoading, user, token, logout };
}
