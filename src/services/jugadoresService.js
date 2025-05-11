// src/services/jugadoresService.js
import { PLAYERS } from "../data/teamData"

// Variable para mantener una copia local de los datos
let playersData = [...PLAYERS]

// Obtener todos los jugadores
export const getAllJugadores = () => {
  return Promise.resolve(playersData)
}

// Obtener un jugador por ID
export const getJugadorById = (id) => {
  const jugador = playersData.find((player) => player.id === id)
  return Promise.resolve(jugador || null)
}

// Obtener el nombre de un jugador por ID
export const getJugadorNameById = (id) => {
  const jugador = playersData.find((player) => player.id === id)
  return Promise.resolve(jugador ? jugador.name : "No asignado")
}

// Actualizar un jugador
export const updateJugador = (jugadorData) => {
  // Verificar si el jugador existe
  const index = playersData.findIndex((player) => player.id === jugadorData.id)

  if (index === -1) {
    return Promise.resolve({
      success: false,
      message: "Jugador no encontrado",
    })
  }

  // Actualizar el jugador
  const updatedPlayer = {
    ...playersData[index],
    ...jugadorData,
  }

  playersData = [...playersData.slice(0, index), updatedPlayer, ...playersData.slice(index + 1)]

  console.log(`Jugador ${jugadorData.id} actualizado:`, updatedPlayer)
  return Promise.resolve({
    success: true,
    message: "Jugador actualizado correctamente",
    jugador: updatedPlayer,
  })
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
  return Promise.resolve({
    success: true,
    message: "Jugador añadido correctamente",
    jugador: playerToAdd,
  })
}

// Eliminar un jugador
export const deleteJugador = (id) => {
  // Verificar si el jugador existe
  const index = playersData.findIndex((player) => player.id === id)

  if (index === -1) {
    return Promise.resolve({
      success: false,
      message: "Jugador no encontrado",
    })
  }

  // Eliminar el jugador
  playersData = [...playersData.slice(0, index), ...playersData.slice(index + 1)]

  console.log(`Jugador ${id} eliminado`)
  return Promise.resolve({
    success: true,
    message: "Jugador eliminado correctamente",
  })
}

// Función para obtener jugadores con multas pendientes
export const getJugadoresConMultas = () => {
  return Promise.resolve(
    playersData
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
      .filter((jugador) => jugador.multasPendientes.length > 0),
  )
}

// Añadir una multa a un jugador
export const addMultaToJugador = (jugadorId, multa) => {
  // Verificar si el jugador existe
  const index = playersData.findIndex((player) => player.id === jugadorId)

  if (index === -1) {
    return Promise.resolve({
      success: false,
      message: "Jugador no encontrado",
    })
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
  return Promise.resolve({
    success: true,
    message: "Multa añadida correctamente",
    jugador: updatedPlayer,
  })
}

// Actualizar el estado de una multa (pagado o no)
export const updateMultaStatus = (jugadorId, multaId, isPaid) => {
  // Verificar si el jugador existe
  const playerIndex = playersData.findIndex((player) => player.id === jugadorId)

  if (playerIndex === -1) {
    return Promise.resolve({
      success: false,
      message: "Jugador no encontrado",
    })
  }

  const player = playersData[playerIndex]

  // Verificar si la multa existe
  if (!player.multas) {
    return Promise.resolve({
      success: false,
      message: "El jugador no tiene multas",
    })
  }

  const multaIndex = player.multas.findIndex((multa) => multa.id === multaId)

  if (multaIndex === -1) {
    return Promise.resolve({
      success: false,
      message: "Multa no encontrada",
    })
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
  return Promise.resolve({
    success: true,
    message: `Multa marcada como ${isPaid ? "pagada" : "no pagada"}`,
    jugador: updatedPlayer,
  })
}

// Actualizar una multa completa
export const updateMulta = (jugadorId, multaData) => {
  // Verificar si el jugador existe
  const playerIndex = playersData.findIndex((player) => player.id === jugadorId)

  if (playerIndex === -1) {
    return Promise.resolve({
      success: false,
      message: "Jugador no encontrado",
    })
  }

  const player = playersData[playerIndex]

  // Verificar si el jugador tiene multas
  if (!player.multas) {
    player.multas = []
  }

  // Verificar si la multa existe
  const multaIndex = player.multas.findIndex((multa) => multa.id === multaData.id)

  if (multaIndex === -1) {
    return Promise.resolve({
      success: false,
      message: "Multa no encontrada",
    })
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
  return Promise.resolve({
    success: true,
    message: "Multa actualizada correctamente",
    jugador: updatedPlayer,
  })
}

// Eliminar una multa
export const deleteMulta = (jugadorId, multaId) => {
  // Verificar si el jugador existe
  const playerIndex = playersData.findIndex((player) => player.id === jugadorId)

  if (playerIndex === -1) {
    return Promise.resolve({
      success: false,
      message: "Jugador no encontrado",
    })
  }

  const player = playersData[playerIndex]

  // Verificar si la multa existe
  if (!player.multas) {
    return Promise.resolve({
      success: false,
      message: "El jugador no tiene multas",
    })
  }

  const multaIndex = player.multas.findIndex((multa) => multa.id === multaId)

  if (multaIndex === -1) {
    return Promise.resolve({
      success: false,
      message: "Multa no encontrada",
    })
  }

  // Eliminar la multa
  const updatedMultas = [...player.multas.slice(0, multaIndex), ...player.multas.slice(multaIndex + 1)]

  const updatedPlayer = {
    ...player,
    multas: updatedMultas,
  }

  playersData = [...playersData.slice(0, playerIndex), updatedPlayer, ...playersData.slice(playerIndex + 1)]

  console.log(`Multa ${multaId} eliminada del jugador ${jugadorId}`)
  return Promise.resolve({
    success: true,
    message: "Multa eliminada correctamente",
    jugador: updatedPlayer,
  })
}