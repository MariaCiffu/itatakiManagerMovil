// reducers/lineup-reducer.js
import { FORMATIONS, getPositionsForFormation } from "../constants/formations";

export const ACTIONS = {
  SET_FORMATION: 'SET_FORMATION',
  SET_PREVIOUS_FORMATION: 'SET_PREVIOUS_FORMATION',
  SET_LINEUP: 'SET_LINEUP',
  SET_SUBSTITUTES: 'SET_SUBSTITUTES',
  SET_SPECIAL_ROLES: 'SET_SPECIAL_ROLES',
  SET_TEMPORARY_PLAYERS: 'SET_TEMPORARY_PLAYERS',
  ADD_TEMPORARY_PLAYER: 'ADD_TEMPORARY_PLAYER',
  ASSIGN_PLAYER: 'ASSIGN_PLAYER',
  REMOVE_PLAYER: 'REMOVE_PLAYER',
  ADD_SUBSTITUTE: 'ADD_SUBSTITUTE',
  REMOVE_SUBSTITUTE: 'REMOVE_SUBSTITUTE',
  LOAD_INITIAL_DATA: 'LOAD_INITIAL_DATA',
  REASSIGN_PLAYERS: 'REASSIGN_PLAYERS',
};

export const initialState = {
  selectedFormation: FORMATIONS[0],
  previousFormation: null,
  lineup: {},
  substitutes: [],
  specialRoles: {
    captain: null,
    freeKicks: null,
    freeKicksNear: null,
    corners: null,
    penalties: null,
  },
  temporaryPlayers: [],
  initialDataLoaded: false
};

export function lineupReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_FORMATION:
      return { ...state, selectedFormation: action.payload };
    
    case ACTIONS.SET_PREVIOUS_FORMATION:
      return { ...state, previousFormation: action.payload };
    
    case ACTIONS.SET_LINEUP:
      return { ...state, lineup: action.payload };
    
    case ACTIONS.SET_SUBSTITUTES:
      return { ...state, substitutes: action.payload };
    
    case ACTIONS.SET_SPECIAL_ROLES:
      return { ...state, specialRoles: action.payload };
    
    case ACTIONS.SET_TEMPORARY_PLAYERS:
      return { ...state, temporaryPlayers: action.payload };
    
    case ACTIONS.ADD_TEMPORARY_PLAYER:
      return { 
        ...state, 
        temporaryPlayers: [...state.temporaryPlayers, action.payload] 
      };
    
    case ACTIONS.ASSIGN_PLAYER:
      const { position, player } = action.payload;
      const newLineup = { ...state.lineup };
      
      // Quitar el jugador de otra posición si ya está asignado
      Object.keys(newLineup).forEach((pos) => {
        if (newLineup[pos]?.id === player.id) {
          delete newLineup[pos];
        }
      });
      
      // Quitar de suplentes si está ahí
      const newSubstitutes = state.substitutes.filter(sub => sub.id !== player.id);
      
      newLineup[position] = player;
      
      return { 
        ...state, 
        lineup: newLineup, 
        substitutes: newSubstitutes 
      };
    
    case ACTIONS.REMOVE_PLAYER:
      const updatedLineup = { ...state.lineup };
      delete updatedLineup[action.payload];
      return { ...state, lineup: updatedLineup };
    
    case ACTIONS.ADD_SUBSTITUTE:
      // Verificar si el jugador ya está en la alineación o en suplentes
      const isInLineup = Object.values(state.lineup).some(p => p?.id === action.payload.id);
      const isInSubstitutes = state.substitutes.some(p => p.id === action.payload.id);
      
      if (!isInLineup && !isInSubstitutes) {
        return { 
          ...state, 
          substitutes: [...state.substitutes, action.payload] 
        };
      }
      return state;
    
    case ACTIONS.REMOVE_SUBSTITUTE:
      return { 
        ...state, 
        substitutes: state.substitutes.filter(sub => sub.id !== action.payload) 
      };
    
    case ACTIONS.LOAD_INITIAL_DATA:
      const { 
        formation, 
        lineup = {}, 
        substitutes = [], 
        specialRoles = {}, 
        temporaryPlayers = [] 
      } = action.payload;
      
      return {
        ...state,
        selectedFormation: formation,
        previousFormation: formation,
        lineup,
        substitutes,
        specialRoles,
        temporaryPlayers,
        initialDataLoaded: true
      };
    
    case ACTIONS.REASSIGN_PLAYERS:
      const { previousFormation, newFormation } = action.payload;
      
      // Si no hay jugadores en la alineación, no hay nada que hacer
      if (Object.keys(state.lineup).length === 0) return state;

      // Obtener las posiciones de ambas formaciones
      const posicionesAnteriores = getPositionsForFormation(previousFormation);
      const nuevasPosiciones = getPositionsForFormation(newFormation);

      // Crear una nueva alineación
      const nuevaLineup = {};

      // Mapeo de tipos de posiciones para intentar mantener jugadores en posiciones similares
      const mapeoTiposPosiciones = {
        // Portero
        GK: ["GK"],
        // Defensas
        DEF1: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
        DEF2: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
        DEF3: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
        DEF4: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
        DEF5: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
        // Centrocampistas
        MID1: ["MID1", "MID2", "MID3", "MID4", "MID5"],
        MID2: ["MID1", "MID2", "MID3", "MID4", "MID5"],
        MID3: ["MID1", "MID2", "MID3", "MID4", "MID5"],
        MID4: ["MID1", "MID2", "MID3", "MID4", "MID5"],
        MID5: ["MID1", "MID2", "MID3", "MID4", "MID5"],
        // Delanteros
        FWD1: ["FWD1", "FWD2", "FWD3"],
        FWD2: ["FWD1", "FWD2", "FWD3"],
        FWD3: ["FWD1", "FWD2", "FWD3"],
      };

      // Posiciones ya asignadas en la nueva formación
      const posicionesAsignadas = new Set();

      // Primero, intentar mantener jugadores en posiciones equivalentes
      Object.entries(state.lineup).forEach(([posicionAnterior, jugador]) => {
        // Intentar encontrar la misma posición en la nueva formación
        if (nuevasPosiciones[posicionAnterior] && !posicionesAsignadas.has(posicionAnterior)) {
          nuevaLineup[posicionAnterior] = jugador;
          posicionesAsignadas.add(posicionAnterior);
        } else {
          // Si no existe la misma posición, buscar una posición similar
          const tiposPosicionesSimilares = mapeoTiposPosiciones[posicionAnterior] || [];

          // Buscar una posición similar disponible
          const posicionSimilar = tiposPosicionesSimilares.find(
            (tipo) => nuevasPosiciones[tipo] && !posicionesAsignadas.has(tipo),
          );

          if (posicionSimilar) {
            nuevaLineup[posicionSimilar] = jugador;
            posicionesAsignadas.add(posicionSimilar);
          }
          // Si no se encuentra posición similar, el jugador no se asigna
        }
      });

      return { ...state, lineup: nuevaLineup };
      
    default:
      return state;
  }
}