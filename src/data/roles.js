// constants/roles.js
export const availableRoles = [
  {
    id: "captain",
    name: "Capitán",
    type: "letter",
    letter: "C",
    letterColor: "#000000",
    backgroundColor: "#FFC107", // Amarillo/Dorado
  },
  {
    id: "freeKicks",
    name: "Faltas lejanas",
    type: "letter",
    letter: "F",
    letterColor: "#FFFFFF",
    backgroundColor: "#FF5722", // Naranja/Rojo
  },
  {
    id: "freeKicksNear",
    name: "Faltas cercanas",
    type: "letter",
    letter: "f", // Añadida esta propiedad
    letterColor: "#000000",
    backgroundColor: "#FF9800", // Naranja
  },
  {
    id: "corners",
    name: "Córners",
    type: "icon",
    icon: "flag-outline",
    iconColor: "#FFFFFF",
    backgroundColor: "#2196F3", // Azul
  },
  {
    id: "penalties",
    name: "Penaltis",
    type: "letter",
    letter: "P", // Añadida esta propiedad
    letterColor: "#FFFFFF",
    backgroundColor: "#E91E63", // Rosa/Fucsia
  },
];