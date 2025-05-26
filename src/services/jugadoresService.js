// src/services/jugadoresService.js
// This service currently manages data in-memory.
// Changes will not persist across application sessions.
import { PLAYERS } from "../data/teamData"

// Variable para mantener una copia local de los datos
let playersData = [...PLAYERS]

// Helper function to find a player index by ID
const _findPlayerIndexById = (id) => {
  return playersData.findIndex((player) => player.id === id)
}

// Helper function to find a multa index by ID within a player's multas
const _findMultaIndexById = (player, multaId) => {
  if (!player || !player.multas) {
    return -1
  }
  return player.multas.findIndex((multa) => multa.id === multaId)
}

// Obtener todos los jugadores
export const getAllJugadores = () => {
  return playersData
}

// Obtener un jugador por ID
export const getJugadorById = (id) => {
  const index = _findPlayerIndexById(id)
  return index !== -1 ? playersData[index] : null
}

// Obtener el nombre de un jugador por ID
export const getJugadorNameById = (id) => {
  const index = _findPlayerIndexById(id)
  return index !== -1 ? playersData[index].name : "No asignado"
}

// Función para obtener jugadores con multas pendientes
export const getJugadoresConMultas = () => {
  console.log("🔍 Buscando jugadores con multas...")
  console.log("📊 Total jugadores:", playersData.length)

  const jugadoresConMultas = playersData
    .map((jugador) => {
      // Filtrar multas no pagadas
      const multasPendientes = jugador.multas ? jugador.multas.filter((multa) => !multa.paid) : []

      // Calcular total pendiente
      const totalPendiente = multasPendientes.reduce((total, multa) => total + multa.amount, 0)

      console.log(`👤 ${jugador.name}: ${multasPendientes.length} multas pendientes, total: ${totalPendiente}€`)

      return {
        id: jugador.id,
        name: jugador.name,
        phone: jugador.phone,
        multasPendientes,
        totalPendiente,
      }
    })
    .filter((jugador) => jugador.multasPendientes.length > 0)

  console.log("✅ Jugadores con multas encontrados:", jugadoresConMultas.length)
  return jugadoresConMultas
}

// Actualizar un jugador
export const updateJugador = (jugadorData) => {
  const index = _findPlayerIndexById(jugadorData.id)

  if (index === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  const updatedPlayer = {
    ...playersData[index],
    ...jugadorData,
  }

  playersData = [...playersData.slice(0, index), updatedPlayer, ...playersData.slice(index + 1)]

  console.log(`Jugador ${jugadorData.id} actualizado:`, updatedPlayer)
  return {
    success: true,
    message: "Jugador actualizado correctamente",
    jugador: updatedPlayer,
  }
}

// Añadir un nuevo jugador
export const addJugador = (newPlayer) => {
  const playerToAdd = {
    ...newPlayer,
    id: newPlayer.id || String(Date.now()),
    multas: newPlayer.multas || [],
  }

  playersData = [...playersData, playerToAdd]

  console.log("Jugador añadido:", playerToAdd)
  return {
    success: true,
    message: "Jugador añadido correctamente",
    jugador: playerToAdd,
  }
}

// Eliminar un jugador
export const deleteJugador = (id) => {
  const index = _findPlayerIndexById(id)

  if (index === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  playersData = [...playersData.slice(0, index), ...playersData.slice(index + 1)]

  console.log(`Jugador ${id} eliminado`)
  return {
    success: true,
    message: "Jugador eliminado correctamente",
  }
}

// Añadir una multa a un jugador
export const addMultaToJugador = (jugadorId, multa) => {
  const index = _findPlayerIndexById(jugadorId)

  if (index === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  const multaToAdd = {
    ...multa,
    id: multa.id || String(Date.now()),
    paid: multa.paid || false,
  }

  const updatedPlayer = {
    ...playersData[index],
    multas: [...(playersData[index].multas || []), multaToAdd],
  }

  playersData = [...playersData.slice(0, index), updatedPlayer, ...playersData.slice(index + 1)]

  console.log(`Multa añadida al jugador ${jugadorId}:`, multaToAdd)
  return {
    success: true,
    message: "Multa añadida correctamente",
    jugador: updatedPlayer,
  }
}

// Actualizar el estado de una multa (pagado o no)
export const updateMultaStatus = (jugadorId, multaId, isPaid) => {
  const playerIndex = _findPlayerIndexById(jugadorId)

  if (playerIndex === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  const player = playersData[playerIndex]
  const multaIndex = _findMultaIndexById(player, multaId)

  if (multaIndex === -1) {
    return {
      success: false,
      message: "Multa no encontrada",
    }
  }

  const updatedMultas = [
    ...player.multas.slice(0, multaIndex),
    { ...player.multas[multaIndex], paid: isPaid },
    ...player.multas.slice(multaIndex + 1),
  ]

  const updatedPlayer = {
    ...player,
    multas: updatedMultas,
  }

  playersData = [...playersData.slice(0, playerIndex), updatedPlayer, ...playersData.slice(playerIndex + 1)]

  console.log(`Estado de multa ${multaId} actualizado a ${isPaid ? "pagada" : "no pagada"}`)
  return {
    success: true,
    message: `Multa marcada como ${isPaid ? "pagada" : "no pagada"}`,
    jugador: updatedPlayer,
  }
}

// Actualizar una multa completa
export const updateMulta = (jugadorId, multaData) => {
  const playerIndex = _findPlayerIndexById(jugadorId)

  if (playerIndex === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  const player = playersData[playerIndex]

  if (!player.multas) {
    player.multas = []
  }

  const multaIndex = _findMultaIndexById(player, multaData.id)

  if (multaIndex === -1) {
    return {
      success: false,
      message: "Multa no encontrada",
    }
  }

  const updatedMultas = [
    ...player.multas.slice(0, multaIndex),
    { ...player.multas[multaIndex], ...multaData },
    ...player.multas.slice(multaIndex + 1),
  ]

  const updatedPlayer = {
    ...player,
    multas: updatedMultas,
  }

  playersData = [...playersData.slice(0, playerIndex), updatedPlayer, ...playersData.slice(playerIndex + 1)]

  console.log(`Multa ${multaData.id} actualizada:`, multaData)
  return {
    success: true,
    message: "Multa actualizada correctamente",
    jugador: updatedPlayer,
  }
}

// Eliminar una multa
export const deleteMulta = (jugadorId, multaId) => {
  const playerIndex = _findPlayerIndexById(jugadorId)

  if (playerIndex === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  const player = playersData[playerIndex]
  const multaIndex = _findMultaIndexById(player, multaId)

  if (multaIndex === -1) {
    return {
      success: false,
      message: "Multa no encontrada en el jugador especificado",
    }
  }

  const updatedMultas = [...player.multas.slice(0, multaIndex), ...player.multas.slice(multaIndex + 1)]

  const updatedPlayer = {
    ...player,
    multas: updatedMultas,
  }

  playersData = [...playersData.slice(0, playerIndex), updatedPlayer, ...playersData.slice(playerIndex + 1)]

  console.log(`Multa ${multaId} eliminada del jugador ${jugadorId}`)
  return {
    success: true,
    message: "Multa eliminada correctamente",
    jugador: updatedPlayer,
  }
}

// Exportar también PLAYERS para compatibilidad
export { PLAYERS }
