import { useState, useEffect } from "react";

const SESSION_KEY = "admin_auth_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Credentials are validated server-side, not stored in client
export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<Error | null>(null);

  // Check if we have a valid session
  useEffect(() => {
    const checkSession = () => {
      const sessionData = localStorage.getItem(SESSION_KEY);
      if (sessionData) {
        try {
          const { timestamp, token } = JSON.parse(sessionData);
          const isValid = Date.now() - timestamp < SESSION_DURATION && token;
          setIsAuthenticated(isValid);
          if (!isValid) {
            localStorage.removeItem(SESSION_KEY);
          }
        } catch {
          localStorage.removeItem(SESSION_KEY);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const login = async ({ username, password }: { username: string; password: string }) => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      // Use POST request to avoid Vite routing issues
      const response = await fetch('/api/admin-auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Server validated credentials against environment variables
          const sessionData = { 
            timestamp: Date.now(),
            token: result.sessionToken || `auth_${Date.now()}_${Math.random().toString(36)}`
          };
          localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
          setIsAuthenticated(true);
        } else {
          throw new Error(result.message || "Invalid credentials");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Authentication failed");
      }
    } catch (error) {
      setLoginError(error instanceof Error ? error : new Error("Login failed"));
    }
    
    setLoginLoading(false);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    loginLoading,
    loginError,
  };
}