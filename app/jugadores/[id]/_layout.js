// app/jugadores/[id]/layout.js
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PlayerContext } from '../../../context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function PlayerLayout() {
  const { playerData } = useLocalSearchParams();
  const player = JSON.parse(playerData || '{}'); // Parseamos los datos
  const router = useRouter();

  return (
    <PlayerContext.Provider value={player}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <View style={{ flex: 1, backgroundColor: '#121212' }}>
        {/* Header con diseño moderno */}
        <View style={styles.headerContainer}>
          {/* Fondo con gradiente sutil */}
          <LinearGradient
            colors={['#1a1a1a', '#121212']}
            style={styles.headerGradient}
          />
          
          {/* Elementos decorativos */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />
          
          {/* Contenido del header */}
          <View style={styles.headerContent}>
            {/* Contenedor de la imagen con efecto de brillo */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow} />
              <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: player.image}} 
                  style={styles.avatar} 
                />
              </View>
              {/* Número del jugador */}
              <View style={styles.playerNumber}>
                <Text style={styles.playerNumberText}>{player.number}</Text>
              </View>
            </View>
            
            {/* Información del jugador */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerPosition}>{player.position}</Text>
            </View>
          </View>
        </View>

        {/* Tabs sin cabecera */}
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#A463F2',
            tabBarInactiveTintColor: '#666',
            tabBarStyle: styles.tabBar,
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="datos"
            options={{
              title: 'Datos',
              tabBarIcon: ({ color }) => (
                <Ionicons name="person" size={24} color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="multas"
            options={{
              title: 'Multas',
              tabBarIcon: ({ color }) => (
                <FontAwesome6 name="coins" size={24} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="estadisticas"
            options={{
              title: 'Estadísticas',
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="file-table-box-multiple-outline" size={24} color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </PlayerContext.Provider>
  );
}

const styles = StyleSheet.create({
  // Estilos del contenedor principal del header
  headerContainer: {
    position: 'relative',
    paddingTop: 16,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  // Gradiente de fondo
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  // Elementos decorativos para dar profundidad
  decorativeCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#A463F220',
    top: -50,
    right: -30,
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0084FF20',
    bottom: -20,
    left: -30,
    opacity: 0.3,
  },
  // Contenido principal del header
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // Contenedor de la imagen con efecto de brillo
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#A463F2',
    opacity: 0.3,
    transform: [{ scale: 1.1 }],
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  // Número del jugador
  playerNumber: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#A463F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#121212',
  },
  playerNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Información del jugador
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  playerPosition: {
    color: '#aaa',
    fontSize: 14,
  },
  // Barra de pestañas
  tabBar: {
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    height: 60,
    paddingBottom: 8,
  },
});