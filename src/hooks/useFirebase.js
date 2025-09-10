// hooks/useFirebase.js - VERSIÓN LIMPIA Y FUNCIONAL
import { useState, useEffect, useCallback } from "react";
import { onAuthStateChange, logoutUser } from "../services/authService";

// 🔔 HOOK DE AUTENTICACIÓN PRINCIPAL
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("📄 Hook useAuth: Iniciando...");
    setLoading(true);
    setError(null);

    const unsubscribe = onAuthStateChange((userData) => {
      console.log("📡 Usuario actualizado en hook:", !!userData);

      try {
        if (userData) {
          console.log(
            "✅ Usuario establecido:",
            userData.name || userData.email
          );

          // Verificar si está aprobado
          if (userData.approved === false) {
            console.log("⏳ Usuario pendiente de aprobación");
          }
          setUser(userData);

          setError(null);
        } else {
          console.log("❌ No hay usuario autenticado");
          setUser(null);
        }
      } catch (err) {
        console.error("❌ Error procesando usuario:", err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    });

    // Cleanup function
    return () => {
      console.log("🧹 Limpiando auth listener");
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // 🔥 FUNCIÓN LOGOUT
  const logout = useCallback(async () => {
    try {
      console.log("📄 Logout iniciado...");
      setLoading(true);
      await logoutUser();
      setUser(null);
      setError(null);
      console.log("✅ Logout exitoso");
    } catch (err) {
      console.error("❌ Error en logout:", err);
      setError(err.message);
      // Logout local aunque falle
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Valores derivados
  const isAuthenticated = !!user;
  const userRole = user?.role;
  const teamId = user?.teamId;
  const approved = user?.approved;

  // Debug info (solo en desarrollo)
  useEffect(() => {
    if (__DEV__) {
      console.log("🎯 Hook useAuth estado actual:", {
        hasUser: !!user,
        userName: user?.name,
        userEmail: user?.email,
        loading,
        isAuthenticated,
        userRole,
        teamId,
        initialized,
        error,
        approved,
      });
    }
  }, [
    user,
    loading,
    isAuthenticated,
    userRole,
    teamId,
    initialized,
    error,
    approved,
  ]);

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    userRole,
    teamId,
    error,
    approved,
    logout,
  };
};
