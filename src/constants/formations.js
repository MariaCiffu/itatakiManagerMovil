// Formaciones disponibles
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
]

// Posiciones de los jugadores según la formación
export const getPositionsForFormation = (formation) => {
  switch (formation.id) {
    case "442":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "20%" },
        DEF2: { top: "70%", left: "40%" },
        DEF3: { top: "70%", left: "60%" },
        DEF4: { top: "70%", left: "80%" },
        MID1: { top: "50%", left: "20%" },
        MID2: { top: "50%", left: "40%" },
        MID3: { top: "50%", left: "60%" },
        MID4: { top: "50%", left: "80%" },
        FWD1: { top: "30%", left: "35%" },
        FWD2: { top: "30%", left: "65%" },
      }
    case "433":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "20%" },
        DEF2: { top: "70%", left: "40%" },
        DEF3: { top: "70%", left: "60%" },
        DEF4: { top: "70%", left: "80%" },
        MID1: { top: "50%", left: "30%" },
        MID2: { top: "50%", left: "50%" },
        MID3: { top: "50%", left: "70%" },
        FWD1: { top: "30%", left: "25%" },
        FWD2: { top: "25%", left: "50%" },
        FWD3: { top: "30%", left: "75%" },
      }
    case "352":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "30%" },
        DEF2: { top: "75%", left: "50%" },
        DEF3: { top: "70%", left: "70%" },
        MID1: { top: "55%", left: "15%" },
        MID2: { top: "50%", left: "30%" },
        MID3: { top: "45%", left: "50%" },
        MID4: { top: "50%", left: "70%" },
        MID5: { top: "55%", left: "85%" },
        FWD1: { top: "30%", left: "35%" },
        FWD2: { top: "30%", left: "65%" },
      }
    case "532":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "15%" },
        DEF2: { top: "75%", left: "30%" },
        DEF3: { top: "78%", left: "50%" },
        DEF4: { top: "75%", left: "70%" },
        DEF5: { top: "70%", left: "85%" },
        MID1: { top: "50%", left: "30%" },
        MID2: { top: "45%", left: "50%" },
        MID3: { top: "50%", left: "70%" },
        FWD1: { top: "30%", left: "35%" },
        FWD2: { top: "30%", left: "65%" },
      }
    case "343":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "30%" },
        DEF2: { top: "75%", left: "50%" },
        DEF3: { top: "70%", left: "70%" },
        MID1: { top: "50%", left: "20%" },
        MID2: { top: "50%", left: "40%" },
        MID3: { top: "50%", left: "60%" },
        MID4: { top: "50%", left: "80%" },
        FWD1: { top: "30%", left: "25%" },
        FWD2: { top: "25%", left: "50%" },
        FWD3: { top: "30%", left: "75%" },
      }
    case "451":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "20%" },
        DEF2: { top: "70%", left: "40%" },
        DEF3: { top: "70%", left: "60%" },
        DEF4: { top: "70%", left: "80%" },
        MID1: { top: "55%", left: "15%" },
        MID2: { top: "50%", left: "30%" },
        MID3: { top: "45%", left: "50%" },
        MID4: { top: "50%", left: "70%" },
        MID5: { top: "55%", left: "85%" },
        FWD1: { top: "25%", left: "50%" },
      }
    case "4231":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "20%" },
        DEF2: { top: "70%", left: "40%" },
        DEF3: { top: "70%", left: "60%" },
        DEF4: { top: "70%", left: "80%" },
        MID1: { top: "55%", left: "35%" },
        MID2: { top: "55%", left: "65%" },
        MID3: { top: "35%", left: "25%" },
        MID4: { top: "30%", left: "50%" },
        MID5: { top: "35%", left: "75%" },
        FWD1: { top: "20%", left: "50%" },
      }
    case "4141":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "20%" },
        DEF2: { top: "70%", left: "40%" },
        DEF3: { top: "70%", left: "60%" },
        DEF4: { top: "70%", left: "80%" },
        MID1: { top: "55%", left: "50%" },
        MID2: { top: "40%", left: "20%" },
        MID3: { top: "40%", left: "40%" },
        MID4: { top: "40%", left: "60%" },
        MID5: { top: "40%", left: "80%" },
        FWD1: { top: "25%", left: "50%" },
      }
    case "541":
      return {
        GK: { top: "85%", left: "50%" },
        DEF1: { top: "70%", left: "15%" },
        DEF2: { top: "70%", left: "30%" },
        DEF3: { top: "75%", left: "50%" },
        DEF4: { top: "70%", left: "70%" },
        DEF5: { top: "70%", left: "85%" },
        MID1: { top: "50%", left: "20%" },
        MID2: { top: "45%", left: "40%" },
        MID3: { top: "45%", left: "60%" },
        MID4: { top: "50%", left: "80%" },
        FWD1: { top: "25%", left: "50%" },
      }
    default:
      return {}
  }
}