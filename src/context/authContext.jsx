import { createContext, useContext, useReducer, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext(null);

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

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    tokens: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    loadStoredUser();
  }, []);

  // 🔥 CARGAR USUARIO GUARDADO
  const loadStoredUser = async () => {
    try {
      const [userData, accessToken, refreshToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      if (userData && accessToken) {
        const user = JSON.parse(userData);
        const tokens = { accessToken, refreshToken };

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, tokens },
        });
      } else {
        dispatch({ type: "AUTH_ERROR", payload: null });
      }
    } catch (error) {
      console.error("Error cargando usuario:", error);
      dispatch({ type: "AUTH_ERROR", payload: "Error de inicialización" });
    }
  };

  // 🔥 LOGIN SIMPLIFICADO - SOLO MODO MOCK
  const login = async (email, password) => {
    dispatch({ type: "LOADING_START" });

    try {
      // Simular delay de red
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 🔥 USUARIOS DE PRUEBA
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
            name: "Daniel San Juan",
            email: "coach@test.com",
            teamName: "A.C.D. Fátima",
            category: "Infantil",
            homeField: "Centro Deportivo Municipal Las Cruces",
            role: "coach",
          },
        },
      ];

      // Buscar usuario
      const testUser = testUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!testUser) {
        throw new Error("Credenciales incorrectas");
      }

      // Crear tokens mock
      const tokens = {
        accessToken: `mock_access_token_${Date.now()}`,
        refreshToken: `mock_refresh_token_${Date.now()}`,
      };

      // Guardar en storage
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
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error.message });
      throw error;
    }
  };

  // 🔥 REGISTRO SIMPLIFICADO
  const register = async (userData) => {
    dispatch({ type: "LOADING_START" });

    try {
      // Simular delay de red
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

      // Guardar en storage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(newUser)),
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      ]);

      dispatch({ type: "LOGIN_SUCCESS", payload: { user: newUser, tokens } });
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error.message });
      throw error;
    }
  };

  // 🔥 LOGOUT
  const logout = async () => {
    try {
      // Limpiar storage
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      ]);

      dispatch({ type: "LOGOUT" });
    } catch (error) {
      console.error("Error en logout:", error);
      dispatch({ type: "LOGOUT" }); // Logout local aunque falle el storage
    }
  };

  // 🔥 ACTUALIZAR PERFIL
  const updateProfile = async (data) => {
    if (!state.user) return;

    try {
      const updatedUser = { ...state.user, ...data };

      // Actualizar storage
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(updatedUser)
      );

      dispatch({ type: "UPDATE_PROFILE", payload: data });
    } catch (error) {
      throw error;
    }
  };

  // 🔥 LIMPIAR ERRORES
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
        clearError,
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
