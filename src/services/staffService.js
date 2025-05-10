import { STAFF } from "../data/staffData";

// Variable para mantener una copia local de los datos
let staffData = [...STAFF];

// Obtener todos los miembros del staff
export const getAllStaff = () => {
  return Promise.resolve(staffData);
};

// Obtener un miembro del staff por ID
export const getStaffById = (id) => {
  const staffMember = staffData.find(member => member.id === id);
  return Promise.resolve(staffMember || null);
};

// Buscar miembros del staff por nombre o posición
export const searchStaff = (query) => {
  if (!query) return Promise.resolve(staffData);
  
  const lowercaseQuery = query.toLowerCase();
  const filteredStaff = staffData.filter(
    member => 
      member.name.toLowerCase().includes(lowercaseQuery) || 
      member.position.toLowerCase().includes(lowercaseQuery)
  );
  
  return Promise.resolve(filteredStaff);
};

// Añadir un nuevo miembro al staff
export const addStaffMember = (newMember) => {
  // Generar un ID único si no se proporciona uno
  const memberToAdd = {
    ...newMember,
    id: newMember.id || String(Date.now())
  };
  
  // Añadir a la lista local
  staffData = [...staffData, memberToAdd];
  
  console.log("Miembro añadido:", memberToAdd);
  return Promise.resolve({ 
    success: true, 
    message: "Miembro añadido correctamente",
    member: memberToAdd
  });
};

// Actualizar un miembro del staff
export const updateStaffMember = (id, updatedData) => {
  // Verificar si el miembro existe
  const index = staffData.findIndex(member => member.id === id);
  
  if (index === -1) {
    return Promise.resolve({ 
      success: false, 
      message: "Miembro no encontrado" 
    });
  }
  
  // Actualizar el miembro
  const updatedMember = {
    ...staffData[index],
    ...updatedData
  };
  
  staffData = [
    ...staffData.slice(0, index),
    updatedMember,
    ...staffData.slice(index + 1)
  ];
  
  console.log(`Miembro ${id} actualizado:`, updatedMember);
  return Promise.resolve({ 
    success: true, 
    message: "Miembro actualizado correctamente",
    member: updatedMember
  });
};

// Eliminar un miembro del staff
export const deleteStaffMember = (id) => {
  // Verificar si el miembro existe
  const index = staffData.findIndex(member => member.id === id);
  
  if (index === -1) {
    return Promise.resolve({ 
      success: false, 
      message: "Miembro no encontrado" 
    });
  }
  
  // Eliminar el miembro
  staffData = [
    ...staffData.slice(0, index),
    ...staffData.slice(index + 1)
  ];
  
  console.log(`Miembro ${id} eliminado`);
  return Promise.resolve({ 
    success: true, 
    message: "Miembro eliminado correctamente" 
  });
};