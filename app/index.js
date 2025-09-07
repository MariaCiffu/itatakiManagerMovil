import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  PersonIcon,
  UserFriendsIcon,
  CalendarIcon,
  EnvelopeIcon,
} from "../src/components/Icons";
import { useAuth } from "../src/hooks/useFirebase";
import { PARTIDOS } from "../src/data/partidosData";
import { MODERN_COLORS } from "../src/constants/modernColors";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();

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

  if (loading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 13) return "Buenos días";
    if (hour < 21) return "Buenas tardes";
    return "Buenas noches";
  };

  const navigateToProfile = () => {
    router.push("/profile");
  };

  return (
    <View style={styles.container}>
      {/* HEADER MINIMALISTA */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.userInfo} activeOpacity={0.7}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <View style={styles.userNameRow}>
              <Text style={styles.userName}>{user.name || "Usuario"} 👋</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity onPress={logout} style={styles.logoutButton}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={MODERN_COLORS.textGray}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* INFO DEL EQUIPO EN TARJETA SEPARADA Y CLICKEABLE */}
        <TouchableOpacity
          style={styles.teamCard}
          onPress={navigateToProfile}
          activeOpacity={0.8}
        >
          <View style={styles.teamIcon}>
            {user.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.teamInfo}>
            <Text style={styles.teamName}>{user.teamName || "Equipo"}</Text>
            <Text style={styles.teamField}>
              {user.homeField || "Campo Local"}
            </Text>
          </View>
          <View style={styles.teamChevron}>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={MODERN_COLORS.textLight}
            />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* PRÓXIMO PARTIDO */}
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
                  <View style={styles.matchDetailItem}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={MODERN_COLORS.textGray}
                    />
                    <Text style={styles.matchDetailText}>{nextMatch.time}</Text>
                  </View>
                </View>

                <Text style={styles.matchTitle}>vs {nextMatch.opponent}</Text>

                <View style={styles.matchDetailsRow}>
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
              <View style={styles.matchDecoration} />
            </TouchableOpacity>
          </View>
        )}

        {/* GRID MODERNO 2x2 */}
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Panel de Control</Text>

          <View style={styles.gridContainer}>
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
    paddingRight: 12,
  },

  greeting: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    marginBottom: 4,
    fontWeight: "500",
  },

  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
    marginRight: 8,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  teamCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  teamIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: MODERN_COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },

  profileAvatar: {
    width: "100%",
    height: "100%",
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  profileAvatarText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "700",
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

  teamChevron: {
    marginLeft: 8,
    opacity: 0.6,
  },

  content: {
    flex: 1,
  },

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

  bottomSpacer: {
    height: 32,
  },
});
