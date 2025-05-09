// src/data/partidos.js
export const PARTIDOS_INICIALES = [
  {
    id: "1",
    jornada: "1",
    rival: "FC Barcelona",
    fecha: "2023-09-10T18:00:00.000Z",
    lugar: "Casa",
    notas: "Equipo con buen juego de posesión. Debemos presionar alto y aprovechar las contras.",
    alineacion: {
      formation: { id: "433", name: "4-3-3" },
      lineup: {
        GK: { id: "9", name: "Manuel Neuer", number: 1, position: "Portero" },
        DEF1: { id: "6", name: "Virgil van Dijk", number: 4, position: "Defensa" },
        DEF2: { id: "7", name: "Sergio Ramos", number: 4, position: "Defensa" },
        DEF3: { id: "12", name: "Trent Alexander-Arnold", number: 66, position: "Defensa" },
        DEF4: { id: "6", name: "Virgil van Dijk", number: 4, position: "Defensa" },
        MID1: { id: "5", name: "Kevin De Bruyne", number: 17, position: "Centrocampista" },
        MID2: { id: "11", name: "Joshua Kimmich", number: 6, position: "Centrocampista" },
        MID3: { id: "17", name: "Pedri", number: 8, position: "Centrocampista" },
        FWD1: { id: "1", name: "Lionel Messi", number: 10, position: "Delantero" },
        FWD2: { id: "8", name: "Robert Lewandowski", number: 9, position: "Delantero" },
        FWD3: { id: "15", name: "Mohamed Salah", number: 11, position: "Delantero" }
      },
      substitutes: [
        { id: "2", name: "Cristiano Ronaldo", number: 7, position: "Delantero" },
        { id: "3", name: "Neymar Jr", number: 10, position: "Delantero" },
        { id: "10", name: "Jan Oblak", number: 1, position: "Portero" },
        { id: "18", name: "Gavi", number: 30, position: "Centrocampista" },
        { id: "19", name: "Vinicius Jr", number: 20, position: "Delantero" }
      ],
      specialRoles: {
        captain: "1",
        freeKicks: "1",
        corners: "15",
        penalties: "8"
      }
    }
  },
  {
    id: "2",
    jornada: "2",
    rival: "Real Madrid",
    fecha: "2023-09-17T20:00:00.000Z",
    lugar: "Fuera",
    notas: "Cuidado con las transiciones rápidas y las bandas.",
    alineacion: null
  }
];