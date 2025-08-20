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
import { COLORS } from "../constants/colors";
import {
  PersonIcon,
  UserFriendsIcon,
  CalendarIcon,
  EnvelopeIcon,
} from "../components/Icons";
import { useAuth } from "../context/authContext";
import { PARTIDOS } from "../data/partidosData"; // 🔥 IMPORTAR DATOS REALES

export default function Home() {
  const router = useRouter();
  const { state, logout } = useAuth();
  const { user } = state;

  // 🔥 CARGAR PRÓXIMO PARTIDO REAL
  const [nextMatch, setNextMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNextMatch = () => {
      try {
        // Filtrar partidos futuros y ordenar por fecha
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
          setNextMatch(null); // No hay partidos próximos
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

  // Pantalla de carga
  if (state.isLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  // Si no está autenticado, no mostrar nada
  if (!state.isAuthenticated || !user) {
    return null;
  }

  // 🔥 OBTENER SALUDO SEGÚN LA HORA
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER MÁS EQUILIBRADO */}
      <LinearGradient
        colors={["#3b82f6", "#1d4ed8"]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userSection}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.teamName}>{user.teamName}</Text>
              <Text style={styles.teamField}>{user.homeField}</Text>
            </View>

            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 🔥 PRÓXIMO PARTIDO CON GRADIENTE MODERNO */}
        {nextMatch && (
          <View style={styles.nextMatchSection}>
            <TouchableOpacity
              style={styles.nextMatchCard}
              onPress={() => router.push(`/partidos/${nextMatch.id}`)}
            >
              <LinearGradient
                colors={["#ef4444", "#dc2626"]}
                style={styles.matchGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.matchHeader}>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchBadgeText}>PRÓXIMO</Text>
                  </View>
                  <Text style={styles.matchDate}>{nextMatch.date}</Text>
                </View>
                <Text style={styles.matchTitle}>vs {nextMatch.opponent}</Text>
                <View style={styles.matchDetails}>
                  <Text style={styles.matchDetail}>{nextMatch.time}</Text>
                  <Text style={styles.matchDetail}>{nextMatch.location}</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* 🔥 GRID MÁS MODERNO CON EFECTOS */}
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Gestión del Equipo</Text>

          <View style={styles.gridContainer}>
            {/* JUGADORES */}
            <TouchableOpacity
              style={[styles.gridCard, styles.playerCard]}
              onPress={() => router.push("/jugadores")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardIcon}>
                  <PersonIcon size={36} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Jugadores</Text>
                <Text style={styles.cardSubtitle}>Gestionar plantilla</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* STAFF */}
            <TouchableOpacity
              style={[styles.gridCard, styles.staffCard]}
              onPress={() => router.push("/staff")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#f59e0b", "#d97706"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardIcon}>
                  <UserFriendsIcon size={36} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Staff</Text>
                <Text style={styles.cardSubtitle}>Cuerpo técnico</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* PARTIDOS */}
            <TouchableOpacity
              style={[styles.gridCard, styles.matchesCard]}
              onPress={() => router.push("/partidos")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#10b981", "#059669"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardIcon}>
                  <CalendarIcon size={36} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Partidos</Text>
                <Text style={styles.cardSubtitle}>Calendario</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* CONVOCATORIAS */}
            <TouchableOpacity
              style={[styles.gridCard, styles.callupCard]}
              onPress={() => router.push("/convocatorias")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#6366f1", "#4f46e5"]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardIcon}>
                  <EnvelopeIcon size={36} color="#fff" />
                </View>
                <Text style={styles.cardTitle}>Convocatorias</Text>
                <Text style={styles.cardSubtitle}>Llamar jugadores</Text>
              </LinearGradient>
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
    backgroundColor: "#f1f5f9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },

  // 🔥 HEADER CON MÁS PERSONALIDAD
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    padding: 24,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  userSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
    fontWeight: "500",
  },
  userName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },

  // 🔥 INFO SIMPLE Y DIRECTA
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
  },
  teamField: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },

  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // 🔥 CONTENIDO
  content: {
    flex: 1,
    marginTop: -12,
  },

  // 🔥 PRÓXIMO PARTIDO MÁS LLAMATIVO
  nextMatchSection: {
    padding: 20,
  },
  nextMatchCard: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  matchGradient: {
    padding: 24,
    position: "relative",
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  matchBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  matchDate: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 12,
  },
  matchDetails: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 8,
  },
  matchDetail: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "600",
  },

  // 🔥 BADGE CASA/FUERA
  matchLocationBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchLocationText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // 🔥 INDICADOR VER MÁS
  matchViewMore: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // 🔥 SECCIÓN PRINCIPAL
  mainSection: {
    padding: 20,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 20,
  },

  // 🔥 GRID MÁS MODERNO
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 16,
  },
  gridCard: {
    width: "47%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  cardGradient: {
    padding: 24,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    fontWeight: "500",
  },

  bottomSpacer: {
    height: 32,
  },
});
