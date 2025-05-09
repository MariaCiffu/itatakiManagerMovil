// src/services/jugadoresService.js
import { PLAYERS } from "../data/teamData";

// Obtener todos los jugadores
export const getAllJugadores = () => {
  return Promise.resolve(PLAYERS);
};

// Obtener un jugador por ID
export const getJugadorById = (id) => {
  const jugador = PLAYERS.find(player => player.id === id);
  return Promise.resolve(jugador || null);
};

// Obtener el nombre de un jugador por ID
export const getJugadorNameById = (id) => {
  const jugador = PLAYERS.find(player => player.id === id);
  return Promise.resolve(jugador ? jugador.name : "No asignado");
};