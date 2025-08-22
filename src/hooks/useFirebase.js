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
  const teamId = user?.teamId || "acd-fatima"; // Fallback a tu equipo fijo

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
      });
    }
  }, [user, loading, isAuthenticated, userRole, teamId, initialized, error]);

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    userRole,
    teamId,
    error,
    logout,
  };
};

// 👥 HOOK DE JUGADORES EN TIEMPO REAL
export const usePlayersRealTime = (teamId) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) {
      console.log("⚠️ No hay teamId para cargar jugadores");
      setPlayers([]);
      setLoading(false);
      return;
    }

    console.log("📄 Cargando jugadores para equipo:", teamId);
    setLoading(true);
    setError(null);

    // Importación dinámica para evitar errores
    const loadPlayersService = async () => {
      try {
        const { getAllPlayersRealTime } = await import(
          "../services/playersFirebaseService"
        );

        const unsubscribe = getAllPlayersRealTime(teamId, (playersData) => {
          console.log("📡 Jugadores actualizados:", playersData?.length || 0);
          setPlayers(playersData || []);
          setLoading(false);
          setError(null);
        });

        return unsubscribe;
      } catch (err) {
        console.error("❌ Error cargando servicio de jugadores:", err);
        setError(err.message);
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = loadPlayersService();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          console.log("🧹 Limpiando listener de jugadores");
          unsubscribe();
        }
      });
    };
  }, [teamId]);

  const refreshPlayers = useCallback(() => {
    console.log("📄 Refrescando jugadores...");
    setLoading(true);
  }, []);

  return {
    players,
    loading,
    error,
    refreshPlayers,
  };
};

// 🎯 HOOK DE JUGADOR INDIVIDUAL EN TIEMPO REAL
export const usePlayerRealTime = (playerId) => {
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) {
      console.log("⚠️ No hay playerId");
      setPlayer(null);
      setLoading(false);
      return;
    }

    console.log("📄 Cargando jugador:", playerId);
    setLoading(true);
    setError(null);

    const loadPlayerService = async () => {
      try {
        const { getPlayerByIdRealTime } = await import(
          "../services/playersFirebaseService"
        );

        const unsubscribe = getPlayerByIdRealTime(playerId, (playerData) => {
          console.log("📡 Jugador actualizado:", playerData?.name || playerId);
          setPlayer(playerData);
          setLoading(false);
          setError(null);
        });

        return unsubscribe;
      } catch (err) {
        console.error("❌ Error cargando servicio de jugador:", err);
        setError(err.message);
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = loadPlayerService();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          console.log("🧹 Limpiando listener de jugador");
          unsubscribe();
        }
      });
    };
  }, [playerId]);

  return {
    player,
    loading,
    error,
  };
};

// 💰 HOOK DE MULTAS DE JUGADOR EN TIEMPO REAL
export const usePlayerMultasRealTime = (playerId) => {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!playerId) {
      console.log("⚠️ No hay playerId para multas");
      setMultas([]);
      setLoading(false);
      return;
    }

    console.log("📄 Cargando multas para jugador:", playerId);
    setLoading(true);
    setError(null);

    const loadMultasService = async () => {
      try {
        const { getPlayerMultasRealTime } = await import(
          "../services/multasFirebaseService"
        );

        const unsubscribe = getPlayerMultasRealTime(playerId, (multasData) => {
          console.log("📡 Multas actualizadas:", multasData?.length || 0);
          setMultas(multasData || []);
          setLoading(false);
          setError(null);
        });

        return unsubscribe;
      } catch (err) {
        console.error("❌ Error cargando servicio de multas:", err);
        setError(err.message);
        setLoading(false);
        return () => {};
      }
    };

    const unsubscribePromise = loadMultasService();

    return () => {
      unsubscribePromise.then((unsubscribe) => {
        if (unsubscribe) {
          console.log("🧹 Limpiando listener de multas");
          unsubscribe();
        }
      });
    };
  }, [playerId]);

  // Estadísticas calculadas
  const stats = {
    total: multas.length,
    pendientes: multas.filter((m) => !m.paid).length,
    totalDeuda: multas
      .filter((m) => !m.paid)
      .reduce((sum, m) => sum + (m.amount || 0), 0),
    totalPagado: multas
      .filter((m) => m.paid)
      .reduce((sum, m) => sum + (m.amount || 0), 0),
  };

  return {
    multas,
    loading,
    error,
    stats,
  };
};

// 🏠 HOOK DE DATOS DEL EQUIPO
export const useTeamData = (teamId) => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teamId) {
      setTeamData(null);
      setLoading(false);
      return;
    }

    console.log("📄 Cargando datos del equipo:", teamId);
    setLoading(true);
    setError(null);

    const loadTeamData = async () => {
      try {
        const { getTeamStats } = await import(
          "../services/playersFirebaseService"
        );
        const stats = await getTeamStats(teamId);

        setTeamData(stats);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("❌ Error cargando datos del equipo:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadTeamData();
  }, [teamId]);

  return {
    teamData,
    loading,
    error,
  };
};
