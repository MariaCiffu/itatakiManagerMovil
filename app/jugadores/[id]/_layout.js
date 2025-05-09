// app/jugadores/[id]/layout.js
import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Tabs, useLocalSearchParams, useRouter } from 'expo-router';
import { PlayerContext } from '../../../context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChartIcon, CoinsIcon, PersonIcon, EditIcon, ArrowLeftIcon } from '../../../components/Icons';
import { COLORS } from '../../../constants/colors';
import BackButton from '../../../components/BackButton';

export default function PlayerLayout() {
  const { playerData } = useLocalSearchParams();
  const player = JSON.parse(playerData || '{}');
  const router = useRouter();

  const handleEdit = () => {
    // Navegar a la pantalla de edición con los datos del jugador
    router.push({
      pathname: '/jugadores/edit-player',
      params: { playerData: JSON.stringify(player) }
    });
  };

  return (
    <PlayerContext.Provider value={player}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        
        {/* Header con diseño moderno */}
        <View style={styles.headerContainer}>
        
          {/* Fondo con gradiente sutil */}
          <LinearGradient
            colors={['#1a1a1a', COLORS.background]}
            style={styles.headerGradient}
          />
          
          {/* Elementos decorativos */}
          <View style={[styles.decorativeCircle1, { backgroundColor: `${COLORS.primary}20` }]} />
          <View style={[styles.decorativeCircle2, { backgroundColor: `${COLORS.info}20` }]} />


{/* Botón de retroceso integrado */}
<TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeftIcon size={24} color="#fff" />
          </TouchableOpacity>

          {/* Contenido del header */}
          <View style={styles.headerContent}>
            {/* Contenedor de la imagen con efecto de brillo */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarGlow, { backgroundColor: COLORS.primary }]} />
              <View style={styles.avatarWrapper}>
                <Image 
                  source={{ uri: player.image}} 
                  style={styles.avatar} 
                />
              </View>
              {/* Número del jugador */}
              <View style={[styles.playerNumber, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.playerNumberText}>{player.number}</Text>
              </View>
            </View>
            
            {/* Información del jugador */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerPosition}>{player.position}</Text>
            </View>
            
            {/* Botón de editar */}
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: COLORS.primary }]}
              onPress={handleEdit}
            >
              <EditIcon size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs sin cabecera */}
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: COLORS.primary,
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
                <PersonIcon color={color} />
              ),
            }}
          />
          
          <Tabs.Screen
            name="multas"
            options={{
              title: 'Multas',
              tabBarIcon: ({ color }) => (
                <CoinsIcon color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="estadisticas"
            options={{
              title: 'Estadísticas',
              tabBarIcon: ({ color }) => (
                <BarChartIcon color={color} />
              ),
            }}
          />
        </Tabs>
      </View>
    </PlayerContext.Provider>
  );
}

const styles = StyleSheet.create({
  // Estilos sin cambios...
  headerContainer: {
    position: 'relative',
    paddingTop: 50,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  headerGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -50,
    right: -30,
    opacity: 0.3,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: -20,
    left: -30,
    opacity: 0.3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatarGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
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
  playerNumber: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
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
  // Botón de editar
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  // Barra de pestañas
  topBar: {
    height: 56,
    backgroundColor: COLORS.background,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Fondo sutil para integrarse mejor
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
});