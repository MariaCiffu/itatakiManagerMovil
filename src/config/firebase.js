import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// CONFIGURACIÓN DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBgAiu-aStFHBXodG7JwRPevavsQfjFYlg",
  authDomain: "itataki-manager-3e37a.firebaseapp.com",
  projectId: "itataki-manager-3e37a",
  storageBucket: "itataki-manager-3e37a.firebasestorage.app",
  messagingSenderId: "858216935001",
  appId: "1:858216935001:web:b55cce26cc4eb3bcad4b48",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const db = getFirestore(app);

// CORREGIDO: Inicializar Auth con AsyncStorage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const storage = getStorage(app);

export default app;

// CONSTANTES DE COLECCIONES
export const COLLECTIONS = {
  PLAYERS: "players",
  MULTAS: "multas",
  STAFF: "staff",
  TEAMS: "teams",
  USERS: "users",
  PARTIDOS: "partidos",
};

// ROLES DE USUARIO
export const USER_ROLES = {
  ADMIN: "admin",
  COACH: "coach",
};

console.log("Firebase inicializado con AsyncStorage");
