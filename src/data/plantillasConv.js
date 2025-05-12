// data/plantillas.js
// Archivo con las plantillas predefinidas para mensajes

const PLANTILLAS = [
  {
    id: "convocatoria",
    nombre: "Convocatoria partido",
    texto:
      "📆 {fecha}\n⏰ Hora: {hora}\n📍 Lugar: {lugar}\n🆚 Rival: {rival}\n\n*Jugadores convocados:*\n{jugadores}\n\nSe ruega puntualidad. Traer DNI y equipación completa.",
  },
  {
    id: "entrenamiento",
    nombre: "Aviso entrenamiento",
    texto:
      "🔵🔴 *ENTRENAMIENTO FC BARCELONA* 🔵🔴\n\n📅 Fecha: {fecha}\n⏰ Hora: {hora}\n📍 Lugar: {lugar}\n\n*Jugadores convocados:*\n{jugadores}\n\nSe ruega puntualidad. Traer equipación de entrenamiento.",
  },
  {
    id: "multas",
    nombre: "Informe de multas",
    texto:
      "*MULTAS PENDIENTES A {fecha}*\n\n{jugadores}",
  },
]

export default PLANTILLAS
