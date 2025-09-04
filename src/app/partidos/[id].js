import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MODERN_COLORS } from "../../constants/modernColors";
import {
  getPartidoById,
  isPartidoJugado,
} from "../../services/partidosService";
import { getAllJugadores } from "../../services/playersService";
import { availableRoles } from "../../data/roles";
import { useAuth } from "../../hooks/useFirebase";

export default function DetallePartidoScreen() {
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
      // Cargar partido y jugadores en paralelo
      const [partidoData, jugadoresData] = await Promise.all([
        getPartidoById(id),
        getAllJugadores(),
      ]);

      if (partidoData) {
        setPartido(partidoData);
      } else {
        Alert.alert("Error", "Partido no encontrado");
        router.replace("/partidos");
        return;
      }

      setJugadores(jugadoresData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos");
      router.replace("/partidos");
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPartido = () => {
    router.push(`/partidos/editar/${id}`);
  };

  const handleVerAlineacion = () => {
    router.push(`/partidos/${id}/alineacion`);
  };

  // Función para obtener el nombre del jugador por ID
  const getPlayerNameById = (playerId) => {
    if (!playerId) return "No asignado";

    // Buscar en jugadores regulares
    const jugador = jugadores.find((player) => player.id === playerId);
    if (jugador) return jugador.name;

    // Si no se encuentra, buscar en jugadores temporales
    if (partido.alineacion && partido.alineacion.temporaryPlayers) {
      const tempPlayer = partido.alineacion.temporaryPlayers.find(
        (p) => p.id === playerId
      );
      if (tempPlayer) return tempPlayer.name;
    }

    return "No asignado";
  };

  // Función para renderizar el indicador de rol
  const renderRoleIndicator = (role) => {
    if (role.type === "icon") {
      return (
        <View
          style={[styles.roleBadge, { backgroundColor: role.backgroundColor }]}
        >
          <Ionicons
            name={role.icon.replace("-outline", "")}
            size={12}
            color={role.iconColor || "#FFFFFF"}
          />
        </View>
      );
    } else if (role.type === "letter") {
      return (
        <View
          style={[styles.roleBadge, { backgroundColor: role.backgroundColor }]}
        >
          <Text style={[styles.roleBadgeText, { color: role.letterColor }]}>
            {role.letter}
          </Text>
        </View>
      );
    }
    return null;
  };

  // Función para generar convocatoria
  const handleGenerarConvocatoria = () => {
    if (!partido) return;

    try {
      // Formatear fecha en formato DD/MM/YYYY
      const fechaFormateada = partido.fecha.toLocaleDateString("es-ES");
      const horaFormateada = partido.fecha.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });

      // Determinar lugar específico
      const lugarEspecifico =
        partido.lugar === "Casa" ? user?.homeField : partido.lugarEspecifico;

      // Crear objeto con los datos a pasar
      const datosConvocatoria = {
        fecha: fechaFormateada,
        hora: horaFormateada,
        lugar: lugarEspecifico,
        rival: partido.rival,
        tipoPartido: partido.tipoPartido,
        jornada: partido.jornada,
        nombreTorneo: partido.tipoPartido === "torneo" ? partido.jornada : "",
        // Si hay alineación, pasar los jugadores seleccionados
        jugadoresSeleccionados: partido.alineacion
          ? {
              titulares:
                partido.alineacion.titulares?.map((j) =>
                  typeof j === "string" ? j : j.id
                ) || [],
              suplentes:
                partido.alineacion.suplentes?.map((j) =>
                  typeof j === "string" ? j : j.id
                ) || [],
            }
          : {},
        // Añadir los jugadores temporales
        temporaryPlayers: partido.alineacion?.temporaryPlayers || [],
      };

      // Navegar a la pantalla de convocatoria
      router.push({
        pathname: "/convocatorias",
        params: { datosPartido: JSON.stringify(datosConvocatoria) },
      });
    } catch (error) {
      console.error("Error al preparar datos para convocatoria:", error);
      Alert.alert(
        "Error",
        "No se pudieron preparar los datos para la convocatoria"
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.replace("/partidos")}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={MODERN_COLORS.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Cargando partido...</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando partido...</Text>
        </View>
      </View>
    );
  }

  if (!partido) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={MODERN_COLORS.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Partido no encontrado</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
    );
  }

  const esLocal = partido.lugar === "Casa";
  const hayNotas = partido.estrategia || partido.notasRival;
  const hayRolesEspeciales =
    partido.alineacion &&
    partido.alineacion.specialRoles &&
    Object.values(partido.alineacion.specialRoles).some(
      (role) => role !== null
    );

  const getResultadoTexto = () => {
    if (!partido?.reportePartido?.resultado) return "N/A";

    const { golesLocal, golesVisitante } = partido.reportePartido.resultado;

    return `${golesLocal} - ${golesVisitante}`; // LOCAL - VISITANTE
  };

  const getResultadoColor = () => {
    if (!partido?.reportePartido?.resultado) return MODERN_COLORS.textGray;

    const { golesLocal, golesVisitante } = partido.reportePartido.resultado;
    const esLocal = partido.lugar === "Casa";

    const misGoles = esLocal ? golesLocal : golesVisitante;
    const golesRival = esLocal ? golesVisitante : golesLocal;

    if (misGoles > golesRival) return MODERN_COLORS.success;
    if (misGoles === golesRival) return MODERN_COLORS.accent;
    return MODERN_COLORS.danger;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={MODERN_COLORS.textDark}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>
            {partido.tipoPartido === "liga"
              ? `Jornada ${partido.jornada}`
              : partido.tipoPartido === "torneo"
                ? `Torneo ${partido.jornada}`
                : "Amistoso"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleEditarPartido}
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
        {/* Información compacta del partido */}
        <View style={styles.mainCard}>
          {/* Equipos */}
          <View style={styles.equiposContainer}>
            <View style={styles.equipoInfo}>
              <Text style={styles.equipoNombre}>
                {esLocal ? user?.teamName : partido.rival}
              </Text>
            </View>

            {partido &&
            partido.reportePartido &&
            partido.reportePartido.completado ? (
              <View style={styles.resultadoContainer}>
                <Text
                  style={[styles.resultadoText, { color: getResultadoColor() }]}
                >
                  {getResultadoTexto()}
                </Text>
              </View>
            ) : (
              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>VS</Text>
              </View>
            )}

            <View style={styles.equipoInfo}>
              <Text style={styles.equipoNombre}>
                {esLocal ? partido.rival : user?.teamName}
              </Text>
            </View>
          </View>

          {/* Información en columna vertical */}
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={MODERN_COLORS.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha y hora</Text>
                <Text style={styles.infoValue}>
                  {partido.fecha.toLocaleDateString("es-ES")} •{" "}
                  {partido.fecha.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name={esLocal ? "home-outline" : "location-outline"}
                size={18}
                color={MODERN_COLORS.primary}
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Lugar</Text>
                <Text style={styles.infoValue}>
                  {esLocal ? user?.homeField : partido.lugarEspecifico}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Alineación */}
        <View style={styles.section}>
          {partido.alineacion ? (
            <View style={styles.alineacionCard}>
              <View style={styles.alineacionHeader}>
                <View style={styles.alineacionInfo}>
                  <Text style={styles.alineacionTitle}>
                    Alineación configurada
                  </Text>
                </View>
                <View style={styles.formacionBadge}>
                  <Text style={styles.formacionText}>
                    {partido.alineacion.formacion}
                  </Text>
                </View>
              </View>

              <View style={styles.alineacionStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {partido.alineacion.titulares?.length}
                  </Text>
                  <Text style={styles.statLabel}>Titulares</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {partido.alineacion.suplentes?.length}
                  </Text>
                  <Text style={styles.statLabel}>Suplentes</Text>
                </View>
              </View>

              {/* Roles especiales compactos */}
              {hayRolesEspeciales && (
                <View style={styles.rolesContainer}>
                  <Text style={styles.rolesTitle}>Roles especiales</Text>
                  <View style={styles.rolesList}>
                    {availableRoles.map((role) => {
                      const playerId =
                        partido.alineacion.specialRoles?.[role.id];
                      if (!playerId) return null;

                      return (
                        <View style={styles.roleItem} key={role.id}>
                          {renderRoleIndicator(role)}
                          <Text style={styles.roleText}>
                            {role.name}: {getPlayerNameById(playerId)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.verAlineacionButton}
                onPress={handleVerAlineacion}
                activeOpacity={0.8}
              >
                <Ionicons name="eye-outline" size={20} />
                <Text style={styles.verAlineacionText}>
                  Ver alineación completa
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.noAlineacionCard}>
              <Ionicons
                name="people-outline"
                size={48}
                color={MODERN_COLORS.textLight}
              />
              <Text style={styles.noAlineacionTitle}>Sin alineación</Text>
              <Text style={styles.noAlineacionText}>
                No hay alineación configurada para este partido
              </Text>
            </View>
          )}
        </View>

        {/* Notas compactas */}
        {hayNotas && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <View style={styles.notasCard}>
              {partido.estrategia && (
                <View style={styles.notaSection}>
                  <View style={styles.notaHeader}>
                    <Ionicons
                      name="bulb-outline"
                      size={16}
                      color={MODERN_COLORS.accent}
                    />
                    <Text style={styles.notaTitle}>Estrategia</Text>
                  </View>
                  <Text style={styles.notaText}>{partido.estrategia}</Text>
                </View>
              )}

              {partido.notasRival && (
                <View
                  style={[
                    styles.notaSection,
                    partido.estrategia && styles.notaSectionBorder,
                  ]}
                >
                  <View style={styles.notaHeader}>
                    <Ionicons
                      name="shield-outline"
                      size={16}
                      color={MODERN_COLORS.primary}
                    />
                    <Text style={styles.notaTitle}>Sobre el rival</Text>
                  </View>
                  <Text style={styles.notaText}>{partido.notasRival}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Acciones */}
        <View style={styles.actionsSection}>
          {/* Botón para generar convocatoria */}
          <TouchableOpacity
            style={styles.convocatoriaButton}
            onPress={handleGenerarConvocatoria}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
              style={styles.buttonGradient}
            >
              <Ionicons name="megaphone-outline" size={20} color="#fff" />
              <Text style={styles.convocatoriaText}>Generar convocatoria</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Botón para crear reporte - solo si el partido ya se jugó y no tiene reporte */}
          {partido &&
            partido.fecha &&
            isPartidoJugado(partido.fecha) &&
            (!partido.reportePartido || !partido.reportePartido.completado) && (
              <TouchableOpacity
                style={styles.reporteButton}
                onPress={() => router.push(`/partidos/reporte/${id}`)}
                activeOpacity={0.8}
              >
                <Ionicons name="clipboard-outline" size={20} color="#fff" />
                <Text style={styles.reporteText}>Completar post partido</Text>
              </TouchableOpacity>
            )}

          {/* Botón para ver reporte - solo si ya tiene reporte completado */}
          {partido &&
            partido.reportePartido &&
            partido.reportePartido.completado && (
              <TouchableOpacity
                style={styles.verReporteButton}
                onPress={() => router.push(`/partidos/reporte/ver/${id}`)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                />
                <Text style={styles.verReporteText}>Post partido</Text>
              </TouchableOpacity>
            )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // HEADER
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

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  editHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.primary + "20",
    justifyContent: "center",
    alignItems: "center",
  },

  // LOADING
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

  // CONTENT
  content: {
    flex: 1,
  },

  // CARD PRINCIPAL COMPACTA
  mainCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    margin: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  equiposContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  equipoInfo: {
    flex: 1,
    alignItems: "center",
  },

  equipoNombre: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    textAlign: "center",
  },

  localBadge: {
    backgroundColor: MODERN_COLORS.success,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  visitanteBadge: {
    backgroundColor: MODERN_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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

  vsContainer: {
    paddingHorizontal: 20,
  },

  vsText: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textLight,
    letterSpacing: 1,
  },

  // INFO LIST VERTICAL
  infoList: {
    gap: 16,
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 15,
    color: MODERN_COLORS.textDark,
    fontWeight: "600",
  },

  // SECCIONES
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  // ALINEACIÓN
  alineacionCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  alineacionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  alineacionInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  alineacionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
  },

  formacionBadge: {
    backgroundColor: MODERN_COLORS.primary + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  formacionText: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

  alineacionStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
  },

  statLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: MODERN_COLORS.border,
  },

  // ROLES COMPACTOS
  rolesContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },

  rolesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textGray,
    marginBottom: 8,
  },

  rolesList: {
    gap: 6,
  },

  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  roleBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  roleBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },

  roleText: {
    fontSize: 13,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  verAlineacionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: MODERN_COLORS.primary,
  },

  verAlineacionText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // SIN ALINEACIÓN
  noAlineacionCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    borderStyle: "dashed",
  },

  noAlineacionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginTop: 12,
    marginBottom: 4,
  },

  noAlineacionText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    textAlign: "center",
    lineHeight: 20,
  },

  // NOTAS COMPACTAS
  notasCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  notaSection: {
    marginBottom: 12,
  },

  notaSectionBorder: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
  },

  notaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },

  notaTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
  },

  notaText: {
    fontSize: 14,
    color: MODERN_COLORS.textDark,
    lineHeight: 18,
  },

  // ACCIONES
  actionsSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },

  convocatoriaButton: {
    borderRadius: 12,
    overflow: "hidden",
  },

  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },

  convocatoriaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  //Reporte
  reporteButton: {
    backgroundColor: MODERN_COLORS.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },

  reporteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  verReporteButton: {
    backgroundColor: MODERN_COLORS.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },

  verReporteText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
