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

// 🎯 FUNCIONES PRINCIPALES

export const getAllPartidos = async () => {
  try {
    const teamId = await getCurrentTeamId();
    const partidosRef = collection(db, COLLECTIONS.PARTIDOS);

    const q = query(
      partidosRef,
      where("teamId", "==", teamId),
      where("active", "==", true),
      orderBy("fecha", "desc")
    );

    const snapshot = await getDocs(q);
    const partidos = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      partidos.push({
        id: doc.id,
        ...data,
        // Convertir timestamp de Firestore a Date
        fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(data.fecha),
      });
    });

    console.log("✅ Partidos obtenidos:", partidos.length);
    return partidos;
  } catch (error) {
    console.error("❌ Error en getAllPartidos:", error);
    return [];
  }
};

export const getPartidoById = async (id) => {
  try {
    console.log("🔄 Obteniendo partido:", id);

    const partidoRef = doc(db, COLLECTIONS.PARTIDOS, id);
    const partidoSnap = await getDoc(partidoRef);

    if (partidoSnap.exists()) {
      const data = partidoSnap.data();
      const partido = {
        id: partidoSnap.id,
        ...data,
        // Convertir timestamp de Firestore a Date
        fecha: data.fecha?.toDate ? data.fecha.toDate() : new Date(data.fecha),
      };

      console.log("✅ Partido obtenido:", partido.id);
      return partido;
    } else {
      console.log("❌ Partido no encontrado:", id);
      return null;
    }
  } catch (error) {
    console.error("❌ Error en getPartidoById:", error);
    throw error;
  }
};

export const addPartido = async (partidoData) => {
  try {
    const teamId = await getCurrentTeamId();

    // Validar datos requeridos
    if (!partidoData.rival || !partidoData.fecha) {
      return {
        success: false,
        message: "Faltan campos obligatorios: rival y fecha",
      };
    }

    // Validar que no sea un partido exactamente igual
    const existingPartido = await checkDuplicatePartido(
      partidoData.rival,
      partidoData.fecha,
      partidoData.lugar,
      teamId
    );

    if (existingPartido) {
      return {
        success: false,
        message: `Ya existe un partido exactamente igual: ${partidoData.rival} el ${new Date(partidoData.fecha).toLocaleString("es-ES")}`,
      };
    }

    const newPartido = {
      ...partidoData,
      teamId: teamId,
      active: true,
      fecha: new Date(partidoData.fecha),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.PARTIDOS),
      newPartido
    );

    console.log("Partido creado:", docRef.id);
    return {
      success: true,
      id: docRef.id,
      message: "Partido añadido correctamente",
    };
  } catch (error) {
    console.error("Error en addPartido:", error);
    return {
      success: false,
      message: "Error al guardar el partido: " + error.message,
    };
  }
};

export const updatePartido = async (partidoId, updateData) => {
  try {
    console.log("Actualizando partido:", partidoId);

    const partidoRef = doc(db, COLLECTIONS.PARTIDOS, partidoId);

    // Si se están actualizando campos críticos, verificar duplicados
    if (updateData.fecha || updateData.rival || updateData.lugar) {
      const currentPartido = await getPartidoById(partidoId);
      if (currentPartido) {
        const newRival = updateData.rival || currentPartido.rival;
        const newFecha = updateData.fecha || currentPartido.fecha;
        const newLugar = updateData.lugar || currentPartido.lugar;

        const teamId = await getCurrentTeamId();
        const existingPartido = await checkDuplicatePartido(
          newRival,
          newFecha,
          newLugar,
          teamId,
          partidoId // Excluir el partido actual
        );

        if (existingPartido) {
          return {
            success: false,
            message: `Ya existe un partido exactamente igual: ${newRival} el ${new Date(newFecha).toLocaleString("es-ES")}`,
          };
        }
      }
    }

    const dataToUpdate = {
      ...updateData,
      ...(updateData.fecha && { fecha: new Date(updateData.fecha) }),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(partidoRef, dataToUpdate);

    console.log("Partido actualizado:", partidoId);
    return {
      success: true,
      message: "Partido actualizado correctamente",
    };
  } catch (error) {
    console.error("Error en updatePartido:", error);
    return {
      success: false,
      message: "Error al actualizar el partido: " + error.message,
    };
  }
};

export const deletePartido = async (partidoId) => {
  try {
    console.log("🗑️ Eliminando partido:", partidoId);

    const partidoRef = doc(db, COLLECTIONS.PARTIDOS, partidoId);

    // Soft delete
    await updateDoc(partidoRef, {
      active: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Partido eliminado:", partidoId);
    return {
      success: true,
      message: "Partido eliminado correctamente",
    };
  } catch (error) {
    console.error("❌ Error en deletePartido:", error);
    return {
      success: false,
      message: "Error al eliminar el partido: " + error.message,
    };
  }
};

// 🔍 FUNCIONES AUXILIARES

const checkDuplicatePartido = async (
  rival,
  fecha,
  lugar,
  teamId,
  excludeId = null
) => {
  try {
    const partidosRef = collection(db, COLLECTIONS.PARTIDOS);

    // Query simplificada para evitar el índice compuesto complejo
    const q = query(
      partidosRef,
      where("teamId", "==", teamId),
      where("active", "==", true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Filtrar manualmente para encontrar partido exactamente igual
    const duplicates = snapshot.docs.filter((doc) => {
      // Excluir el documento actual si se especifica
      if (excludeId && doc.id === excludeId) {
        return false;
      }

      const data = doc.data();

      // Verificar que sea exactamente el mismo partido
      const mismosRivales = data.rival === rival;
      const mismoLugar = data.lugar === lugar;

      // Comparar fechas con margen de 1 minuto para evitar problemas de precisión
      const partidoFecha = data.fecha?.toDate
        ? data.fecha.toDate()
        : new Date(data.fecha);
      const nuevaFecha = new Date(fecha);
      const diferenciaTiempo = Math.abs(
        partidoFecha.getTime() - nuevaFecha.getTime()
      );
      const mismaFecha = diferenciaTiempo < 60000; // 1 minuto de margen

      return mismosRivales && mismoLugar && mismaFecha;
    });

    return duplicates.length > 0 ? duplicates[0] : null;
  } catch (error) {
    console.error("Error verificando partido duplicado:", error);
    return null;
  }
};

// 🔍 FUNCIONES DE BÚSQUEDA

export const searchPartidos = async (searchTerm) => {
  console.log("searchTerm:", searchTerm);
  try {
    const allPartidos = await getAllPartidos();

    if (!searchTerm || searchTerm.trim() === "") {
      return allPartidos;
    }

    const term = searchTerm.toLowerCase();
    console.log(term);
    return allPartidos.filter(
      (partido) =>
        partido.rival.toLowerCase().includes(term) ||
        (partido.jornada &&
          partido.jornada.toString().toLowerCase().includes(term)) ||
        (partido.tipoPartido &&
          partido.tipoPartido.toLowerCase().includes(term)) ||
        (partido.tipoPartido &&
          (partido.tipoPartido.toLowerCase().includes(term.toLowerCase()) ||
            ("jornada".startsWith(term.toLowerCase()) &&
              partido.tipoPartido === "liga"))) || // si escribe jornada => liga
        (partido.lugar && partido.lugar.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error("❌ Error en searchPartidos:", error);
    return [];
  }
};

// 🕒 FUNCIONES DE TIEMPO

export const getProximosPartidos = async (limite = 5) => {
  try {
    const teamId = await getCurrentTeamId();
    const partidosRef = collection(db, COLLECTIONS.PARTIDOS);

    const now = new Date();
    const q = query(
      partidosRef,
      where("teamId", "==", teamId),
      where("active", "==", true),
      where("fecha", ">=", now),
      orderBy("fecha", "asc")
    );

    const snapshot = await getDocs(q);
    const proximosPartidos = [];

    snapshot.forEach((doc) => {
      if (proximosPartidos.length < limite) {
        const data = doc.data();
        proximosPartidos.push({
          id: doc.id,
          ...data,
          fecha: data.fecha?.toDate
            ? data.fecha.toDate()
            : new Date(data.fecha),
        });
      }
    });

    console.log("✅ Próximos partidos obtenidos:", proximosPartidos.length);
    return proximosPartidos;
  } catch (error) {
    console.error("❌ Error en getProximosPartidos:", error);
    return [];
  }
};

// Funciones adicionales para compatibilidad si las necesitas
export const getPartidos = getAllPartidos;

// Función para verificar si un partido ya se jugó
export const isPartidoJugado = (fechaPartido) => {
  if (!fechaPartido) return false;
  const fecha =
    fechaPartido instanceof Date ? fechaPartido : new Date(fechaPartido);
  const ahora = new Date();
  return fecha < ahora;
};

// Función para crear un nuevo reporte (primera vez)
export const createReportePartido = async (partidoId, reporteData) => {
  try {
    if (!partidoId || !reporteData) {
      return {
        success: false,
        message: "Datos insuficientes para crear el reporte",
      };
    }

    const partidoRef = doc(db, "partidos", partidoId);

    // Verificar que el partido existe
    const partidoData = await getPartidoById(partidoId);
    if (!partidoData) {
      return { success: false, message: "El partido no existe" };
    }

    // Obtener el teamId del usuario actual
    const currentTeamId = await getCurrentTeamId();

    // Verificar que el partido pertenece al mismo equipo
    if (partidoData.teamId !== currentTeamId) {
      return {
        success: false,
        message: "No tienes permisos para crear este reporte",
      };
    }

    // Verificar que el partido ya se jugó
    if (!isPartidoJugado(partidoData.fecha)) {
      return {
        success: false,
        message:
          "No puedes crear un reporte para un partido que aún no se ha jugado",
      };
    }

    // Verificar que no existe ya un reporte
    if (partidoData.reportePartido?.completado) {
      return {
        success: false,
        message: "Este partido ya tiene un reporte completado",
      };
    }

    // Preparar datos del reporte
    const nuevoReporte = {
      ...reporteData,
      fechaReporte: new Date().toISOString(),
      completado: true,
    };

    // Actualizar el documento
    await updateDoc(partidoRef, {
      reportePartido: nuevoReporte,
      updatedAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Reporte creado correctamente",
      id: partidoId,
    };
  } catch (error) {
    console.error("Error al crear reporte:", error);
    return {
      success: false,
      message: error.message || "Error al crear el reporte del partido",
    };
  }
};

// Función para actualizar un reporte existente
export const updateReportePartido = async (partidoId, reporteData) => {
  try {
    if (!partidoId || !reporteData) {
      return {
        success: false,
        message: "Datos insuficientes para actualizar el reporte",
      };
    }

    const partidoRef = doc(db, COLLECTIONS.PARTIDOS, partidoId); // Usar COLLECTIONS

    // Verificar que el partido existe
    const partidoData = await getPartidoById(partidoId);
    if (!partidoData) {
      return { success: false, message: "El partido no existe" };
    }

    // Verificar que el usuario pertenece al mismo equipo
    const currentTeamId = await getCurrentTeamId();
    if (partidoData.teamId !== currentTeamId) {
      return {
        success: false,
        message: "No tienes permisos para editar este reporte",
      };
    }

    // Verificar que existe un reporte previo
    if (!partidoData.reportePartido) {
      return {
        success: false,
        message: "No existe un reporte previo para actualizar",
      };
    }

    // Preparar datos actualizados (mantener fecha original de creación)
    const reporteActualizado = {
      ...reporteData,
      fechaReporte: partidoData.reportePartido.fechaReporte, // Mantener fecha original
      fechaActualizacion: new Date().toISOString(), // Nueva fecha de actualización
      completado: true,
    };

    // Actualizar el documento
    await updateDoc(partidoRef, {
      reportePartido: reporteActualizado,
      updatedAt: serverTimestamp(), // Usar serverTimestamp como en las otras funciones
    });

    return {
      success: true,
      message: "Reporte actualizado correctamente",
      id: partidoId,
    };
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    return {
      success: false,
      message: error.message || "Error al actualizar el reporte del partido",
    };
  }
};
