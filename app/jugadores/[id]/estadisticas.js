// app/jugadores/[id]/estadisticas.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';


const screenWidth = Dimensions.get('window').width - 48;

export default function Estadisticas() {
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <View style={styles.headerIndicator} />
        <Text style={styles.title}>Estadísticas</Text>
      </View>

      {/* Principales estadísticas */}
      <View style={styles.statsGrid}>
        <StatCard 
          icon={<AntDesign name="Trophy" size={24} color="#FFD700" />}
          label="Goles"
          value="10"
          gradientColors={['#A463F220', '#8B5CF620']}
          accentColor="#A463F2"
        />
        <StatCard 
          icon={<AntDesign name="calendar" size={24} color="#0084FF" />}
          label="Partidos jugados"
          value="18"
          gradientColors={['#0084FF20', '#0070E020']}
          accentColor="#0084FF"
        />
        <StatCard 
          icon={<AntDesign name="clockcircleo" size={24} color="#00C781" />}
          label="Minutos jugados"
          value="1324"
          gradientColors={['#00C78120', '#00A86920']}
          accentColor="#00C781"
        />
        <StatCard 
          icon={<Ionicons name="football" size={24} color="#FF5A5F" />}
          label="Promedio goles"
          value="0.55"
          gradientColors={['#FF5A5F20', '#E0484D20']}
          accentColor="#FF5A5F"
        />
      </View>

      {/* Tarjetas y Presencia */}
      <View style={styles.statsRow}>
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#1E1E1E', '#252525']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: '#FFB40020' }]}>
                <Feather name="alert-triangle" size={24} color="#FFB400" />
              </View>
              <Text style={styles.cardTitle}>Tarjetas</Text>
            </View>
            <View style={styles.tarjetasContainer}>
              <View style={styles.tarjetaItem}>
                <View style={[styles.tarjetaIndicator, { backgroundColor: '#FFB400' }]} />
                <Text style={styles.tarjetaValue}>2</Text>
                <Text style={styles.tarjetaLabel}>Amarillas</Text>
              </View>
              <View style={styles.tarjetaDivider} />
              <View style={styles.tarjetaItem}>
                <View style={[styles.tarjetaIndicator, { backgroundColor: '#FF5A5F' }]} />
                <Text style={styles.tarjetaValue}>0</Text>
                <Text style={styles.tarjetaLabel}>Rojas</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#1E1E1E', '#252525']}
            style={styles.cardGradient}
          >
            
            <View style={styles.presenciaContainer}>
              <View style={styles.presenciaCircleContainer}>
                <View style={styles.presenciaCircleBackground} />
                <View style={styles.presenciaCircleForeground} />
                <Text style={styles.presenciaValue}>85%</Text>
              </View>
              <Text style={styles.presenciaLabel}>Asistencia a entrenamientos</Text>
            </View>
          </LinearGradient>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, gradientColors, accentColor }) {
  return (
    <View style={styles.statCardContainer}>
      <LinearGradient
        colors={gradientColors}
        style={styles.statCardGradient}
      >
        <View style={styles.statCardContent}>
            <View style={[styles.statCardIcon, { borderColor: accentColor }]}>
            {icon}
            </View>
          <Text style={styles.statCardLabel}>{label}</Text>
          <Text style={[styles.statCardValue, { color: accentColor }]}>{value}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIndicator: {
    width: 4,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#A463F2',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Grid de estadísticas
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCardContainer: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
  },
  statCardContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  statCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statCardLabel: {
    color: '#999',
    fontSize: 13,
    marginBottom: 6,
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  }, 
  
  // Tarjetas y Presencia
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardContainer: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 12,
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Tarjetas
  tarjetasContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    padding: 16,
  },
  tarjetaItem: {
    flex: 1,
    alignItems: 'center',
  },
  tarjetaDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  tarjetaIndicator: {
    width: 16,
    height: 24,
    borderRadius: 2,
    marginBottom: 8,
  },
  tarjetaValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarjetaLabel: {
    color: '#999',
    fontSize: 12,
  },
  
  // Presencia
  presenciaContainer: {
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    padding: 16,
    alignItems: 'center',
  },
  presenciaCircleContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  presenciaCircleBackground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#333',
  },
  presenciaCircleForeground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: '#00C781',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  presenciaValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  presenciaLabel: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
});