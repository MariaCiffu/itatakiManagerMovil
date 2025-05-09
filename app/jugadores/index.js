// app/jugadores/index.js
import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { COLORS } from '../../constants/colors';
import BackButton from '../../components/BackButton';

const initialPlayers = [
  { id: '1', name: 'Lionel Messi', number: 10, position: 'Delantero', image: 'https://i.pravatar.cc/150?img=1', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '2', name: 'Andrés Iniesta', number: 8, position: 'Mediocampista', image: 'https://i.pravatar.cc/150?img=2', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '3', name: 'Sergio Ramos', number: 4, position: 'Defensa', image: 'https://i.pravatar.cc/150?img=3', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '4', name: 'Manuel Neuer', number: 1, position: 'Portero', image: 'https://i.pravatar.cc/150?img=4', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
  { id: '5', name: 'Daniel San Juan', number: 9, position: 'Delantero', image: 'https://i.pravatar.cc/150?img=6', date: "18/05/2025", foot: "Derecho", phone: "123456789" },
];

export default function PlayersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState(initialPlayers);
  
  // Filtrar jugadores según la búsqueda
  const filteredPlayers = searchQuery 
    ? players.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.number.toString().includes(searchQuery)
      )
    : players;
  
  const renderItem = ({ item }) => (
    <Link 
      href={{
        pathname: `/jugadores/${item.id}`,
        params: { playerData: JSON.stringify(item) }
      }}
      asChild
    >
      <TouchableOpacity style={styles.card}>
        <LinearGradient
          colors={[COLORS.card, '#252525']}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Image source={{ uri: item.image }} style={styles.avatar} />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>{item.position}</Text>
            </View>
            <View style={[styles.numberContainer, { backgroundColor: COLORS.primary }]}>
              <Text style={styles.number}>{item.number}</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Jugadores</Text>
        <View style={styles.placeholder} />
      </View>
      
      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={16} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar jugador..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearButton}>×</Text>
          </TouchableOpacity>
        ) : null}
      </View>
  
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No se encontraron jugadores</Text>
          </View>
        }
      />

      {/* Botón flotante para añadir nuevo jugador */}
      <TouchableOpacity 
        style={styles.addButton} 
        activeOpacity={0.8} 
        onPress={() => router.push('/jugadores/add-player')}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.addButtonGradient}
        >
          <FontAwesome5 name="user-plus" size={20} color="#FFF" solid />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: COLORS.text,
    marginLeft: 8,
    fontSize: 16,
  },
  clearButton: {
    color: COLORS.textSecondary,
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  listContent: {
    paddingBottom: 80, // Espacio para el botón flotante
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
  },
  cardContent: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
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
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detail: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});