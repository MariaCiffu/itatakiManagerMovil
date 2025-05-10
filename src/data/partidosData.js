// src/data/partidos.js
export const PARTIDOS_INICIALES = [
  {
    id: "1",
    jornada: "1",
    rival: "FC Barcelona",
    fecha: "2023-09-10T18:00:00.000Z",
    lugar: "Casa",
    notas:
      "Equipo con buen juego de posesión. Debemos presionar alto y aprovechar las contras.",
    alineacion: {
      formacion: "4-3-3", // Solo el nombre de la formación
      titulares: [
        { id: "1", fieldPosition: "GK" },
        { id: "2", fieldPosition: "DEF1" },
        { id: "3", fieldPosition: "DEF2" },
        { id: "4", fieldPosition: "DEF3" },
        { id: "5", fieldPosition: "DEF4" },
        { id: "6", fieldPosition: "MID1" },
        { id: "7", fieldPosition: "MID2" },
        { id: "8", fieldPosition: "MID3" },
        { id: "9", fieldPosition: "FWD1" },
        { id: "10", fieldPosition: "FWD2" },
        { id: "11", fieldPosition: "FWD3" },
      ],
      suplentes: ["12"], // Solo IDs de suplentes
      specialRoles: {
        captain: "1",
        freeKicks: "2",
        corners: "3",
        penalties: "4",
      },
    },
  },
  {
    id: "2",
    jornada: "2",
    rival: "Real Madrid",
    fecha: "2023-09-17T20:00:00.000Z",
    lugar: "Fuera",
    notas: "Cuidado con las transiciones rápidas y las bandas.",
    alineacion: null,
  },
  {
    alineacion: {
      formacion: "4-4-2",
      specialRoles: {
        captain: null,
        corners: null,
        freeKicks: null,
        penalties: null,
      },
      suplentes: ["5"],
      titulares: [],
    },
    estrategia: "",
    fecha: "2025-05-10T19:17:30.368Z",
    id: "3",
    jornada: "5",
    lugar: "Casa",
    lugarEspecifico: "",
    notasRival: "",
    rival: "USUFRUCTO",
  },
];
