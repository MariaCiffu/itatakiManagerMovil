// data/teamData.js
export const PLAYERS = [
  {
    id: '1',
    name: 'Juan Pérez',
    number: 10,
    position: 'Delantero',
    image: 'https://i.pravatar.cc/150?img=1',
    phone: '600123456',
    email: 'juan@example.com',
    birthdate: '15/05/1995',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: [
      { id: '1', reason: 'Tarjeta amarilla', amount: 5, date: '10/04/2023', paid: false },
      { id: '2', reason: 'Retraso entrenamiento', amount: 10, date: '15/03/2023', paid: true },
      { id: '4', reason: 'Tarjeta amarilla', amount: 5, date: '10/04/2023', paid: false},
    ]
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    number: 7,
    position: 'Centrocampista',
    image: 'https://i.pravatar.cc/150?img=2',
    phone: '600789012',
    email: 'carlos@example.com',
    birthdate: '22/07/1997',
    foot: 'Izquierdo',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: [
      { id: '3', reason: 'Falta a entrenamiento', amount: 20, date: '05/04/2023', paid: false },
    ]
  },
  {
    id: '3',
    name: 'Miguel González',
    number: 1,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
  {
    id: '4',
    name: 'Mandarino Arranz',
    number: 15,
    position: 'Delantero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
  {
    id: '5',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
    {
    id: '6',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
    {
    id: '7',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
    {
    id: '8',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
    {
    id: '9',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
    {
    id: '10',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
    {
    id: '11',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
  },
   {
    id: '12',
    name: 'Fante Alicante',
    number: 5,
    position: 'Portero',
    image: 'https://i.pravatar.cc/150?img=3',
    phone: '600345678',
    email: 'miguel@example.com',
    birthdate: '10/12/1990',
    foot: 'Derecho',
    emergencyContact: "Madre/Padre",
    emergencyPhone: "123456789",
    multas: []
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