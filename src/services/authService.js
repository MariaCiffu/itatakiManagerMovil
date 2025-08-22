import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, COLLECTIONS, USER_ROLES } from "../config/firebase";

// 🔥 AUTENTICACIÓN

// Registrar nuevo usuario
export const registerUser = async (userData) => {
  try {
    console.log("📄 Iniciando registro de usuario...", userData.email);

    const {
      email,
      password,
      name,
      role = USER_ROLES.COACH, // Por defecto COACH
      teamId = "acd-fatima", // Tu equipo fijo
    } = userData;

    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("✅ Usuario creado en Firebase Auth:", user.uid);

    // Actualizar perfil
    await updateProfile(user, {
      displayName: name,
    });

    // Crear documento de usuario en Firestore
    const userDoc = {
      uid: user.uid,
      email: user.email,
      name: name,
      role: role,
      teamId: teamId,
      teamName: userData.teamName, // Nombre del equipo
      homeField: userData.homeField,
      category: userData.category,
      profilePhoto: userData.profilePhoto || null,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userDoc);
    console.log("Documento de usuario creado en Firestore");

    return {
      success: true,
      user: { ...user, ...userDoc },
    };
  } catch (error) {
    console.error("❌ Error en registro:", error);
    return {
      success: false,
      message: getAuthErrorMessage(error.code),
    };
  }
};

// Iniciar sesión
export const loginUser = async (email, password) => {
  try {
    console.log("📄 Iniciando sesión...", email);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("✅ Usuario logueado en Firebase Auth:", user.uid);

    // Obtener datos adicionales del usuario
    const userDoc = await getUserData(user.uid);
    console.log("📄 Datos adicionales obtenidos:", userDoc);

    const combinedUser = { ...user, ...userDoc };
    console.log("✅ Login exitoso, usuario completo:", combinedUser.name);

    return {
      success: true,
      user: combinedUser,
    };
  } catch (error) {
    console.error("❌ Error en login:", error);
    return {
      success: false,
      message: getAuthErrorMessage(error.code),
    };
  }
};

// Cerrar sesión
export const logoutUser = async () => {
  try {
    console.log("📄 Cerrando sesión...");
    await signOut(auth);
    console.log("✅ Usuario deslogueado exitosamente");
    return { success: true };
  } catch (error) {
    console.error("❌ Error en logout:", error);
    return { success: false, message: error.message };
  }
};

// Obtener datos del usuario
export const getUserData = async (uid) => {
  try {
    console.log("📄 Obteniendo datos de usuario:", uid);
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      console.log("✅ Datos de usuario encontrados:", userData.name);
      return userData;
    } else {
      console.log(
        "⚠️ No se encontró documento de usuario, creando uno básico..."
      );

      // Crear documento básico si no existe
      const basicUserDoc = {
        uid: uid,
        email: auth.currentUser?.email || "",
        name: auth.currentUser?.displayName || "Usuario",
        role: USER_ROLES.COACH,
        teamId: "acd-fatima",
        teamName: "A.C.D Fátima",
        homeField: "Campo Local",
        category: "Senior",
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, basicUserDoc);
      console.log("✅ Documento básico de usuario creado");
      return basicUserDoc;
    }
  } catch (error) {
    console.error("❌ Error obteniendo datos de usuario:", error);
    return null;
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (uid, updateData) => {
  try {
    console.log("📄 Actualizando perfil de usuario...", uid);
    const userRef = doc(db, COLLECTIONS.USERS, uid);

    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, dataToUpdate);

    // Si se actualiza el nombre, también actualizar en Auth
    if (updateData.name) {
      await updateProfile(auth.currentUser, {
        displayName: updateData.name,
      });
    }

    console.log("✅ Perfil actualizado exitosamente");
    return { success: true };
  } catch (error) {
    console.error("❌ Error actualizando perfil:", error);
    return { success: false, message: error.message };
  }
};

// 📡 OBSERVER DE ESTADO DE AUTENTICACIÓN
export const onAuthStateChange = (callback) => {
  console.log("🔧 Configurando onAuthStateChanged listener...");

  return onAuthStateChanged(auth, async (user) => {
    console.log("🔥 onAuthStateChanged triggered:", !!user);

    if (user) {
      console.log("✅ Usuario detectado en Firebase Auth:", user.uid);
      try {
        // Usuario logueado - obtener datos adicionales
        const userData = await getUserData(user.uid);
        console.log("📄 Datos de usuario obtenidos:", userData?.name);

        const combinedUser = { ...user, ...userData };
        console.log("🎯 Usuario completo para callback:", combinedUser.name);

        callback(combinedUser);
      } catch (error) {
        console.error("❌ Error obteniendo datos de usuario:", error);
        // En caso de error, devolver al menos el usuario de Firebase
        callback(user);
      }
    } else {
      console.log("❌ No hay usuario autenticado");
      callback(null);
    }
  });
};

// 🛠️ UTILIDADES

// Mensajes de error amigables
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/user-not-found": "No existe una cuenta con este email",
    "auth/wrong-password": "Contraseña incorrecta",
    "auth/email-already-in-use": "Ya existe una cuenta con este email",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
    "auth/invalid-email": "Email inválido",
    "auth/user-disabled": "Esta cuenta ha sido desactivada",
    "auth/too-many-requests": "Demasiados intentos fallidos. Intenta más tarde",
    "auth/network-request-failed": "Error de conexión. Verifica tu internet",
    "auth/requires-recent-login": "Por seguridad, vuelve a iniciar sesión",
    "auth/invalid-credential": "Credenciales incorrectas",
    "auth/operation-not-allowed": "Operación no permitida",
  };

  return errorMessages[errorCode] || "Ha ocurrido un error. Intenta nuevamente";
};

// 👥 GESTIÓN DE ROLES Y PERMISOS
export const hasPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    [USER_ROLES.ADMIN]: 5,
    [USER_ROLES.COACH]: 4,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

export const canEditPlayer = (userRole, userId, playerId) => {
  if (userRole === USER_ROLES.ADMIN || userRole === USER_ROLES.COACH) {
    return true;
  }
  return false;
};

export const canManageMultas = (userRole) => {
  return hasPermission(userRole, USER_ROLES.COACH);
};

export const canViewAllData = (userRole) => {
  return hasPermission(userRole, USER_ROLES.COACH);
};

// Validar email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validar contraseña
export const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Cambiar contraseña
export const changePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
};
