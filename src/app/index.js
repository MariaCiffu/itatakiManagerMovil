import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  PersonIcon,
  UserFriendsIcon,
  CalendarIcon,
  EnvelopeIcon,
} from "../components/Icons";
import { useAuth } from "../context/authContext";
import { PARTIDOS } from "../data/partidosData";

// 🎨 NUEVA PALETA MÁS MODERNA Y LIMPIA
const MODERN_COLORS = {
  primary: "#2563eb", // Azul vibrante pero profesional
  primaryDark: "#1d4ed8", // Azul más oscuro
  secondary: "#10b981", // Verde moderno
  accent: "#f59e0b", // Amarillo/naranja elegante
  danger: "#ef4444", // Rojo moderno

  // Fondos neutros modernos
  background: "#fafafa", // Gris muy claro, casi blanco
  surface: "#ffffff", // Blanco puro
  surfaceGray: "#f5f5f5", // Gris clarísimo

  // Textos con mejor contraste
  textDark: "#0f172a", // Negro muy oscuro
  textGray: "#64748b", // Gris medio
  textLight: "#94a3b8", // Gris claro
  textWhite: "#ffffff", // Blanco

  // Bordes
  border: "#e2e8f0", // Gris border
};

export default function Home() {
  const router = useRouter();
  const { state, logout } = useAuth();
  const { user } = state;

  const [nextMatch, setNextMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNextMatch = () => {
      try {
        const now = new Date();
        const futureMatches = PARTIDOS.filter(
          (partido) => new Date(partido.fecha) > now
        ).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        if (futureMatches.length > 0) {
          const proximoPartido = futureMatches[0];
          const fechaPartido = new Date(proximoPartido.fecha);

          setNextMatch({
            id: proximoPartido.id,
            opponent: proximoPartido.rival,
            date: fechaPartido.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
            }),
            time: fechaPartido.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            location:
              proximoPartido.lugar === "Casa"
                ? user?.homeField || "Campo Local"
                : `Campo del ${proximoPartido.rival}`,
            isHome: proximoPartido.lugar === "Casa",
            tipo: proximoPartido.tipoPartido,
            jornada: proximoPartido.jornada,
          });
        } else {
          setNextMatch(null);
        }
      } catch (error) {
        console.error("Error cargando próximo partido:", error);
        setNextMatch(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadNextMatch();
  }, [user?.homeField]);

  if (state.isLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!state.isAuthenticated || !user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <View style={styles.container}>
      {/* 🎨 HEADER MINIMALISTA SIN GRADIENTE */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user.name} 👋</Text>
          </View>

          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={MODERN_COLORS.textGray}
            />
          </TouchableOpacity>
        </View>

        {/* 🎨 INFO DEL EQUIPO EN TARJETA SEPARADA */}
        <View style={styles.teamCard}>
          <View style={styles.teamIcon}>
            <Text style={styles.teamEmoji}>⚽</Text>
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{user.teamName}</Text>
            <Text style={styles.teamField}>🏟 {user.homeField}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 🎨 PRÓXIMO PARTIDO - DISEÑO CARD MODERNO */}
        {nextMatch && (
          <View style={styles.nextMatchSection}>
            <TouchableOpacity
              style={styles.nextMatchCard}
              onPress={() => router.push(`/partidos/${nextMatch.id}`)}
              activeOpacity={0.95}
            >
              <View style={styles.matchContent}>
                <View style={styles.matchHeader}>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>Próximo Partido</Text>
                  </View>
                  <Text style={styles.matchDate}>{nextMatch.date}</Text>
                </View>

                <Text style={styles.matchTitle}>vs {nextMatch.opponent}</Text>

                <View style={styles.matchDetailsRow}>
                  <View style={styles.matchDetailItem}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={MODERN_COLORS.textGray}
                    />
                    <Text style={styles.matchDetailText}>{nextMatch.time}</Text>
                  </View>
                  <View style={styles.matchDetailItem}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color={MODERN_COLORS.textGray}
                    />
                    <Text style={styles.matchDetailText}>
                      {nextMatch.location}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Decoración lateral */}
              <View style={styles.matchDecoration} />
            </TouchableOpacity>
          </View>
        )}

        {/* 🎨 GRID MODERNO 2x2 CON MEJOR DISEÑO */}
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Panel de Control</Text>

          <View style={styles.gridContainer}>
            {/* JUGADORES */}
            <TouchableOpacity
              style={[styles.gridCard, styles.playersCard]}
              onPress={() => router.push("/jugadores")}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, styles.playersIcon]}>
                  <PersonIcon size={24} color={MODERN_COLORS.primary} />
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={MODERN_COLORS.textLight}
                />
              </View>
              <Text style={styles.cardTitle}>Jugadores</Text>
            </TouchableOpacity>

            {/* STAFF */}
            <TouchableOpacity
              style={[styles.gridCard, styles.staffCard]}
              onPress={() => router.push("/staff")}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, styles.staffIcon]}>
                  <UserFriendsIcon size={24} color={MODERN_COLORS.secondary} />
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={MODERN_COLORS.textLight}
                />
              </View>
              <Text style={styles.cardTitle}>Staff</Text>
            </TouchableOpacity>

            {/* PARTIDOS */}
            <TouchableOpacity
              style={[styles.gridCard, styles.matchesCard]}
              onPress={() => router.push("/partidos")}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, styles.matchesIcon]}>
                  <CalendarIcon size={24} color={MODERN_COLORS.accent} />
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={MODERN_COLORS.textLight}
                />
              </View>
              <Text style={styles.cardTitle}>Partidos</Text>
            </TouchableOpacity>

            {/* CONVOCATORIAS */}
            <TouchableOpacity
              style={[styles.gridCard, styles.callupCard]}
              onPress={() => router.push("/convocatorias")}
              activeOpacity={0.9}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.cardIcon, styles.callupIcon]}>
                  <EnvelopeIcon size={24} color={MODERN_COLORS.danger} />
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={MODERN_COLORS.textLight}
                />
              </View>
              <Text style={styles.cardTitle}>Convocatorias</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  // 🎨 HEADER COMPLETAMENTE NUEVO - MINIMALISTA
  header: {
    backgroundColor: MODERN_COLORS.surface,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  userInfo: {
    flex: 1,
  },

  greeting: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    marginBottom: 4,
    fontWeight: "500",
  },

  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  // 🎨 TARJETA DE EQUIPO SEPARADA
  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    padding: 16,
    borderRadius: 16,
  },

  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MODERN_COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  teamEmoji: {
    fontSize: 24,
  },

  teamInfo: {
    flex: 1,
  },

  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 2,
  },

  teamField: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  // CONTENIDO
  content: {
    flex: 1,
  },

  // 🎨 PRÓXIMO PARTIDO - DISEÑO CARD LIMPIO
  nextMatchSection: {
    padding: 20,
  },

  nextMatchCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    position: "relative",
  },

  matchContent: {
    padding: 20,
  },

  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  matchBadge: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  matchBadgeText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  matchDate: {
    color: MODERN_COLORS.textDark,
    fontSize: 16,
    fontWeight: "700",
  },

  matchTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: MODERN_COLORS.textDark,
    marginBottom: 16,
    letterSpacing: -0.5,
  },

  matchDetailsRow: {
    flexDirection: "row",
    gap: 24,
  },

  matchDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  matchDetailText: {
    color: MODERN_COLORS.textGray,
    fontSize: 14,
    fontWeight: "500",
  },

  matchDecoration: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: MODERN_COLORS.primary,
  },

  // 🎨 GRID 2x2 MODERNO
  mainSection: {
    padding: 20,
    paddingTop: 0,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  gridCard: {
    width: "47%",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    minHeight: 120,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  playersIcon: {
    backgroundColor: "rgba(37, 99, 235, 0.1)",
  },

  staffIcon: {
    backgroundColor: "rgba(16, 185, 129, 0.1)",
  },

  matchesIcon: {
    backgroundColor: "rgba(245, 158, 11, 0.1)",
  },

  callupIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 13,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  bottomSpacer: {
    height: 32,
  },
});
