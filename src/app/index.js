// app/index.js
import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { PersonIcon, UserFriendsIcon, BarChartIcon, CalendarIcon, EnvelopeIcon } from '../components/Icons';

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top, 
        paddingBottom: insets.bottom,
        backgroundColor: COLORS.background
      }
    ]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>Mi Equipo</Text>
          <View style={styles.teamInfo}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
              style={styles.teamLogo} 
            />
            <View>
              <Text style={styles.teamName}>FC Barcelona</Text>
              <Text style={styles.teamCategory}>Categoría: Juvenil A</Text>
            </View>
          </View>
        </View>
        
        {/* Secciones principales */}
        <View style={styles.mainSections}>
          <TouchableOpacity 
            style={styles.mainCard}
            onPress={() => router.push('/jugadores')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[`${COLORS.primary}`, `${COLORS.primaryDark}`]}
              style={styles.mainCardGradient}
            >
              <View style={styles.mainCardContent}>
                <View style={styles.mainCardIcon}>
                  <PersonIcon size={32} color="#fff" />
                </View>
                <Text style={styles.mainCardTitle}>Plantilla</Text>
                <Text style={styles.mainCardDescription}>
                  Gestiona los jugadores, estadísticas y multas
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.mainCard}
            onPress={() => router.push('/staff')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[`${COLORS.secondary}`, '#E09600']}
              style={styles.mainCardGradient}
            >
              <View style={styles.mainCardContent}>
                <View style={[styles.mainCardIcon, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <UserFriendsIcon size={32} color="#fff" />
                </View>
                <Text style={styles.mainCardTitle}>Staff</Text>
                <Text style={styles.mainCardDescription}>
                  Gestiona el equipo técnico y sus datos
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

//acceso rápido para convocatorias

<TouchableOpacity 
  style={styles.quickAccessCard}
  onPress={() => router.push('/convocatorias')}
  activeOpacity={0.7}
>
  <LinearGradient
    colors={[COLORS.card, '#252525']}
    style={styles.quickAccessGradient}
  >
    <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.primary}20` }]}>
      <EnvelopeIcon size={24} color={COLORS.primary} />
    </View>
    <Text style={styles.quickAccessTitle}>Convocatorias</Text>
  </LinearGradient>
</TouchableOpacity>

<TouchableOpacity 
  style={styles.quickAccessCard}
  onPress={() => router.push('/alineacion')}
  activeOpacity={0.7}
>
  <LinearGradient
    colors={[COLORS.card, '#252525']}
    style={styles.quickAccessGradient}
  >
    <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.primary}20` }]}>
      <EnvelopeIcon size={24} color={COLORS.primary} />
    </View>
    <Text style={styles.quickAccessTitle}>Partidos</Text>
  </LinearGradient>
</TouchableOpacity>
        </View>
        
        {/* Accesos rápidos */}
        <View style={styles.quickAccess}>
          <Text style={styles.sectionTitle}>Accesos rápidos</Text>
          
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => console.log('Próximamente')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.card, '#252525']}
                style={styles.quickAccessGradient}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.info}20` }]}>
                  <CalendarIcon size={24} color={COLORS.info} />
                </View>
                <Text style={styles.quickAccessTitle}>Calendario</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => console.log('Próximamente')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.card, '#252525']}
                style={styles.quickAccessGradient}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.success}20` }]}>
                  <BarChartIcon size={24} color={COLORS.success} />
                </View>
                <Text style={styles.quickAccessTitle}>Estadísticas</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => console.log('Próximamente')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.card, '#252525']}
                style={styles.quickAccessGradient}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.warning}20` }]}>
                  <PersonIcon size={24} color={COLORS.warning} />
                </View>
                <Text style={styles.quickAccessTitle}>Asistencia</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => console.log('Próximamente')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[COLORS.card, '#252525']}
                style={styles.quickAccessGradient}
              >
                <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.danger}20` }]}>
                  <UserFriendsIcon size={24} color={COLORS.danger} />
                </View>
                <Text style={styles.quickAccessTitle}>Rivales</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Próximos eventos */}
        <View style={styles.upcomingEvents}>
          <Text style={styles.sectionTitle}>Próximos eventos</Text>
          
          <View style={styles.eventCard}>
            <LinearGradient
              colors={[COLORS.card, '#252525']}
              style={styles.eventGradient}
            >
              <View style={styles.eventHeader}>
                <View style={[styles.eventBadge, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.eventBadgeText}>PARTIDO</Text>
                </View>
                <Text style={styles.eventDate}>15/05/2024</Text>
              </View>
              
              <Text style={styles.eventTitle}>vs. Real Madrid</Text>
              <Text style={styles.eventLocation}>Estadio Central, 17:00</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.eventCard}>
            <LinearGradient
              colors={[COLORS.card, '#252525']}
              style={styles.eventGradient}
            >
              <View style={styles.eventHeader}>
                <View style={[styles.eventBadge, { backgroundColor: COLORS.secondary }]}>
                  <Text style={styles.eventBadgeText}>ENTRENAMIENTO</Text>
                </View>
                <Text style={styles.eventDate}>12/05/2024</Text>
              </View>
              
              <Text style={styles.eventTitle}>Entrenamiento táctico</Text>
              <Text style={styles.eventLocation}>Campo Municipal, 18:00</Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  teamCategory: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  mainSections: {
    padding: 16,
    gap: 16,
  },
  mainCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  mainCardGradient: {
    borderRadius: 16,
  },
  mainCardContent: {
    padding: 20,
  },
  mainCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mainCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  mainCardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickAccess: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  quickAccessGradient: {
    borderRadius: 12,
    padding: 1, // Borde gradiente
  },
  quickAccessIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  upcomingEvents: {
    padding: 16,
    paddingBottom: 32,
  },
  eventCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  eventGradient: {
    borderRadius: 12,
    padding: 1, // Borde gradiente
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 11,
    borderTopRightRadius: 11,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  eventBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  eventTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  eventLocation: {
    color: COLORS.textSecondary,
    fontSize: 14,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomLeftRadius: 11,
    borderBottomRightRadius: 11,
  },
});