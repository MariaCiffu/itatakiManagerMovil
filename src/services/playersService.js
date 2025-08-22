// services/playersService.js - SERVICIO UNIFICADO
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
  onSnapshot,
  serverTimestamp,
  writeBatch,
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

// 🎯 FUNCIONES PRINCIPALES (Las que usa tu código)

export const getAllJugadores = async () => {
  try {
    const teamId = await getCurrentTeamId();
    const playersRef = collection(db, COLLECTIONS.PLAYERS);

    // Consulta temporal sin orderBy (mientras se construye el índice)
    const q = query(
      playersRef,
      where("teamId", "==", teamId),
      where("active", "==", true)
    );

    const snapshot = await getDocs(q);
    const players = [];

    snapshot.forEach((doc) => {
      players.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Ordenar localmente
    players.sort((a, b) => (a.number || 0) - (b.number || 0));

    console.log("✅ Jugadores obtenidos:", players.length);
    return players;
  } catch (error) {
    console.error("❌ Error en getAllJugadores:", error);
    return [];
  }
};

export const getJugadorById = async (id) => {
  try {
    const playerRef = doc(db, COLLECTIONS.PLAYERS, id);
    const playerSnap = await getDoc(playerRef);

    if (playerSnap.exists()) {
      return {
        id: playerSnap.id,
        ...playerSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("❌ Error en getJugadorById:", error);
    throw error;
  }
};

export const addJugador = async (playerData) => {
  try {
    const teamId = await getCurrentTeamId();

    // Validar datos requeridos
    if (!playerData.name || !playerData.number || !playerData.position) {
      return {
        success: false,
        message: "Faltan campos obligatorios: nombre, dorsal y posición",
      };
    }

    // Verificar número duplicado
    const existingPlayer = await getPlayerByNumber(playerData.number, teamId);
    if (existingPlayer) {
      return {
        success: false,
        message: `Ya existe un jugador con el dorsal ${playerData.number}`,
      };
    }

    const newPlayer = {
      ...playerData,
      number: parseInt(playerData.number),
      teamId: teamId,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.PLAYERS), newPlayer);

    console.log("✅ Jugador creado:", docRef.id);
    return {
      success: true,
      id: docRef.id,
      message: "Jugador añadido correctamente",
    };
  } catch (error) {
    console.error("❌ Error en addJugador:", error);
    return {
      success: false,
      message: "Error al guardar el jugador: " + error.message,
    };
  }
};

export const updateJugador = async (playerId, updateData) => {
  try {
    const playerRef = doc(db, COLLECTIONS.PLAYERS, playerId);

    // Verificar número duplicado si se está cambiando
    if (updateData.number) {
      const currentPlayer = await getJugadorById(playerId);
      if (currentPlayer && currentPlayer.number !== updateData.number) {
        const teamId = await getCurrentTeamId();
        const existingPlayer = await getPlayerByNumber(
          updateData.number,
          teamId
        );
        if (existingPlayer && existingPlayer.id !== playerId) {
          return {
            success: false,
            message: `Ya existe un jugador con el dorsal ${updateData.number}`,
          };
        }
      }
    }

    const dataToUpdate = {
      ...updateData,
      ...(updateData.number && { number: parseInt(updateData.number) }),
      updatedAt: serverTimestamp(),
    };

    await updateDoc(playerRef, dataToUpdate);

    console.log("✅ Jugador actualizado:", playerId);
    return {
      success: true,
      message: "Jugador actualizado correctamente",
    };
  } catch (error) {
    console.error("❌ Error en updateJugador:", error);
    return {
      success: false,
      message: "Error al actualizar el jugador: " + error.message,
    };
  }
};

export const deleteJugador = async (playerId) => {
  try {
    const playerRef = doc(db, COLLECTIONS.PLAYERS, playerId);

    // Soft delete
    await updateDoc(playerRef, {
      active: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Jugador eliminado:", playerId);
    return {
      success: true,
      message: "Jugador eliminado correctamente",
    };
  } catch (error) {
    console.error("❌ Error en deleteJugador:", error);
    return {
      success: false,
      message: "Error al eliminar el jugador: " + error.message,
    };
  }
};

// 🔍 FUNCIONES AUXILIARES

const getPlayerByNumber = async (number, teamId) => {
  try {
    const playersRef = collection(db, COLLECTIONS.PLAYERS);
    const q = query(
      playersRef,
      where("teamId", "==", teamId),
      where("number", "==", parseInt(number)),
      where("active", "==", true)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }

    return null;
  } catch (error) {
    console.error("❌ Error verificando número de jugador:", error);
    return null;
  }
};

// 🔍 FUNCIONES DE BÚSQUEDA

export const searchJugadores = async (searchTerm) => {
  try {
    const allPlayers = await getAllJugadores();

    if (!searchTerm || searchTerm.trim() === "") {
      return allPlayers;
    }

    const term = searchTerm.toLowerCase();

    return allPlayers.filter(
      (player) =>
        player.name.toLowerCase().includes(term) ||
        (player.number && player.number.toString().includes(term)) ||
        (player.position && player.position.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error("❌ Error en searchJugadores:", error);
    return [];
  }
};

// 💰 SERVICIOS DE MULTAS

export const getMultasJugador = async (playerId) => {
  try {
    console.log("📄 Obteniendo multas para jugador:", playerId);

    const multasRef = collection(db, COLLECTIONS.MULTAS);
    const q = query(
      multasRef,
      where("playerId", "==", playerId),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    const multas = [];

    snapshot.forEach((doc) => {
      multas.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log("✅ Multas obtenidas:", multas.length);
    return multas;
  } catch (error) {
    console.error("❌ Error obteniendo multas del jugador:", error);
    return [];
  }
};

export const addMultaToJugador = async (playerId, multaData) => {
  try {
    const teamId = await getCurrentTeamId();

    const newMulta = {
      ...multaData,
      playerId: playerId,
      teamId: teamId,
      paid: multaData.paid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.MULTAS), newMulta);

    console.log("✅ Multa creada:", docRef.id);
    return {
      success: true,
      id: docRef.id,
      message: "Multa añadida correctamente",
    };
  } catch (error) {
    console.error("❌ Error añadiendo multa:", error);
    return {
      success: false,
      message: "Error al añadir la multa: " + error.message,
    };
  }
};

export const updateMultaStatus = async (multaId, paid) => {
  try {
    console.log("🔄 Actualizando estado de multa:", multaId, "a", paid);

    const multaRef = doc(db, COLLECTIONS.MULTAS, multaId);

    await updateDoc(multaRef, {
      paid: paid,
      paidAt: paid ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    });

    console.log("✅ Estado de multa actualizado");
    return {
      success: true,
      message: `Multa ${paid ? "marcada como pagada" : "marcada como pendiente"}`,
    };
  } catch (error) {
    console.error("❌ Error actualizando estado de multa:", error);
    return {
      success: false,
      message: "Error al actualizar el estado: " + error.message,
    };
  }
};

export const deleteMultaFromJugador = async (multaId) => {
  try {
    console.log("🗑️ Eliminando multa:", multaId);

    const multaRef = doc(db, COLLECTIONS.MULTAS, multaId);
    await deleteDoc(multaRef);

    console.log("✅ Multa eliminada");
    return {
      success: true,
      message: "Multa eliminada correctamente",
    };
  } catch (error) {
    console.error("❌ Error eliminando multa:", error);
    return {
      success: false,
      message: "Error al eliminar la multa: " + error.message,
    };
  }
};

// 📊 ESTADÍSTICAS

export const getEstadisticasEquipo = async () => {
  try {
    const teamId = await getCurrentTeamId();
    const players = await getAllJugadores();

    // Obtener multas del equipo
    const multasRef = collection(db, COLLECTIONS.MULTAS);
    const multasQuery = query(multasRef, where("teamId", "==", teamId));
    const multasSnapshot = await getDocs(multasQuery);

    let totalMultas = 0;
    let multasPendientes = 0;
    let totalDeuda = 0;

    multasSnapshot.forEach((doc) => {
      const multa = doc.data();
      totalMultas++;
      if (!multa.paid) {
        multasPendientes++;
        totalDeuda += multa.amount;
      }
    });

    return {
      totalPlayers: players.length,
      totalMultas,
      multasPendientes,
      totalDeuda: totalDeuda || 0,
    };
  } catch (error) {
    console.error("❌ Error en getEstadisticasEquipo:", error);
    return {
      totalPlayers: 0,
      totalMultas: 0,
      multasPendientes: 0,
      totalDeuda: 0,
    };
  }
};
