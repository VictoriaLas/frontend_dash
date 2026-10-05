import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setUnauthorizedHandler } from "../api/client.js";
import { useToast } from "./ToastContext.jsx";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  // undefined = comprobando la sesión; null = sin sesión; objeto = usuario con rol
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    // Al recargar, la cookie sigue en el navegador: /me dice si es válida y con qué rol
    api.me().then(setUser, () => setUser(null));
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser((current) => {
        if (current) toast.error("Tu sesión ha terminado. Inicia sesión de nuevo.");
        return null;
      });
    });
  }, [toast]);

  const login = useCallback(async (email, password) => setUser(await api.login(email, password)), []);
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, isAdmin: user?.role === "Administrador", login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
