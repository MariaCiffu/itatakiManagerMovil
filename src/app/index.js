"use client"

import { StyleSheet, View, TouchableOpacity, Text, Image, ScrollView, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { useEffect } from "react"
import { COLORS } from "../constants/colors"
import { PersonIcon, UserFriendsIcon, BarChartIcon, CalendarIcon, EnvelopeIcon } from "../components/Icons"
import { useAuth } from "../context/authContext"

export default function Home() {
  const router = useRouter()
  const { state, logout } = useAuth()
  const { user } = state

  // Redirección si no está autenticado
  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      router.replace("/auth/login")
    }
  }, [state.isAuthenticated, state.isLoading, router])

  // Pantalla de carga
  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    )
  }

  // Si no está autenticado, no mostrar nada
  if (!state.isAuthenticated || !user) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Header mejorado */}
      <LinearGradient colors={["#1e293b", "#334155", "#475569"]} style={styles.headerGradient}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.welcomeSection}>
              <Text style={styles.appName}>Itataki Manager</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Salir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.teamInfoCard}>
            <View style={styles.teamLogoContainer}>
              <Image
                source={{
                  uri:
                    user.teamLogo ||
                    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-tM6oLpsmrTpiVF966eTOQst7xHlbYK.jpeg",
                }}
                style={styles.teamLogo}
              />
            </View>
            <View style={styles.teamDetails}>
              <Text style={styles.welcomeText}>¡Hola, {user.name}!</Text>
              <Text style={styles.teamName}>{user.teamName}</Text>
              <Text style={styles.teamCategory}>Categoría: {user.category}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Secciones principales rediseñadas */}
        <View style={styles.mainSections}>
          <Text style={styles.sectionTitle}>Gestión Principal</Text>

          <View style={styles.mainCardsContainer}>
            <TouchableOpacity style={styles.mainCard} onPress={() => router.push("/jugadores")} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.mainCardGradient}>
                <View style={styles.mainCardContent}>
                  <View style={styles.mainCardIcon}>
                    <PersonIcon size={28} color="#fff" />
                  </View>
                  <Text style={styles.mainCardTitle}>Plantilla</Text>
                  <Text style={styles.mainCardDescription}>Gestiona jugadores y estadísticas</Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>23 jugadores</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mainCard} onPress={() => router.push("/staff")} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.secondary, "#E09600"]} style={styles.mainCardGradient}>
                <View style={styles.mainCardContent}>
                  <View style={styles.mainCardIcon}>
                    <UserFriendsIcon size={28} color="#fff" />
                  </View>
                  <Text style={styles.mainCardTitle}>Staff</Text>
                  <Text style={styles.mainCardDescription}>Equipo técnico y cuerpo médico</Text>
                  <View style={styles.cardBadge}>
                    <Text style={styles.cardBadgeText}>5 miembros</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Accesos rápidos rediseñados */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>

          <View style={styles.quickAccessGrid}>
            <TouchableOpacity
              style={styles.quickAccessCard}
              onPress={() => router.push("/convocatorias")}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.primary}15` }]}>
                <EnvelopeIcon size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.quickAccessTitle}>Convocatorias</Text>
              <Text style={styles.quickAccessSubtitle}>Gestionar llamados</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessCard}
              onPress={() => router.push("/partidos")}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.success}15` }]}>
                <CalendarIcon size={24} color={COLORS.success} />
              </View>
              <Text style={styles.quickAccessTitle}>Partidos</Text>
              <Text style={styles.quickAccessSubtitle}>Calendario y resultados</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessCard}
              onPress={() => router.push("/ejercicios")}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.warning}15` }]}>
                <BarChartIcon size={24} color={COLORS.warning} />
              </View>
              <Text style={styles.quickAccessTitle}>Ejercicios</Text>
              <Text style={styles.quickAccessSubtitle}>Entrenamientos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAccessCard}
              onPress={() => console.log("Próximamente")}
              activeOpacity={0.7}
            >
              <View style={[styles.quickAccessIcon, { backgroundColor: `${COLORS.info}15` }]}>
                <BarChartIcon size={24} color={COLORS.info} />
              </View>
              <Text style={styles.quickAccessTitle}>Estadísticas</Text>
              <Text style={styles.quickAccessSubtitle}>Análisis y datos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Próximos eventos rediseñados */}
        <View style={styles.eventsSection}>
          <Text style={styles.sectionTitle}>Próximos Eventos</Text>

          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={[styles.eventBadge, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.eventBadgeText}>PARTIDO</Text>
              </View>
              <Text style={styles.eventDate}>15 May</Text>
            </View>
            <Text style={styles.eventTitle}>vs. Real Madrid</Text>
            <Text style={styles.eventLocation}>📍 Estadio Central</Text>
            <Text style={styles.eventTime}>🕐 17:00</Text>
          </View>

          <View style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <View style={[styles.eventBadge, { backgroundColor: COLORS.secondary }]}>
                <Text style={styles.eventBadgeText}>ENTRENAMIENTO</Text>
              </View>
              <Text style={styles.eventDate}>12 May</Text>
            </View>
            <Text style={styles.eventTitle}>Entrenamiento Táctico</Text>
            <Text style={styles.eventLocation}>📍 {user.homeField}</Text>
            <Text style={styles.eventTime}>🕐 18:00</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },

  // Header rediseñado
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    padding: 20,
    paddingBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#e2e8f0",
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  teamInfoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  teamLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  teamCategory: {
    fontSize: 14,
    color: "#e2e8f0",
    marginBottom: 2,
  },
  homeField: {
    fontSize: 12,
    color: "#cbd5e1",
  },

  // Content
  content: {
    flex: 1,
    marginTop: -12,
  },

  // Secciones principales
  mainSections: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  mainCardsContainer: {
    gap: 16,
  },
  mainCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  mainCardGradient: {
    borderRadius: 20,
  },
  mainCardContent: {
    padding: 24,
    position: "relative",
  },
  mainCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  mainCardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  mainCardDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  cardBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  cardBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  // Accesos rápidos
  quickAccessSection: {
    padding: 20,
    paddingTop: 0,
  },
  quickAccessGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  quickAccessCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAccessIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  quickAccessSubtitle: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },

  // Eventos
  eventsSection: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 40,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  eventBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  eventDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },
  eventLocation: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: "#64748b",
  },
})
