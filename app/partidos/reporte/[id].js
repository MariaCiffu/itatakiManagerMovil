// app/partidos/reporte/[id].js - Solo para CREAR reporte
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MODERN_COLORS } from "../../../src/constants/modernColors";
import {
  getPartidoById,
  createReportePartido,
} from "../../../src/services/partidosService";
import { getAllJugadores } from "../../../src/services/playersService";
import { useAuth } from "../../../src/hooks/useFirebase";

export default function CrearReporteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [partido, setPartido] = useState(null);
  const [jugadores, setJugadores] = useState([]);

  // Estado del reporte - versión simplificada
  const [reporteData, setReporteData] = useState({
    resultado: {
      golesLocal: 0,
      golesVisitante: 0,
    },
    jugadores: [], // Se inicializará con la alineación
  });

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

      if (!partidoData) {
        Alert.alert("Error", "Partido no encontrado");
        router.back();
        return;
      }

      // Verificar que no tenga ya un reporte
      if (partidoData.reportePartido?.completado) {
        Alert.alert("Error", "Este partido ya tiene un reporte completado");
        router.replace(`/partidos/reporte/ver/${id}`);
        return;
      }

      setPartido(partidoData);
      setJugadores(jugadoresData);

      // Inicializar jugadores basado en la alineación
      if (partidoData.alineacion) {
        const jugadoresIniciales = [];

        // Procesar titulares
        if (
          partidoData.alineacion.titulares &&
          Array.isArray(partidoData.alineacion.titulares)
        ) {
          partidoData.alineacion.titulares.forEach((playerObj) => {
            // Extraer ID del objeto jugador
            const playerId = playerObj?.id;
            if (playerId && typeof playerId === "string") {
              jugadoresIniciales.push({
                playerId,
                minutosJugados: 70,
                goles: 0,
                asistencias: 0,
                tarjetasAmarillas: 0,
                tarjetasRojas: 0,
                titular: true,
              });
            }
          });
        }

        // Procesar suplentes
        if (
          partidoData.alineacion.suplentes &&
          Array.isArray(partidoData.alineacion.suplentes)
        ) {
          partidoData.alineacion.suplentes.forEach((playerObj) => {
            // Extraer ID del objeto jugador
            const playerId = playerObj?.id;
            if (playerId && typeof playerId === "string") {
              jugadoresIniciales.push({
                playerId,
                minutosJugados: 0,
                goles: 0,
                asistencias: 0,
                tarjetasAmarillas: 0,
                tarjetasRojas: 0,
                titular: false,
              });
            }
          });
        }

        setReporteData((prev) => ({
          ...prev,
          jugadores: jugadoresIniciales,
        }));
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del partido");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getPlayerName = (playerId) => {
    // Primero buscar en jugadores regulares
    const player = jugadores.find((j) => j.id === playerId);
    if (player) return player.name;

    // Si no se encuentra, buscar en jugadores temporales
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

  const updateResultado = (campo, valor) => {
    setReporteData((prev) => ({
      ...prev,
      resultado: {
        ...prev.resultado,
        [campo]: parseInt(valor) || 0,
      },
    }));
  };

  const updateJugador = (index, campo, valor) => {
    setReporteData((prev) => ({
      ...prev,
      jugadores: prev.jugadores.map((jugador, i) =>
        i === index ? { ...jugador, [campo]: valor } : jugador
      ),
    }));
  };

  const guardarReporte = async () => {
    try {
      // Validación de consistencia de goles
      const misGoles =
        partido.lugar === "Casa"
          ? reporteData.resultado.golesLocal
          : reporteData.resultado.golesVisitante;

      const golesJugadores = reporteData.jugadores.reduce((total, jugador) => {
        return total + (jugador.goles || 0);
      }, 0);

      if (misGoles !== golesJugadores) {
        Alert.alert(
          "Inconsistencia en los goles",
          `Has marcado ${misGoles} goles en el resultado, pero los jugadores tienen asignados ${golesJugadores} goles.\n\n¿Quieres continuar de todas formas?`,
          [
            {
              text: "Cancelar",
              style: "cancel",
            },
            {
              text: "Revisar datos",
              style: "default",
            },
            {
              text: "Guardar así",
              style: "destructive",
              onPress: () => proceedToSave(),
            },
          ]
        );
        return;
      }

      // Si la validación pasa, guardar directamente
      proceedToSave();
    } catch (error) {
      console.error("Error al validar reporte:", error);
      Alert.alert("Error", "No se pudo validar el reporte");
    }
  };

  const proceedToSave = async () => {
    try {
      setSaving(true);

      const result = await createReportePartido(id, reporteData);

      if (result.success) {
        Alert.alert(
          "Reporte creado",
          "El reporte del partido se ha guardado correctamente",
          [
            {
              text: "Ver reporte",
              onPress: () => router.replace(`/partidos/reporte/ver/${id}`),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
        setSaving(false);
      }
    } catch (error) {
      console.error("Error al guardar reporte:", error);
      Alert.alert("Error", "No se pudo guardar el reporte");
      setSaving(false);
    }
  };

  if (loading) {
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
          <Text style={styles.headerTitle}>Crear reporte</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando datos del partido...</Text>
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
          <Text style={styles.headerTitle}>Error</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
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
        <Text style={styles.headerTitle}>Crear reporte</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info del partido */}
        <View style={styles.partidoInfo}>
          <Text style={styles.partidoTitulo}>
            {partido.tipoPartido === "amistoso"
              ? "Amistoso"
              : partido.tipoPartido === "torneo"
                ? `Torneo ${partido.jornada}`
                : `Jornada ${partido.jornada}`}
          </Text>
          <Text style={styles.partidoVs}>
            {partido.lugar === "Casa" ? user?.teamName : partido.rival} vs{" "}
            {partido.lugar === "Casa" ? partido.rival : user?.teamName}
          </Text>
          <Text style={styles.partidoFecha}>
            {new Date(partido.fecha).toLocaleDateString("es-ES")}
          </Text>
        </View>

        {/* Resultado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resultado del partido</Text>
          <View style={styles.resultadoContainer}>
            <View style={styles.equipoResultado}>
              <Text style={styles.equipoLabel}>
                {partido.lugar === "Casa" ? "LOCAL" : "VISITANTE"}
              </Text>
              <Text style={styles.equipoNombre}>
                {partido.lugar === "Casa" ? user?.teamName : partido.rival}
              </Text>
              <TextInput
                style={styles.golesInput}
                value={String(
                  partido.lugar === "Casa"
                    ? reporteData.resultado.golesLocal
                    : reporteData.resultado.golesVisitante
                )}
                onChangeText={(text) => {
                  const campo =
                    partido.lugar === "Casa" ? "golesLocal" : "golesVisitante";
                  updateResultado(campo, text);
                }}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <Text style={styles.vs}>VS</Text>

            <View style={styles.equipoResultado}>
              <Text style={styles.equipoLabel}>
                {partido.lugar === "Casa" ? "VISITANTE" : "LOCAL"}
              </Text>
              <Text style={styles.equipoNombre}>
                {partido.lugar === "Casa" ? partido.rival : user?.teamName}
              </Text>
              <TextInput
                style={styles.golesInput}
                value={String(
                  partido.lugar === "Casa"
                    ? reporteData.resultado.golesVisitante
                    : reporteData.resultado.golesLocal
                )}
                onChangeText={(text) => {
                  const campo =
                    partido.lugar === "Casa" ? "golesVisitante" : "golesLocal";
                  updateResultado(campo, text);
                }}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        </View>

        {/* Jugadores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Estadísticas básicas de jugadores
          </Text>

          {reporteData.jugadores && reporteData.jugadores.length > 0 ? (
            reporteData.jugadores
              .filter((jugador) => jugador && jugador.playerId) // Solo jugadores válidos
              .map((jugador, index) => (
                <View key={`jugador-${index}`} style={styles.jugadorCard}>
                  <View style={styles.jugadorHeader}>
                    <Text style={styles.jugadorNombre}>
                      {getPlayerName(jugador.playerId)}
                    </Text>
                    <View style={styles.jugadorTags}>
                      {jugador.titular && (
                        <View style={styles.titularTag}>
                          <Text style={styles.titularText}>T</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.jugadorStats}>
                    {/* Minutos */}
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Minutos</Text>
                      <TextInput
                        style={styles.statInput}
                        value={String(jugador.minutosJugados || 0)}
                        onChangeText={(text) =>
                          updateJugador(
                            index,
                            "minutosJugados",
                            parseInt(text) || 0
                          )
                        }
                        keyboardType="numeric"
                        placeholder="0"
                      />
                    </View>

                    {/* Goles */}
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Goles</Text>
                      <View style={styles.counterContainer}>
                        <TouchableOpacity
                          style={styles.counterButton}
                          onPress={() =>
                            updateJugador(
                              index,
                              "goles",
                              Math.max(0, (jugador.goles || 0) - 1)
                            )
                          }
                        >
                          <Ionicons name="remove" size={16} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.counterValue}>
                          {jugador.goles || 0}
                        </Text>
                        <TouchableOpacity
                          style={styles.counterButton}
                          onPress={() =>
                            updateJugador(
                              index,
                              "goles",
                              (jugador.goles || 0) + 1
                            )
                          }
                        >
                          <Ionicons name="add" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Tarjetas */}
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Tarjetas</Text>
                      <View style={styles.tarjetasContainer}>
                        <TouchableOpacity
                          style={[
                            styles.tarjetaButton,
                            { backgroundColor: "#FFD700" },
                            (jugador.tarjetasAmarillas || 0) > 0 &&
                              styles.tarjetaActive,
                          ]}
                          onPress={() => {
                            let nuevas = (jugador.tarjetasAmarillas || 0) + 1;
                            if (nuevas > 2) nuevas = 0; // reset después de 2
                            updateJugador(index, "tarjetasAmarillas", nuevas);
                          }}
                        >
                          {(jugador.tarjetasAmarillas || 0) > 0 && (
                            <Text style={styles.tarjetaText}>
                              {jugador.tarjetasAmarillas}
                            </Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[
                            styles.tarjetaButton,
                            { backgroundColor: "#DC3545" },
                            (jugador.tarjetasRojas || 0) > 0 &&
                              styles.tarjetaActive,
                          ]}
                          onPress={() => {
                            const nuevas =
                              (jugador.tarjetasRojas || 0) > 0 ? 0 : 1;
                            updateJugador(index, "tarjetasRojas", nuevas);
                            if (nuevas > 0) {
                              updateJugador(index, "tarjetasAmarillas", 0);
                            }
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))
          ) : (
            <View style={styles.noJugadoresContainer}>
              <Text style={styles.noJugadoresText}>
                No hay jugadores válidos en la alineación de este partido
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botón para guardar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.buttonDisabled]}
          onPress={guardarReporte}
          disabled={saving}
        >
          <LinearGradient
            colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
            style={styles.buttonGradient}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar reporte</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
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

  content: {
    flex: 1,
  },

  partidoInfo: {
    backgroundColor: MODERN_COLORS.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    alignItems: "center",
  },

  partidoTitulo: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.primary,
    marginBottom: 4,
  },

  partidoVs: {
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 4,
  },

  partidoFecha: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
  },

  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 16,
  },

  // RESULTADO
  resultadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  equipoResultado: {
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
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 12,
    textAlign: "center",
  },

  golesInput: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: MODERN_COLORS.background,
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: MODERN_COLORS.textDark,
  },

  vs: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textLight,
    marginHorizontal: 20,
  },

  // JUGADORES
  jugadorCard: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    marginBottom: 12,
  },

  jugadorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  jugadorNombre: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
  },

  jugadorTags: {
    flexDirection: "row",
  },

  titularTag: {
    backgroundColor: MODERN_COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  titularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },

  jugadorStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },

  statLabel: {
    fontSize: 12,
    color: MODERN_COLORS.textGray,
    marginBottom: 8,
  },

  statInput: {
    backgroundColor: MODERN_COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    minWidth: 50,
  },

  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  counterButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  counterValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: MODERN_COLORS.textDark,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: "center",
  },

  tarjetasContainer: {
    flexDirection: "row",
    gap: 6,
  },

  tarjetaButton: {
    width: 16,
    height: 20,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },

  tarjetaActive: {
    borderWidth: 2,
    borderColor: MODERN_COLORS.textDark,
  },

  tarjetaText: {
    fontSize: 10,
    fontWeight: "bold",
    color: MODERN_COLORS.textDark,
  },

  // ESTADO SIN JUGADORES
  noJugadoresContainer: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    alignItems: "center",
  },

  noJugadoresText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    textAlign: "center",
  },

  // BOTÓN
  buttonContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
    padding: 20,
  },

  saveButton: {
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

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
