import { createContext, useContext, useReducer, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

const AuthContext = createContext(null)

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, isLoading: true }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload,
      }
    case "LOGIN_ERROR":
      return { ...state, isLoading: false, isAuthenticated: false, user: null }
    case "LOGOUT":
      return { ...state, isAuthenticated: false, user: null, isLoading: false }
    case "UPDATE_PROFILE":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    loadStoredUser()
  }, [])

  const loadStoredUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData")
      if (userData) {
        const user = JSON.parse(userData)
        dispatch({ type: "LOGIN_SUCCESS", payload: user })
      } else {
        dispatch({ type: "LOGIN_ERROR" })
      }
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR" })
    }
  }

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" })

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser = {
        id: "1",
        name: "Carlos Rodríguez",
        email: email,
        teamName: "FC Barcelona",
        category: "Juvenil A",
        homeField: "Camp Nou - Campo 2",
      }

      await AsyncStorage.setItem("userData", JSON.stringify(mockUser))
      dispatch({ type: "LOGIN_SUCCESS", payload: mockUser })
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR" })
      throw error
    }
  }

  const register = async (userData) => {
    dispatch({ type: "LOGIN_START" })

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        teamName: userData.teamName,
        category: userData.category,
        homeField: userData.homeField,
      }

      await AsyncStorage.setItem("userData", JSON.stringify(newUser))
      dispatch({ type: "LOGIN_SUCCESS", payload: newUser })
    } catch (error) {
      dispatch({ type: "LOGIN_ERROR" })
      throw error
    }
  }

  const logout = async () => {
    await AsyncStorage.removeItem("userData")
    dispatch({ type: "LOGOUT" })
  }

  const updateProfile = async (data) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...data }
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser))
      dispatch({ type: "UPDATE_PROFILE", payload: data })
    }
  }

  return (
    <AuthContext.Provider value={{ state, login, register, logout, updateProfile }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}