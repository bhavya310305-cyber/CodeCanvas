import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser({
        id: res.data._id,
        name: res.data.fullName,
        email: res.data.email,
      });
    } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 401) {
            console.log("User not logged in - this is normal.");
          } else {
            console.error("Auth check failed:", err.message);
          }
        } else {
          console.error("An unexpected error occurred:", err);
        }
        setUser(null);
    } finally {
      setLoading(false);
    }
  };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};