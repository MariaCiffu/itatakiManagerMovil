// app/partidos/reporte/ver/[id].js - Ver reporte completado
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../../../src/constants/modernColors";
import { getPartidoById } from "../../../../src/services/partidosService";
import { getAllJugadores } from "../../../../src/services/playersService";
import { useAuth } from "../../../../src/hooks/useFirebase";

export default function VerReporteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [partido, setPartido] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partidoData, jugadoresData] = await Promise.all([
        getPartidoById(id),
        getAllJugadores(),
      ]);

      setPartido(partidoData);
      setJugadores(jugadoresData);

      if (!partidoData?.reportePartido?.completado) {
        Alert.alert("Error", "Este partido no tiene un reporte completado");
        router.back();
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del reporte");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getPlayerName = (playerId) => {
    if (!playerId) return "Jugador desconocido";

    // Buscar en jugadores regulares
    const player = jugadores.find((j) => j.id === playerId);
    if (player) return player.name;

    // Buscar en jugadores temporales
    if (
      partido?.alineacion?.temporaryPlayers &&
      Array.isArray(partido.alineacion.temporaryPlayers)
    ) {
      const tempPlayer = partido.alineacion.temporaryPlayers.find(
        (p) => p.id === playerId
      );
      if (tempPlayer) return tempPlayer.name;
    }

    return "Jugador desconocido";
  };

  const getTotalGoles = () => {
    if (!partido?.reportePartido?.jugadores) return 0;
    return partido.reportePartido.jugadores.reduce(
      (total, j) => total + (j.goles || 0),
      0
    );
  };

  const getTotalTarjetas = () => {
    if (!partido?.reportePartido?.jugadores) return { amarillas: 0, rojas: 0 };

    return partido.reportePartido.jugadores.reduce(
      (total, j) => ({
        amarillas: total.amarillas + (j.tarjetasAmarillas || 0),
        rojas: total.rojas + (j.tarjetasRojas || 0),
      }),
      { amarillas: 0, rojas: 0 }
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando reporte...</Text>
        </View>
      </View>
    );
  }

  if (!partido?.reportePartido) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudo cargar el reporte</Text>
        </View>
      </View>
    );
  }

  const reporte = partido.reportePartido;
  const totalTarjetas = getTotalTarjetas();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.replace(`/partidos/${id}`)}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={MODERN_COLORS.textDark}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Reporte del partido</Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/partidos/reporte/editar/${id}`)}
          style={styles.editHeaderButton}
        >
          <Ionicons
            name="create-outline"
            size={24}
            color={MODERN_COLORS.textDark}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Estadísticas rápidas */}
        <View style={styles.statsCard}>
          <Text style={styles.cardTitle}>Estadísticas del equipo</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons
                name="football"
                size={24}
                color={MODERN_COLORS.success}
              />
              <Text style={styles.statNumber}>{getTotalGoles()}</Text>
              <Text style={styles.statLabel}>Goles</Text>
            </View>
            <View style={styles.statItem}>
              <View
                style={[styles.tarjetaIcon, { backgroundColor: "#FFD700" }]}
              />
              <Text style={styles.statNumber}>{totalTarjetas.amarillas}</Text>
              <Text style={styles.statLabel}>T. Amarillas</Text>
            </View>
            <View style={styles.statItem}>
              <View
                style={[styles.tarjetaIcon, { backgroundColor: "#DC3545" }]}
              />
              <Text style={styles.statNumber}>{totalTarjetas.rojas}</Text>
              <Text style={styles.statLabel}>T. Rojas</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color={MODERN_COLORS.primary} />
              <Text style={styles.statNumber}>
                {reporte.jugadores?.filter((j) => j.minutosJugados > 0)
                  .length || 0}
              </Text>
              <Text style={styles.statLabel}>Jugadores</Text>
            </View>
          </View>
        </View>

        {/* Rendimiento de jugadores */}
        {reporte.jugadores && reporte.jugadores.length > 0 && (
          <View style={styles.jugadoresCard}>
            <Text style={styles.cardTitle}>Rendimiento de jugadores</Text>

            {reporte.jugadores
              .filter((j) => j.minutosJugados > 0)
              .sort((a, b) => b.minutosJugados - a.minutosJugados)
              .map((jugador, index) => (
                <View key={index} style={styles.jugadorRow}>
                  <View style={styles.jugadorInfo}>
                    <Text style={styles.jugadorNombre}>
                      {getPlayerName(jugador.playerId)}
                    </Text>
                    <Text style={styles.jugadorMinutos}>
                      {jugador.minutosJugados}'
                      {jugador.titular && (
                        <Text style={styles.titularTag}> • Titular</Text>
                      )}
                    </Text>
                  </View>

                  <View style={styles.jugadorStats}>
                    {(jugador.goles || 0) > 0 && (
                      <View style={styles.miniStat}>
                        <Ionicons
                          name="football"
                          size={14}
                          color={MODERN_COLORS.success}
                        />
                        <Text style={styles.miniStatText}>{jugador.goles}</Text>
                      </View>
                    )}
                    {(jugador.asistencias || 0) > 0 && (
                      <View style={styles.miniStat}>
                        <Ionicons
                          name="hand-left"
                          size={14}
                          color={MODERN_COLORS.primary}
                        />
                        <Text style={styles.miniStatText}>
                          {jugador.asistencias}
                        </Text>
                      </View>
                    )}
                    {(jugador.tarjetasAmarillas || 0) > 0 && (
                      <View
                        style={[
                          styles.miniTarjeta,
                          { backgroundColor: "#FFD700" },
                        ]}
                      >
                        <Text style={styles.tarjetaText}>
                          {jugador.tarjetasAmarillas}
                        </Text>
                      </View>
                    )}
                    {(jugador.tarjetasRojas || 0) > 0 && (
                      <View
                        style={[
                          styles.miniTarjeta,
                          { backgroundColor: "#DC3545" },
                        ]}
                      />
                    )}
                  </View>
                </View>
              ))}
          </View>
        )}
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
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  errorText: {
    fontSize: 16,
    color: MODERN_COLORS.danger,
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
  },

  content: {
    flex: 1,
  },

  // CARDS
  resultadoCard: {
    backgroundColor: MODERN_COLORS.surface,
    margin: 20,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  statsCard: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  jugadoresCard: {
    backgroundColor: MODERN_COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  metaCard: {
    backgroundColor: MODERN_COLORS.surfaceGray,
    marginHorizontal: 20,
    marginBottom: 32,
    borderRadius: 12,
    padding: 16,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 16,
  },

  // RESULTADO
  equiposContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  equipoColumn: {
    flex: 1,
    alignItems: "center",
  },

  equipoLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textGray,
    fontWeight: "600",
    marginBottom: 4,
  },

  equipoNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    textAlign: "center",
  },

  resultadoContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
  },

  resultadoText: {
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 4,
  },

  partidoInfo: {
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
    paddingTop: 16,
    gap: 8,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  infoText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  // ESTADÍSTICAS
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },

  statItem: {
    alignItems: "center",
    gap: 8,
  },

  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: MODERN_COLORS.textDark,
  },

  statLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  tarjetaIcon: {
    width: 16,
    height: 24,
    borderRadius: 2,
  },

  // JUGADORES
  jugadorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  jugadorInfo: {
    flex: 1,
  },

  jugadorNombre: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 2,
  },

  jugadorMinutos: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
  },

  titularTag: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  jugadorStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  miniStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  miniStatText: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
  },

  miniTarjeta: {
    width: 12,
    height: 16,
    borderRadius: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tarjetaText: {
    fontSize: 10,
    fontWeight: "bold",
    color: MODERN_COLORS.textDark,
  },

  // META
  metaTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 4,
  },

  metaText: {
    fontSize: 12,
    color: MODERN_COLORS.textGray,
  },
});
