import { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

// 🔥 CONFIGURACIÓN DE API (centralizada)
const API_CONFIG = {
  // Para desarrollo local - cambiar según tu backend
  baseURL: __DEV__
    ? "http://localhost:3000/api"
    : "https://tu-api-produccion.com/api",
  endpoints: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    profile: "/auth/profile",
  },
};

// 🔥 CONSTANTES DE STORAGE
const STORAGE_KEYS = {
  USER_DATA: "userData",
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOADING_START":
      return { ...state, isLoading: true, error: null };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        tokens: action.payload.tokens,
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        tokens: null,
        error: action.payload,
      };

    case "LOGOUT":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        tokens: null,
        isLoading: false,
        error: null,
      };

    case "UPDATE_PROFILE":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };

    case "UPDATE_TOKENS":
      return {
        ...state,
        tokens: action.payload,
      };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    tokens: null, // { accessToken, refreshToken }
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  // 🔥 INICIALIZACIÓN - Recupera datos del storage al abrir la app
  const initializeAuth = async () => {
    try {
      const [userData, accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      if (userData && accessToken) {
        const user = JSON.parse(userData);
        const tokens = { accessToken, refreshToken };

        // Verificar si el token sigue siendo válido
        const isValid = await validateToken(accessToken);

        if (isValid) {
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, tokens },
          });
        } else if (refreshToken) {
          // Intentar refrescar el token
          await refreshAuthToken(refreshToken);
        } else {
          // Token inválido y sin refresh token
          await clearStoredData();
          dispatch({ type: "AUTH_ERROR", payload: "Sesión expirada" });
        }
      } else {
        dispatch({ type: "AUTH_ERROR", payload: null });
      }
    } catch (error) {
      console.error("Error inicializando auth:", error);
      dispatch({ type: "AUTH_ERROR", payload: "Error de inicialización" });
    }
  };

  // 🔥 FUNCIÓN GENÉRICA PARA LLAMADAS A LA API
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_CONFIG.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Agregar token si está autenticado
    if (state.tokens?.accessToken && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${state.tokens.accessToken}`;
    }

    const response = await fetch(url, config);

    // Manejar token expirado
    if (
      response.status === 401 &&
      state.tokens?.refreshToken &&
      !options.skipAuth
    ) {
      const refreshed = await refreshAuthToken(state.tokens.refreshToken);
      if (refreshed) {
        // Reintentar la llamada original con el nuevo token
        config.headers.Authorization = `Bearer ${state.tokens.accessToken}`;
        return fetch(url, config);
      }
    }

    return response;
  };

  // 🔥 LOGIN - Preparado para backend real
  const login = async (email, password) => {
    dispatch({ type: "LOADING_START" });

    try {
      // MODO DESARROLLO - Datos mock (quitar cuando tengas backend)
      if (__DEV__ && !API_CONFIG.baseURL.includes("localhost")) {
        await simulateLogin(email, password);
        return;
      }

      // LLAMADA REAL AL BACKEND
      const response = await apiCall(API_CONFIG.endpoints.login, {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true, // No enviar token en login
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error de autenticación");
      }

      const data = await response.json();

      // El backend debería devolver: { user, accessToken, refreshToken }
      const { user, accessToken, refreshToken } = data;
      const tokens = { accessToken, refreshToken };

      // Guardar en storage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        refreshToken &&
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);

      dispatch({ type: "LOGIN_SUCCESS", payload: { user, tokens } });
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error.message });
      throw error;
    }
  };

  // 🔥 REGISTRO - Preparado para backend real
  const register = async (userData) => {
    dispatch({ type: "LOADING_START" });

    try {
      // MODO DESARROLLO - Datos mock (quitar cuando tengas backend)
      if (__DEV__ && !API_CONFIG.baseURL.includes("localhost")) {
        await simulateRegister(userData);
        return;
      }

      // LLAMADA REAL AL BACKEND
      const response = await apiCall(API_CONFIG.endpoints.register, {
        method: "POST",
        body: JSON.stringify(userData),
        skipAuth: true,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el registro");
      }

      const data = await response.json();
      const { user, accessToken, refreshToken } = data;
      const tokens = { accessToken, refreshToken };

      // Guardar en storage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
        refreshToken &&
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
      ]);

      dispatch({ type: "LOGIN_SUCCESS", payload: { user, tokens } });
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error.message });
      throw error;
    }
  };

  // 🔥 LOGOUT - Invalidar token en el servidor
  const logout = async () => {
    try {
      // Notificar al backend para invalidar el token
      if (state.tokens?.accessToken) {
        await apiCall(API_CONFIG.endpoints.logout, {
          method: "POST",
        }).catch(() => {
          // Si falla, continuamos con el logout local
          console.warn("No se pudo notificar logout al servidor");
        });
      }
    } catch (error) {
      console.warn("Error en logout del servidor:", error);
    } finally {
      // Limpiar storage y estado local
      await clearStoredData();
      dispatch({ type: "LOGOUT" });
    }
  };

  // 🔥 ACTUALIZAR PERFIL
  const updateProfile = async (data) => {
    if (!state.user) return;

    try {
      const response = await apiCall(API_CONFIG.endpoints.profile, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error actualizando perfil");
      }

      const updatedUser = await response.json();

      // Actualizar storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(updatedUser)
      );

      dispatch({ type: "UPDATE_PROFILE", payload: updatedUser });
    } catch (error) {
      throw error;
    }
  };

  // 🔥 REFRESCAR TOKEN
  const refreshAuthToken = async (refreshToken) => {
    try {
      const response = await apiCall(API_CONFIG.endpoints.refresh, {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
        skipAuth: true,
      });

      if (!response.ok) {
        throw new Error("No se pudo refrescar el token");
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await response.json();
      const tokens = {
        accessToken,
        refreshToken: newRefreshToken || refreshToken,
      };

      // Actualizar storage
      await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (newRefreshToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      }

      dispatch({ type: "UPDATE_TOKENS", payload: tokens });
      return true;
    } catch (error) {
      // Si falla el refresh, hacer logout
      await clearStoredData();
      dispatch({ type: "AUTH_ERROR", payload: "Sesión expirada" });
      return false;
    }
  };

  // 🔥 VALIDAR TOKEN
  const validateToken = async (token) => {
    try {
      // Simple validación del formato JWT
      if (!token || token.split(".").length !== 3) return false;

      // Decodificar payload para verificar expiración
      const payload = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;

      return payload.exp > now;
    } catch {
      return false;
    }
  };

  // 🔥 LIMPIAR DATOS DEL STORAGE
  const clearStoredData = async () => {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  };

  // 🔥 FUNCIONES MOCK PARA DESARROLLO (quitar cuando tengas backend)
  const simulateLogin = async (email, password) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Usuarios de prueba
    const testUsers = [
      {
        email: "admin@test.com",
        password: "123456",
        user: {
          id: "1",
          name: "Carlos Rodríguez",
          email: "admin@test.com",
          teamName: "FC Barcelona",
          category: "Juvenil A",
          homeField: "Camp Nou - Campo 2",
          role: "admin",
        },
      },
      {
        email: "coach@test.com",
        password: "654321",
        user: {
          id: "2",
          name: "Ana García",
          email: "coach@test.com",
          teamName: "Real Madrid CF",
          category: "Infantil",
          homeField: "Santiago Bernabéu - Campo 1",
          role: "coach",
        },
      },
    ];

    const testUser = testUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!testUser) {
      throw new Error("Credenciales incorrectas");
    }

    // Simular tokens JWT
    const tokens = {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    };

    await Promise.all([
      AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(testUser.user)
      ),
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);

    dispatch({
      type: "LOGIN_SUCCESS",
      payload: { user: testUser.user, tokens },
    });
  };

  const simulateRegister = async (userData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      teamName: userData.teamName,
      category: userData.category,
      homeField: userData.homeField,
      role: "coach",
    };

    const tokens = {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
    };

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser)),
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
    ]);

    dispatch({ type: "LOGIN_SUCCESS", payload: { user: newUser, tokens } });
  };

  // 🔥 FUNCIÓN PARA LIMPIAR ERRORES
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{
        state,
        login,
        register,
        logout,
        updateProfile,
        refreshAuthToken,
        clearError,
        apiCall, // Exportar para usar en otros servicios
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
