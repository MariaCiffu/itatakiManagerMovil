// app/jugadores/[id]/_layout.js
import { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { PlayerContext } from "../../../context/PlayerContext";
import { LinearGradient } from "expo-linear-gradient";
import {
  BarChartIcon,
  CoinsIcon,
  PersonIcon,
  EditIcon,
} from "../../../components/Icons";
import { MODERN_COLORS } from "../../../constants/modernColors";
import { getJugadorById } from "../../../services/playersService";
import { Ionicons } from "@expo/vector-icons";

export default function PlayerLayout() {
  const { id } = useLocalSearchParams();
  const [player, setPlayer] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔥 CARGAR DATOS DEL JUGADOR DESDE FIREBASE
  useFocusEffect(
    useCallback(() => {
      const loadPlayer = async () => {
        if (!id) {
          console.log("❌ No se proporcionó ID del jugador");
          return;
        }

        try {
          setLoading(true);
          console.log("📄 Cargando jugador desde Firebase:", id);

          const data = await getJugadorById(id);

          if (data) {
            console.log("✅ Jugador cargado:", data.name);
            setPlayer(data);
          } else {
            console.log("❌ No se encontró el jugador con ID:", id);
            setPlayer({});
          }
        } catch (error) {
          console.error("❌ Error al cargar jugador:", error);
          setPlayer({});
        } finally {
          setLoading(false);
        }
      };

      loadPlayer();
    }, [id])
  );

  const handleEdit = useCallback(() => {
    if (!player.id) {
      console.log("❌ No se puede editar: falta ID del jugador");
      return;
    }

    console.log("📝 Navegando a editar jugador:", player.id);
    router.push({
      pathname: "/jugadores/edit-player",
      params: {
        playerData: JSON.stringify({
          ...player,
          id: player.id,
        }),
      },
    });
  }, [player, router]);

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={MODERN_COLORS.background}
        />
        <Text style={styles.loadingText}>Cargando jugador...</Text>
      </View>
    );
  }

  if (!player.id) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={MODERN_COLORS.background}
        />
        <Text style={styles.errorText}>Jugador no encontrado</Text>
      </View>
    );
  }

  return (
    <PlayerContext.Provider value={player}>
      <View style={{ flex: 1, backgroundColor: MODERN_COLORS.background }}>
        {/* Header con diseño moderno */}
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={[MODERN_COLORS.surface, MODERN_COLORS.surfaceGray]}
            style={styles.headerGradient}
          />

          <View
            style={[
              styles.decorativeCircle1,
              { backgroundColor: `${MODERN_COLORS.primary}10` },
            ]}
          />
          <View
            style={[
              styles.decorativeCircle2,
              { backgroundColor: `${MODERN_COLORS.secondary}10` },
            ]}
          />

          {/* Contenido del header */}
          <View style={styles.headerContent}>
            {/* Botón de retroceso dentro de la fila */}
            <TouchableOpacity
              style={styles.backButtonInline}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={MODERN_COLORS.primary}
              />
            </TouchableOpacity>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatarGlow,
                  { backgroundColor: MODERN_COLORS.primary },
                ]}
              />
              <View style={styles.avatarWrapper}>
                {player.image ? (
                  <Image source={{ uri: player.image }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <PersonIcon size={40} color={MODERN_COLORS.primary} />
                  </View>
                )}
              </View>
              <View
                style={[
                  styles.playerNumber,
                  { backgroundColor: MODERN_COLORS.primary },
                ]}
              >
                <Text style={styles.playerNumberText}>
                  {player.number || "?"}
                </Text>
              </View>
            </View>

            {/* Información del jugador */}
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>
                {player.name || "Nombre no disponible"}
              </Text>
              <Text style={styles.playerPosition}>
                {player.position || "Posición no disponible"}
              </Text>
            </View>

            {/* Botón de editar */}
            <TouchableOpacity
              style={[
                styles.editButton,
                { backgroundColor: MODERN_COLORS.primary },
              ]}
              onPress={handleEdit}
              activeOpacity={0.8}
            >
              <EditIcon size={16} color={MODERN_COLORS.textWhite} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: MODERN_COLORS.primary,
            tabBarInactiveTintColor: MODERN_COLORS.textGray,
            tabBarStyle: styles.tabBar,
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="datos"
            options={{
              title: "Datos",
              tabBarIcon: ({ color }) => <PersonIcon color={color} />,
            }}
          />

          <Tabs.Screen
            name="multas"
            options={{
              title: "Multas",
              tabBarIcon: ({ color }) => <CoinsIcon color={color} />,
            }}
          />
          <Tabs.Screen
            name="estadisticas"
            options={{
              title: "Estadísticas",
              tabBarIcon: ({ color }) => <BarChartIcon color={color} />,
            }}
          />
        </Tabs>
      </View>
    </PlayerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: MODERN_COLORS.textDark,
    fontSize: 16,
    fontWeight: "500",
  },

  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  errorText: {
    color: MODERN_COLORS.textGray,
    fontSize: 18,
    textAlign: "center",
  },

  headerContainer: {
    position: "relative",
    paddingBottom: 30,
    overflow: "hidden",
  },

  headerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  decorativeCircle1: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    top: -50,
    right: -30,
    opacity: 0.6,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    bottom: -20,
    left: -30,
    opacity: 0.6,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    marginTop: 20,
  },

  backButtonInline: {
    marginRight: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_COLORS.surface,
    justifyContent: "center",
    alignItems: "center",

    // sombra ligera
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },

  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatarGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.2,
    transform: [{ scale: 1.1 }],
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: MODERN_COLORS.primary,
    overflow: "hidden",
    backgroundColor: MODERN_COLORS.surface,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },
  playerNumber: {
    position: "absolute",
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: MODERN_COLORS.surface,
  },
  playerNumberText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 12,
    fontWeight: "bold",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: MODERN_COLORS.textDark,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  playerPosition: {
    color: MODERN_COLORS.textGray,
    fontSize: 14,
    fontWeight: "500",
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
  },
  tabBar: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopColor: MODERN_COLORS.border,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 8,
    paddingTop: 5,
  },
});
