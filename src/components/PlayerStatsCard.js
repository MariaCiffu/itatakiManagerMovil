import { View, Text, StyleSheet, Image } from 'react-native';

export function PlayerStatsCard({ player }) {
  return (
    <View style={styles.container}>
      {/* Contenedor principal centrado */}
      <View style={styles.header}>
        {/* Contenedor de avatar + textos (se centrará todo junto) */}
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: player.image || 'https://i.pravatar.cc/150?img=1' }} 
            style={styles.avatar} 
          />
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerPosition}>{player.position} · {player.number}</Text>
        </View>
      </View>

      {/* Datos personales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos personales</Text>
        <Text style={styles.stat}>Edad: </Text>
        <Text style={styles.stat}>Altura: </Text>
        <Text style={styles.stat}>Nacionalidad: </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12, // Espacio entre foto y texto
  },
  playerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  playerPosition: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  stat: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 4,
  },
});