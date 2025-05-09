// data/teamData.js
// Datos de ejemplo para jugadores
export const PLAYERS = [
  {
    id: '1',
    name: 'Juan Pérez',
    number: 10,
    position: 'Delantero',
    image: 'https://via.placeholder.com/150',
    phone: '600123456',
    email: 'juan@example.com',
    birthdate: '15/05/1995',
    height: '180 cm',
    weight: '75 kg',
    foot: 'Derecho',
    multas: [
      { id: '1', reason: 'Tarjeta amarilla', amount: 5, date: '10/04/2023', paid: false },
      { id: '2', reason: 'Retraso entrenamiento', amount: 10, date: '15/03/2023', paid: true },
    ]
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    number: 7,
    position: 'Centrocampista',
    image: 'https://via.placeholder.com/150',
    phone: '600789012',
    email: 'carlos@example.com',
    birthdate: '22/07/1997',
    foot: 'Izquierdo',
    multas: [
      { id: '3', reason: 'Falta a entrenamiento', amount: 20, date: '05/04/2023', paid: false },
    ]
  },
  {
    id: '3',
    name: 'Miguel González',
    number: 1,
    position: 'Portero',
    image: 'https://via.placeholder.com/150',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    height: '190 cm',
    weight: '85 kg',
    foot: 'Derecho',
    multas: []
  },
];

// Datos de ejemplo para staff
export const STAFF = [
  {
    id: '1',
    name: 'Antonio López',
    rol: 'Entrenador',
    image: 'https://via.placeholder.com/150',
    phone: '600111222',
    email: 'antonio@example.com',
  },
  {
    id: '2',
    name: 'Laura Martínez',
    position: 'Fisioterapeuta',
    image: 'https://via.placeholder.com/150',
    phone: '600333444',
    email: 'laura@example.com',
  },
];

// Función para obtener jugadores con multas pendientes
export const getJugadoresConMultas = () => {
  return PLAYERS.map(jugador => {
    // Filtrar multas no pagadas
    const multasPendientes = jugador.multas ? jugador.multas.filter(multa => !multa.paid) : [];
    
    // Calcular total pendiente
    const totalPendiente = multasPendientes.reduce((total, multa) => total + multa.amount, 0);
    
    return {
      id: jugador.id,
      name: jugador.name,
      phone: jugador.phone,
      multasPendientes,
      totalPendiente
    };
  }).filter(jugador => jugador.multasPendientes.length > 0);
};