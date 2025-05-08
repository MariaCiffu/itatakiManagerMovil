// app/jugadores/[id]/estadisticas.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  AlertIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrophyIcon,
  SoccerBallIcon 
} from '../../../components/Icons';
import { COLORS } from '../../../constants/colors';

export default function Estadisticas() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <View style={[styles.headerIndicator, { backgroundColor: COLORS.primary }]} />
        <Text style={styles.title}>Estadísticas</Text>
      </View>

      {/* Principales estadísticas - 2 por fila, mismo tamaño */}
      <View style={styles.statsGrid}>
        <StatCard 
          icon={<SoccerBallIcon color="#FFD700"/>}
          label="Goles"
          value="10"
          gradientColors={[`${COLORS.primary}20`, `${COLORS.primaryDark}20`]}
          accentColor={COLORS.primary}
        />
        <StatCard 
          icon={<CalendarIcon color={COLORS.info} />}
          label="Partidos jugados"
          value="18"
          gradientColors={[`${COLORS.info}20`, `${COLORS.info}20`]}
          accentColor={COLORS.info}
        />
        <StatCard 
          icon={<ClockIcon color={COLORS.success} />}
          label="Minutos jugados"
          value="1324"
          gradientColors={[`${COLORS.success}20`, `${COLORS.success}20`]}
          accentColor={COLORS.success}
        />
        <StatCard 
          icon={<TrophyIcon color={COLORS.warning} />}
          label="Asistencias"
          value="5"
          gradientColors={[`${COLORS.warning}20`, `${COLORS.warning}20`]}
          accentColor={COLORS.warning}
        />
      </View>

      {/* Tarjetas y Presencia - mismo tamaño */}
      <View style={styles.statsRow}>
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[COLORS.card, '#252525']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: `${COLORS.warning}20` }]}>
                <AlertIcon color={COLORS.warning} />
              </View>
              <Text style={styles.cardTitle}>Tarjetas</Text>
            </View>
            <View style={styles.tarjetasContainer}>
              <View style={styles.tarjetaItem}>
                <View style={[styles.tarjetaIndicator, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.tarjetaValue}>2</Text>
                <Text style={styles.tarjetaLabel}>Amarillas</Text>
              </View>
              <View style={styles.tarjetaDivider} />
              <View style={styles.tarjetaItem}>
                <View style={[styles.tarjetaIndicator, { backgroundColor: COLORS.danger }]} />
                <Text style={styles.tarjetaValue}>0</Text>
                <Text style={styles.tarjetaLabel}>Rojas</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[COLORS.card, '#252525']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardHeaderIcon, { backgroundColor: `${COLORS.primary}20` }]}>
                <TrophyIcon color={COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>Partidos</Text>
            </View>
            <View style={styles.tarjetasContainer}>
              <View style={styles.tarjetaItem}>
                <Text style={styles.tarjetaValue}>2</Text>
                <Text style={styles.tarjetaLabel}>Titular</Text>
              </View>
              <View style={styles.tarjetaDivider} />
              <View style={styles.tarjetaItem}>
                <Text style={styles.tarjetaValue}>0</Text>
                <Text style={styles.tarjetaLabel}>Suplente</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Asistencia a entrenamientos */}
      <View style={styles.fullWidthCard}>
        <LinearGradient
          colors={[COLORS.card, '#252525']}
          style={styles.cardGradient}
        >
          <View style={styles.presenciaContainer}>
            <View style={styles.presenciaCircleContainer}>
              <View style={styles.presenciaCircleBackground} />
              <View style={[styles.presenciaCircleForeground, { borderColor: COLORS.success }]} />
              <Text style={styles.presenciaValue}>85%</Text>
            </View>
            <Text style={styles.presenciaLabel}>Asistencia a entrenamientos</Text>
          </View>
        </LinearGradient>
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
  // Estilos sin cambios...
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
  },
  
  // Grid de estadísticas
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCardContainer: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    height: 140, // Altura fija para que todos los cards sean iguales
  },
  statCardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
    height: '100%',
  },
  statCardContent: {
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
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
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'center',
  },
  statCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  
  // Tarjetas y Presencia
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardContainer: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
    height: 140, // Altura fija para que todos los cards sean iguales
  },
  fullWidthCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
    height: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
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
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Tarjetas
  tarjetasContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    padding: 16,
    flex: 1,
  },
  tarjetaItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tarjetaDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 8,
  },
  tarjetaIndicator: {
    width: 16,
    height: 24,
    borderRadius: 2,
    marginBottom: 8,
  },
  tarjetaValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tarjetaLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  
  // Presencia
  presenciaContainer: {
    backgroundColor: COLORS.card,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  presenciaCircleContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  presenciaCircleBackground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: COLORS.divider,
  },
  presenciaCircleForeground: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  presenciaValue: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  presenciaLabel: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
    marginLeft: 16,
  },
});