import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getCurrentUser,
  login as authLogin,
  logout as authLogout,
  createAccount,
} from "../lib/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
  $id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Failed to get current user:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await authLogin(email, password);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    await AsyncStorage.setItem("isLoggedIn", "true");
  };

  const signup = async (email: string, password: string, name: string) => {
    await createAccount(email, password, name);
    await authLogin(email, password);
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    await AsyncStorage.setItem("isLoggedIn", "true");
  };

  const logout = async () => {
    await authLogout();
    setUser(null);
    await AsyncStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
