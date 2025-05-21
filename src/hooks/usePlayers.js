// hooks/use-players.js
import { useMemo } from 'react';
import { PLAYERS } from "../data/teamData";

export function usePlayers(lineup, substitutes, temporaryPlayers) {
  // Jugadores disponibles
  const availablePlayers = useMemo(() => {
    const selectedPlayerIds = [
      ...Object.values(lineup).map((player) => player?.id),
      ...substitutes.map((player) => player.id),
    ].filter((id) => id !== undefined);

    // Combinar jugadores regulares y temporales
    const allPlayers = [...PLAYERS, ...temporaryPlayers];
    
    return allPlayers.filter((player) => !selectedPlayerIds.includes(player.id));
  }, [lineup, substitutes, temporaryPlayers]);

  // Jugadores titulares
  const startingPlayers = useMemo(() => {
    return Object.entries(lineup).map(([position, player]) => ({
      ...player,
      position
    })).filter(player => player.id);
  }, [lineup]);

  return {
    availablePlayers,
    startingPlayers,
    substitutes,
    temporaryPlayers,
    allPlayers: [...PLAYERS, ...temporaryPlayers]
  };
}