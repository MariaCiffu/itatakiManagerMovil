// app/jugadores/[id]/estadisticas.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGlobalSearchParams } from "expo-router";
import {
  AlertIcon,
  CalendarIcon,
  ClockIcon,
  TrophyIcon,
  SoccerBallIcon,
} from "../../../components/Icons";
import { MODERN_COLORS } from "../../../constants/modernColors";
import { getEstadisticasJugadorDesdeReportes } from "../../../services/playersService";

export default function Estadisticas() {
  const { id: jugadorId } = useGlobalSearchParams();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("🔥 useEffect ejecutado en estadisticas.js");
    console.log("   - jugadorId recibido:", jugadorId);
    console.log("   - tipo de jugadorId:", typeof jugadorId);

    const loadEstadisticas = async () => {
      try {
        console.log("🔄 Iniciando loadEstadisticas...");
        setLoading(true);
        setError(null);

        console.log("🔄 Llamando a getEstadisticasJugadorDesdeReportes...");
        const stats = await getEstadisticasJugadorDesdeReportes(jugadorId);

        console.log("✅ Estadísticas recibidas:", stats);
        setEstadisticas(stats);
      } catch (error) {
        console.error("❌ Error en loadEstadisticas:", error);
        setError("No se pudieron cargar las estadísticas: " + error.message);
      } finally {
        console.log("🔄 Finalizando loadEstadisticas - setLoading(false)");
        setLoading(false);
      }
    };

    if (jugadorId) {
      console.log("✅ jugadorId existe, ejecutando loadEstadisticas");
      loadEstadisticas();
    } else {
      console.log("❌ No hay jugadorId, no se ejecuta loadEstadisticas");
    }
  }, [jugadorId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Cargando estadísticas...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <View
          style={[
            styles.headerIndicator,
            { backgroundColor: MODERN_COLORS.primary },
          ]}
        />
        <Text style={styles.title}>Estadísticas</Text>
      </View>

      {/* Principales estadísticas - 2 por fila, mismo tamaño */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={<SoccerBallIcon color="#FFD700" />}
          label="Goles"
          value={estadisticas?.goles?.toString() || "0"}
          gradientColors={[
            `${MODERN_COLORS.primary}20`,
            `${MODERN_COLORS.primaryDark}20`,
          ]}
          accentColor={MODERN_COLORS.primary}
        />
        <StatCard
          icon={<CalendarIcon color={MODERN_COLORS.accent} />}
          label="Partidos jugados"
          value={estadisticas?.partidosJugados?.toString() || "0"}
          gradientColors={[
            `${MODERN_COLORS.accent}20`,
            `${MODERN_COLORS.accent}20`,
          ]}
          accentColor={MODERN_COLORS.accent}
        />
        <StatCard
          icon={<ClockIcon color={MODERN_COLORS.success} />}
          label="Minutos jugados"
          value={estadisticas?.minutosJugados?.toString() || "0"}
          gradientColors={[
            `${MODERN_COLORS.success}20`,
            `${MODERN_COLORS.success}20`,
          ]}
          accentColor={MODERN_COLORS.success}
        />
        <StatCard
          icon={<TrophyIcon color={MODERN_COLORS.secondary} />}
          label="Promedio minutos"
          value={
            estadisticas?.partidosJugados > 0
              ? Math.round(
                  estadisticas.minutosJugados / estadisticas.partidosJugados
                ).toString()
              : "0"
          }
          gradientColors={[
            `${MODERN_COLORS.secondary}20`,
            `${MODERN_COLORS.secondary}20`,
          ]}
          accentColor={MODERN_COLORS.secondary}
        />
      </View>

      {/* Tarjetas y Participación - mismo tamaño */}
      <View style={styles.statsRow}>
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[MODERN_COLORS.surface, MODERN_COLORS.surfaceGray]}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardHeaderIcon,
                  { backgroundColor: `${MODERN_COLORS.danger}20` },
                ]}
              >
                <AlertIcon color={MODERN_COLORS.danger} />
              </View>
              <Text style={styles.cardTitle}>Tarjetas</Text>
            </View>
            <View style={styles.tarjetasContainer}>
              <View style={styles.tarjetaItem}>
                <View
                  style={[
                    styles.tarjetaIndicator,
                    { backgroundColor: "#FFD700" },
                  ]}
                />
                <Text style={styles.tarjetaValue}>
                  {estadisticas?.tarjetasAmarillas || 0}
                </Text>
                <Text style={styles.tarjetaLabel}>Amarillas</Text>
              </View>
              <View style={styles.tarjetaDivider} />
              <View style={styles.tarjetaItem}>
                <View
                  style={[
                    styles.tarjetaIndicator,
                    { backgroundColor: MODERN_COLORS.danger },
                  ]}
                />
                <Text style={styles.tarjetaValue}>
                  {estadisticas?.tarjetasRojas || 0}
                </Text>
                <Text style={styles.tarjetaLabel}>Rojas</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.cardContainer}>
          <LinearGradient
            colors={[MODERN_COLORS.surface, MODERN_COLORS.surfaceGray]}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.cardHeaderIcon,
                  { backgroundColor: `${MODERN_COLORS.primary}20` },
                ]}
              >
                <TrophyIcon color={MODERN_COLORS.primary} />
              </View>
              <Text style={styles.cardTitle}>Participación</Text>
            </View>
            <View style={styles.tarjetasContainer}>
              <View style={styles.tarjetaItem}>
                <Text style={styles.tarjetaValue}>
                  {estadisticas?.partidosTitular || 0}
                </Text>
                <Text style={styles.tarjetaLabel}>Titular</Text>
              </View>
              <View style={styles.tarjetaDivider} />
              <View style={styles.tarjetaItem}>
                <Text style={styles.tarjetaValue}>
                  {estadisticas?.partidosSuplente || 0}
                </Text>
                <Text style={styles.tarjetaLabel}>Suplente</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Porcentaje de participación como titular */}
      <View style={styles.fullWidthCard}>
        <LinearGradient
          colors={[MODERN_COLORS.surface, MODERN_COLORS.surfaceGray]}
          style={styles.cardGradient}
        >
          <View style={styles.presenciaContainer}>
            <View style={styles.presenciaCircleContainer}>
              <View style={styles.presenciaCircleBackground} />
              <View
                style={[
                  styles.presenciaCircleForeground,
                  { borderColor: MODERN_COLORS.success },
                ]}
              />
              <Text style={styles.presenciaValue}>
                {estadisticas?.partidosJugados > 0
                  ? Math.round(
                      (estadisticas.partidosTitular /
                        estadisticas.partidosJugados) *
                        100
                    )
                  : 0}
                %
              </Text>
            </View>
            <Text style={styles.presenciaLabel}>Porcentaje como titular</Text>
          </View>
        </LinearGradient>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, gradientColors, accentColor }) {
  return (
    <View style={styles.statCardContainer}>
      <LinearGradient colors={gradientColors} style={styles.statCardGradient}>
        <View style={styles.statCardContent}>
          <View style={[styles.statCardIcon, { borderColor: accentColor }]}>
            {icon}
          </View>
          <Text style={styles.statCardLabel}>{label}</Text>
          <Text style={[styles.statCardValue, { color: accentColor }]}>
            {value}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
    padding: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
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
    backgroundColor: MODERN_COLORS.background,
    padding: 20,
  },

  errorText: {
    fontSize: 16,
    color: MODERN_COLORS.danger,
    textAlign: "center",
    fontWeight: "500",
  },

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    color: MODERN_COLORS.textDark,
    fontWeight: "bold",
    flex: 1,
  },

  // Grid de estadísticas
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statCardContainer: {
    width: "48%",
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    height: 140,
  },

  statCardGradient: {
    borderRadius: 16,
    padding: 1,
    height: "100%",
  },

  statCardContent: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 15,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },

  statCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  statCardLabel: {
    color: MODERN_COLORS.textGray,
    fontSize: 13,
    marginBottom: 6,
    textAlign: "center",
  },

  statCardValue: {
    fontSize: 22,
    fontWeight: "bold",
  },

  // Tarjetas y Participación
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  cardContainer: {
    width: "48%",
    borderRadius: 16,
    overflow: "hidden",
    height: 140,
  },

  fullWidthCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },

  cardGradient: {
    borderRadius: 16,
    padding: 1,
    height: "100%",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 12,
  },

  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },

  cardTitle: {
    color: MODERN_COLORS.textDark,
    fontSize: 14,
    fontWeight: "600",
  },

  // Tarjetas
  tarjetasContainer: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    padding: 16,
    flex: 1,
  },

  tarjetaItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tarjetaDivider: {
    width: 1,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: 8,
  },

  tarjetaIndicator: {
    width: 16,
    height: 24,
    borderRadius: 2,
    marginBottom: 8,
  },

  tarjetaValue: {
    color: MODERN_COLORS.textDark,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },

  tarjetaLabel: {
    color: MODERN_COLORS.textGray,
    fontSize: 12,
  },

  // Presencia
  presenciaContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-around",
  },

  presenciaCircleContainer: {
    position: "relative",
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  presenciaCircleBackground: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderColor: MODERN_COLORS.border,
  },

  presenciaCircleForeground: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 8,
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },

  presenciaValue: {
    color: MODERN_COLORS.textDark,
    fontSize: 18,
    fontWeight: "bold",
  },

  presenciaLabel: {
    color: MODERN_COLORS.textGray,
    fontSize: 16,
    textAlign: "center",
    flex: 1,
    marginLeft: 16,
  },
});
