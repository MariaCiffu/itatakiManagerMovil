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

// Actualizar un jugador
export const updateJugador = (jugadorData) => {
  // Verificar si el jugador existe
  const index = _findPlayerIndexById(jugadorData.id)

  if (index === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  // Actualizar el jugador
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
  // Generar un ID único si no se proporciona uno
  const playerToAdd = {
    ...newPlayer,
    id: newPlayer.id || String(Date.now()),
    multas: newPlayer.multas || [],
  }

  // Añadir a la lista local
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
  // Verificar si el jugador existe
  const index = _findPlayerIndexById(id)

  if (index === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  // Eliminar el jugador
  playersData = [...playersData.slice(0, index), ...playersData.slice(index + 1)]

  console.log(`Jugador ${id} eliminado`)
  return {
    success: true,
    message: "Jugador eliminado correctamente",
  }
}

// Función para obtener jugadores con multas pendientes
export const getJugadoresConMultas = () => {
  return playersData
    .map((jugador) => {
      // Filtrar multas no pagadas
        const multasPendientes = jugador.multas ? jugador.multas.filter((multa) => !multa.paid) : []

        // Calcular total pendiente
        const totalPendiente = multasPendientes.reduce((total, multa) => total + multa.amount, 0)

        return {
          id: jugador.id,
          name: jugador.name,
          phone: jugador.phone,
          multasPendientes,
          totalPendiente,
        }
      })
      .filter((jugador) => jugador.multasPendientes.length > 0)
}

// Añadir una multa a un jugador
export const addMultaToJugador = (jugadorId, multa) => {
  // Verificar si el jugador existe
  const index = _findPlayerIndexById(jugadorId)

  if (index === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  // Generar ID para la multa si no tiene
  const multaToAdd = {
    ...multa,
    id: multa.id || String(Date.now()),
    paid: multa.paid || false,
  }

  // Añadir la multa al jugador
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
  // Verificar si el jugador existe
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
      message: "Multa no encontrada", // Or "El jugador no tiene multas" if player.multas is null/empty
    }
  }

  // Actualizar el estado de la multa
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
  // Verificar si el jugador existe
  const playerIndex = _findPlayerIndexById(jugadorId)

  if (playerIndex === -1) {
    return {
      success: false,
      message: "Jugador no encontrado",
    }
  }

  const player = playersData[playerIndex]

  // Asegurarse de que player.multas exista antes de buscar la multa
  if (!player.multas) {
    player.multas = [] // Inicializar si no existe, aunque _findMultaIndexById ya lo maneja
  }

  const multaIndex = _findMultaIndexById(player, multaData.id)

  if (multaIndex === -1) {
    return {
      success: false,
      message: "Multa no encontrada",
    }
  }

  // Actualizar la multa con todos los nuevos datos
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
  // Verificar si el jugador existe
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
      // Consistent message whether player.multas is null or multa not found
      message: "Multa no encontrada en el jugador especificado",
    }
  }

  // Eliminar la multa
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