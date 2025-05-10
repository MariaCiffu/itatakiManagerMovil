// src/services/partidosService.js
import { PARTIDOS } from "../data/partidosData";

// Usar los datos importados como base de datos inicial
let partidosDB = [...PARTIDOS]; // Crear una copia para no modificar el original

// Simula una llamada a una API para crear un partido con un retraso
export const createPartidoWithDelay = (partidoData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Datos que recibe:", partidoData);
      // Generar un ID único
      const nuevoId = Date.now().toString();
      
      // Crear el nuevo partido con los datos proporcionados
      const nuevoPartido = {
        ...partidoData,
        id: nuevoId
      };
      
      // Asegurarse de que la alineación se guarda correctamente
      console.log("Guardando partido con alineación:", nuevoPartido);
      
      // Añadir a la "base de datos"
      partidosDB.push(nuevoPartido);
      
      // Devolver el partido creado
      resolve(nuevoPartido);
    }, 500); // Retraso de 0.5 segundos
  });
};

// Simula una llamada a una API para obtener un partido por ID con un retraso
export const getPartidoByIdWithDelay = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Buscar el partido en la "base de datos"
      const partido = partidosDB.find(p => p.id === id);
      
      // Si no se encuentra, devolver un error
      if (!partido) {
        console.error(`Error: Partido con ID ${id} no encontrado`);
        reject({ error: `Partido con ID ${id} no encontrado`, status: 404 });
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
  return new Promise((resolve, reject) => {
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
        // Si no se encuentra, rechazar con error
        reject({ error: `Partido con ID ${id} no encontrado para actualizar`, status: 404 });
      }
    }, 500); // Retraso de 0.5 segundos
  });
};

// Simula una llamada a una API para eliminar un partido con un retraso
export const deletePartidoWithDelay = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Verificar si el partido existe
      const partidoExiste = partidosDB.some(p => p.id === id);
      
      if (!partidoExiste) {
        reject({ error: `Partido con ID ${id} no encontrado para eliminar`, status: 404 });
        return;
      }
      
      // Filtrar la "base de datos" para eliminar el partido
      partidosDB = partidosDB.filter(p => p.id !== id);
      
      // Devolver éxito
      resolve({ success: true, message: `Partido con ID ${id} eliminado correctamente` });
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