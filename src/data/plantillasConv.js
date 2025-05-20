// data/plantillasConv.js
// Archivo con las plantillas predefinidas para mensajes

const PLANTILLAS = [
  {
    id: "convocatoria",
    nombre: "Convocatoria partido",
    texto:
      "📆 {fecha}\n\n🏆 {tipoPartido}\n\n⚽ {hora} - {rival}\n\n📍 {lugar}\n\n⏰ Citación: {citacion}\n\n🚶🏻‍♀ Pantalón del chandal del club, polo del club, sudadera del club.\n\n🎒 En la mochila llevaremos las dos equipaciones, el peto y la botella de agua.\n\n🗒 AL FINALIZAR EL PARTIDO todos los jugadores irán al vestuario, se pondrán el chandal (o ropa de calle si lo prefieren), sin excepciones. Nadie se irá sin volver a ponerse la ropa de calle o el chandal, ni con las medias, botas o ropa de juego puestas.\n\nLa convocatoria no finaliza hasta que se cambian y se les autoriza a irse.\n\n*Jugadores convocados:*\n{jugadores}\n\n*Jugadores no convocados:*\n{jugadoresNo}",
  },
  {
    id: "multas",
    nombre: "Informe de multas",
    texto: "*MULTAS PENDIENTES A {fecha}*\n\n{jugadores}",
  },
]

export default PLANTILLAS