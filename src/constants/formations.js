// Formaciones con posiciones más realistas y proporcionales
export const FORMATIONS = [
  { id: "442", name: "4-4-2" },
  { id: "433", name: "4-3-3" },
  { id: "352", name: "3-5-2" },
  { id: "532", name: "5-3-2" },
  { id: "343", name: "3-4-3" },
  { id: "451", name: "4-5-1" },
  { id: "4231", name: "4-2-3-1" },
  { id: "4141", name: "4-1-4-1" },
  { id: "541", name: "5-4-1" },
];

// Posiciones mejoradas con mejor distribución y realismo táctico
export const getPositionsForFormation = (formation) => {
  switch (formation.id) {
    case "442":
      return {
        GK: { top: "88%", left: "50%" },
        // Línea defensiva más compacta
        DEF1: { top: "72%", left: "25%" }, // Lateral izquierdo
        DEF2: { top: "75%", left: "42%" }, // Central izquierdo
        DEF3: { top: "75%", left: "58%" }, // Central derecho
        DEF4: { top: "72%", left: "75%" }, // Lateral derecho
        // Línea de medios equilibrada
        MID1: { top: "52%", left: "25%" }, // Medio izquierdo
        MID2: { top: "55%", left: "42%" }, // Medio centro izq
        MID3: { top: "55%", left: "58%" }, // Medio centro der
        MID4: { top: "52%", left: "75%" }, // Medio derecho
        // Delanteros
        FWD1: { top: "28%", left: "38%" }, // Delantero izquierdo
        FWD2: { top: "28%", left: "62%" }, // Delantero derecho
      };

    case "433":
      return {
        GK: { top: "88%", left: "50%" },
        // Línea defensiva
        DEF1: { top: "72%", left: "25%" },
        DEF2: { top: "75%", left: "42%" },
        DEF3: { top: "75%", left: "58%" },
        DEF4: { top: "72%", left: "75%" },
        // Triángulo de medios
        MID1: { top: "58%", left: "35%" }, // Medio izquierdo
        MID2: { top: "62%", left: "50%" }, // Medio centro (pivote)
        MID3: { top: "58%", left: "65%" }, // Medio derecho
        // Tridente de ataque
        FWD1: { top: "32%", left: "20%" }, // Extremo izquierdo
        FWD2: { top: "25%", left: "50%" }, // Delantero centro
        FWD3: { top: "32%", left: "80%" }, // Extremo derecho
      };

    case "352":
      return {
        GK: { top: "88%", left: "50%" },
        // Tres centrales
        DEF1: { top: "72%", left: "30%" }, // Central izquierdo
        DEF2: { top: "75%", left: "50%" }, // Líbero/Central
        DEF3: { top: "72%", left: "70%" }, // Central derecho
        // Cinco medios
        MID1: { top: "55%", left: "15%" }, // Carrilero izquierdo
        MID2: { top: "62%", left: "35%" }, // Medio izquierdo
        MID3: { top: "65%", left: "50%" }, // Mediocentro
        MID4: { top: "62%", left: "65%" }, // Medio derecho
        MID5: { top: "55%", left: "85%" }, // Carrilero derecho
        // Dos delanteros
        FWD1: { top: "28%", left: "38%" },
        FWD2: { top: "28%", left: "62%" },
      };

    case "532":
      return {
        GK: { top: "88%", left: "50%" },
        // Cinco defensas
        DEF1: { top: "70%", left: "15%" }, // Lateral izquierdo
        DEF2: { top: "75%", left: "32%" }, // Central izquierdo
        DEF3: { top: "78%", left: "50%" }, // Central (líbero)
        DEF4: { top: "75%", left: "68%" }, // Central derecho
        DEF5: { top: "70%", left: "85%" }, // Lateral derecho
        // Tres medios
        MID1: { top: "52%", left: "32%" }, // Medio izquierdo
        MID2: { top: "55%", left: "50%" }, // Mediocentro
        MID3: { top: "52%", left: "68%" }, // Medio derecho
        // Dos delanteros
        FWD1: { top: "28%", left: "38%" },
        FWD2: { top: "28%", left: "62%" },
      };

    case "343":
      return {
        GK: { top: "88%", left: "50%" },
        // Tres centrales
        DEF1: { top: "72%", left: "30%" },
        DEF2: { top: "75%", left: "50%" },
        DEF3: { top: "72%", left: "70%" },
        // Cuatro medios
        MID1: { top: "52%", left: "20%" }, // Carrilero izquierdo
        MID2: { top: "58%", left: "40%" }, // Medio centro izq
        MID3: { top: "58%", left: "60%" }, // Medio centro der
        MID4: { top: "52%", left: "80%" }, // Carrilero derecho
        // Tres delanteros
        FWD1: { top: "32%", left: "25%" }, // Extremo izquierdo
        FWD2: { top: "25%", left: "50%" }, // Delantero centro
        FWD3: { top: "32%", left: "75%" }, // Extremo derecho
      };

    case "451":
      return {
        GK: { top: "88%", left: "50%" },
        // Cuatro defensas
        DEF1: { top: "72%", left: "25%" },
        DEF2: { top: "75%", left: "42%" },
        DEF3: { top: "75%", left: "58%" },
        DEF4: { top: "72%", left: "75%" },
        // Cinco medios
        MID1: { top: "52%", left: "18%" }, // Carrilero izquierdo
        MID2: { top: "60%", left: "35%" }, // Medio izquierdo
        MID3: { top: "62%", left: "50%" }, // Pivote
        MID4: { top: "60%", left: "65%" }, // Medio derecho
        MID5: { top: "52%", left: "82%" }, // Carrilero derecho
        // Un delantero
        FWD1: { top: "25%", left: "50%" },
      };

    case "4231":
      return {
        GK: { top: "88%", left: "50%" },
        // Cuatro defensas
        DEF1: { top: "72%", left: "25%" },
        DEF2: { top: "75%", left: "42%" },
        DEF3: { top: "75%", left: "58%" },
        DEF4: { top: "72%", left: "75%" },
        // Dos pivotes
        MID1: { top: "58%", left: "40%" }, // Pivote izquierdo
        MID2: { top: "58%", left: "60%" }, // Pivote derecho
        // Tres mediapuntas
        MID3: { top: "42%", left: "25%" }, // Mediapunta izquierda
        MID4: { top: "38%", left: "50%" }, // Enganche
        MID5: { top: "42%", left: "75%" }, // Mediapunta derecha
        // Un delantero
        FWD1: { top: "22%", left: "50%" },
      };

    case "4141":
      return {
        GK: { top: "88%", left: "50%" },
        // Cuatro defensas
        DEF1: { top: "72%", left: "25%" },
        DEF2: { top: "75%", left: "42%" },
        DEF3: { top: "75%", left: "58%" },
        DEF4: { top: "72%", left: "75%" },
        // Un pivote defensivo
        MID1: { top: "62%", left: "50%" },
        // Cuatro mediocampistas
        MID2: { top: "45%", left: "25%" }, // Medio izquierdo
        MID3: { top: "48%", left: "40%" }, // Medio centro izq
        MID4: { top: "48%", left: "60%" }, // Medio centro der
        MID5: { top: "45%", left: "75%" }, // Medio derecho
        // Un delantero
        FWD1: { top: "25%", left: "50%" },
      };

    case "541":
      return {
        GK: { top: "88%", left: "50%" },
        // Cinco defensas
        DEF1: { top: "70%", left: "18%" },
        DEF2: { top: "75%", left: "35%" },
        DEF3: { top: "78%", left: "50%" },
        DEF4: { top: "75%", left: "65%" },
        DEF5: { top: "70%", left: "82%" },
        // Cuatro medios
        MID1: { top: "52%", left: "25%" }, // Medio izquierdo
        MID2: { top: "55%", left: "42%" }, // Medio centro izq
        MID3: { top: "55%", left: "58%" }, // Medio centro der
        MID4: { top: "52%", left: "75%" }, // Medio derecho
        // Un delantero
        FWD1: { top: "25%", left: "50%" },
      };

    default:
      return {};
  }
};

// Función helper para obtener información táctica de cada formación
export const getFormationInfo = (formationId) => {
  const tacticalInfo = {
    442: {
      description: "Formación clásica equilibrada",
      strengths: ["Equilibrio", "Simplicidad", "Pressing"],
      weaknesses: ["Mediocampo numérico", "Laterales expuestos"],
    },
    433: {
      description: "Formación ofensiva con control",
      strengths: ["Control mediocampo", "Amplitud", "Pressing alto"],
      weaknesses: ["Vulnerabilidad contraataques", "Exigencia física"],
    },
    352: {
      description: "Formación híbrida ofensiva",
      strengths: ["Superioridad numérica mediocampo", "Carrileros"],
      weaknesses: ["Espacios en banda", "Coordinación defensiva"],
    },
    // ... más información táctica
  };

  return tacticalInfo[formationId] || null;
};

// Constantes adicionales para mejor UX
export const FORMATION_CATEGORIES = {
  DEFENSIVE: ["532", "541"],
  BALANCED: ["442", "352", "4141"],
  OFFENSIVE: ["433", "343", "4231", "451"],
};

export const POSITION_ROLES = {
  GK: "Portero",
  DEF: "Defensa",
  MID: "Mediocampista",
  FWD: "Delantero",
};
