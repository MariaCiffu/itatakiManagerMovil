import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

const players = [
  { id: '1', name: 'Lionel Messi', number: 10, position: 'Delantero', image: 'https://i.pravatar.cc/150?img=1', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '2', name: 'Andrés Iniesta', number: 8, position: 'Mediocampista', image: 'https://i.pravatar.cc/150?img=2', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '3', name: 'Andrés Iniesta', number: 8, position: 'Mediocampista', image: 'https://i.pravatar.cc/150?img=3', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '4', name: 'Andrés Iniesta', number: 8, position: 'Mediocampista', image: 'https://i.pravatar.cc/150?img=4', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '5', name: 'Daniel San Juan', number: 8, position: 'Delantero', image: 'https://i.pravatar.cc/150?img=6', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
];

export default function PlayersScreen() {
  const renderItem = ({ item }) => (
    <Link 
      href={{
        pathname: `/jugadores/${item.id}`,
        params: { playerData: JSON.stringify(item) }
      }} // 👈 Ruta dinámica con ID
      asChild // Permite usar estilos personalizados
    >
      <TouchableOpacity style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.detail}>{item.position}</Text>
        </View>
        <Text style={styles.number}>#{item.number}</Text>
      </TouchableOpacity>
    </Link>
  );
  

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Jugadores</Text>
        <TouchableOpacity onPress={() => alert('Añadir jugador')}>
          <Ionicons name="add-circle" size={40} color="white" />
        </TouchableOpacity>
      </View>
  
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
    backgroundColor: '#121212',
    padding: 16, 
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    marginBottom: 12,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between', // 👈 clave para separar izquierda y derecha
  },

  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },  
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  number: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detail: {
    color: '#aaa',
    fontSize: 14,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

});
