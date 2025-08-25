import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, COLLECTIONS } from "../config/firebase";

// 🔥 FUNCIÓN HELPER PARA OBTENER TEAMID
const getCurrentTeamId = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("❌ No hay usuario autenticado");
      return "acd-fatima";
    }

    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.teamId || "acd-fatima";
    } else {
      return "acd-fatima";
    }
  } catch (error) {
    console.error("❌ Error obteniendo teamId:", error);
    return "acd-fatima";
  }
};

// 🎯 FUNCIONES PRINCIPALES DEL STAFF

export const getAllStaff = async () => {
  try {
    const teamId = await getCurrentTeamId();
    const staffRef = collection(db, COLLECTIONS.STAFF);

    const q = query(
      staffRef,
      where("teamId", "==", teamId),
      where("active", "==", true),
      orderBy("name", "asc")
    );

    const snapshot = await getDocs(q);
    const staff = [];

    snapshot.forEach((doc) => {
      staff.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("✅ Staff obtenido:", staff.length);
    return staff;
  } catch (error) {
    console.error("❌ Error en getAllStaff:", error);
    return [];
  }
};

export const getStaffById = async (id) => {
  try {
    const staffRef = doc(db, COLLECTIONS.STAFF, id);
    const staffSnap = await getDoc(staffRef);

    if (staffSnap.exists()) {
      return {
        id: staffSnap.id,
        ...staffSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("❌ Error en getStaffById:", error);
    throw error;
  }
};

export const addStaffMember = async (staffData) => {
  try {
    const teamId = await getCurrentTeamId();

    // Validar datos requeridos
    if (!staffData.name || !staffData.position) {
      return {
        success: false,
        message: "Faltan campos obligatorios: nombre y cargo",
      };
    }

    const newStaff = {
      ...staffData,
      teamId: teamId,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.STAFF), newStaff);

    console.log("✅ Staff creado:", docRef.id);
    return {
      success: true,
      id: docRef.id,
      message: "Miembro añadido correctamente",
    };
  } catch (error) {
    console.error("❌ Error en addStaffMember:", error);
    return {
      success: false,
      message: "Error al guardar el miembro: " + error.message,
    };
  }
};

export const updateStaffMember = async (staffId, updateData) => {
  try {
    const staffRef = doc(db, COLLECTIONS.STAFF, staffId);

    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(staffRef, dataToUpdate);

    console.log("✅ Staff actualizado:", staffId);
    return {
      success: true,
      message: "Miembro actualizado correctamente",
    };
  } catch (error) {
    console.error("❌ Error en updateStaffMember:", error);
    return {
      success: false,
      message: "Error al actualizar el miembro: " + error.message,
    };
  }
};

export const deleteStaffMember = async (staffId) => {
  try {
    const staffRef = doc(db, COLLECTIONS.STAFF, staffId);

    // Soft delete
    await updateDoc(staffRef, {
      active: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Staff eliminado:", staffId);
    return {
      success: true,
      message: "Miembro eliminado correctamente",
    };
  } catch (error) {
    console.error("❌ Error en deleteStaffMember:", error);
    return {
      success: false,
      message: "Error al eliminar el miembro: " + error.message,
    };
  }
};

// 🔍 FUNCIÓN DE BÚSQUEDA
export const searchStaff = async (searchTerm) => {
  try {
    const allStaff = await getAllStaff();

    if (!searchTerm || searchTerm.trim() === "") {
      return allStaff;
    }

    const term = searchTerm.toLowerCase();

    return allStaff.filter(
      (member) =>
        member.name.toLowerCase().includes(term) ||
        (member.position && member.position.toLowerCase().includes(term)) ||
        (member.phone && member.phone.includes(term)) ||
        (member.email && member.email.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error("❌ Error en searchStaff:", error);
    return [];
  }
};
