// src/services/partidosService.js

// Almacenamiento en memoria para simular una base de datos
let partidosDB = [
  {
    id: "1",
    jornada: "1",
    rival: "FC Barcelona",
    fecha: new Date(),
    lugar: "Casa",
    resultado: null,
    notasRival: "Equipo con buen juego de posesión. Debemos presionar alto y aprovechar las contras.",
    estrategia: "Jugar con línea defensiva alta y presionar la salida de balón. Aprovechar la velocidad en las bandas.",
    alineacion: null // Inicialmente sin alineación
  },
  {
    id: "2",
    jornada: "2",
    rival: "Real Madrid",
    fecha: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Una semana después
    lugar: "Fuera",
    lugarEspecifico: "Santiago Bernabéu",
    resultado: null,
    alineacion: null // Inicialmente sin alineación
  },
  {
    id: "3",
    jornada: "3",
    rival: "Atlético de Madrid",
    fecha: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Dos semanas después
    lugar: "Casa",
    resultado: null,
    alineacion: null // Inicialmente sin alineación
  }
];

// Simula una llamada a una API para crear un partido con un retraso
export const createPartidoWithDelay = (partidoData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generar un ID único
      const nuevoId = Date.now().toString();
      
      // Crear el nuevo partido con los datos proporcionados
      const nuevoPartido = {
        ...partidoData,
        id: nuevoId
      };
      
      // Asegurarse de que la alineación se guarda correctamente
      console.log("Guardando partido con alineación:", nuevoPartido.alineacion);
      
      // Añadir a la "base de datos"
      partidosDB.push(nuevoPartido);
      
      // Devolver el partido creado
      resolve(nuevoPartido);
    }, 500); // Retraso de 0.5 segundos
  });
};

// Simula una llamada a una API para obtener un partido por ID con un retraso
export const getPartidoByIdWithDelay = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Buscar el partido en la "base de datos"
      const partido = partidosDB.find(p => p.id === id);
      
      // Si no se encuentra, devolver un partido de ejemplo
      if (!partido) {
        console.warn(`Partido con ID ${id} no encontrado, devolviendo datos de ejemplo`);
        resolve({
          id: id,
          jornada: "1",
          rival: "Equipo Ejemplo",
          notasRival: "Notas del rival de ejemplo",
          estrategia: "Estrategia de ejemplo",
          fecha: new Date(),
          lugar: "Casa",
          lugarEspecifico: "",
          alineacion: null // No asignar alineación de ejemplo
        });
      } else {
        // Devolver el partido encontrado sin modificar su alineación
        console.log("Devolviendo partido con alineación:", partido.alineacion);
        resolve({...partido}); // Crear una copia para evitar referencias
      }
    }, 500); // Retraso de 0.5 segundos
  });
};

// Simula una llamada a una API para actualizar un partido con un retraso
export const updatePartidoWithDelay = (id, partidoData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Buscar el índice del partido en la "base de datos"
      const index = partidosDB.findIndex(p => p.id === id);
      
      if (index !== -1) {
        // Actualizar el partido
        partidosDB[index] = {
          ...partidoData,
          id: id // Asegurar que el ID no cambie
        };
        
        // Devolver el partido actualizado
        resolve(partidosDB[index]);
      } else {
        // Si no se encuentra, añadirlo como nuevo
        const nuevoPartido = {
          ...partidoData,
          id: id
        };
        partidosDB.push(nuevoPartido);
        resolve(nuevoPartido);
      }
    }, 500); // Retraso de 0.5 segundos
  });
};

// Simula una llamada a una API para eliminar un partido con un retraso
export const deletePartidoWithDelay = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Filtrar la "base de datos" para eliminar el partido
      partidosDB = partidosDB.filter(p => p.id !== id);
      
      // Devolver éxito
      resolve({ success: true });
    }, 500); // Retraso de 0.5 segundos
  });
};

// Simula una llamada a una API para obtener todos los partidos con un retraso
export const getAllPartidosWithDelay = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Devolver todos los partidos
      resolve(partidosDB);
    }, 500); // Retraso de 0.5 segundos
  });
};

// Alias para mantener compatibilidad con código existente
export const getPartidosWithDelay = getAllPartidosWithDelay;