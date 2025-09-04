import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { MODERN_COLORS } from "../../constants/modernColors";
import { getAllPartidos, searchPartidos } from "../../services/partidosService";
import { useAuth } from "../../hooks/useFirebase";

export default function PartidosScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [partidos, setPartidos] = useState([]);
  const [filteredPartidos, setFilteredPartidos] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar partidos cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      const loadPartidos = async () => {
        try {
          setIsLoading(true);
          setError(null);
          const data = await getAllPartidos();
          setPartidos(data);
          setFilteredPartidos(data);
        } catch (error) {
          console.error("Error al cargar partidos:", error);
          setError("No se pudieron cargar los partidos");
        } finally {
          setIsLoading(false);
        }
      };

      loadPartidos();
    }, [])
  );

  // Función de búsqueda
  const handleSearch = useCallback(
    async (query) => {
      setSearchQuery(query);

      if (query.trim() === "") {
        setFilteredPartidos(partidos);
      } else {
        try {
          const results = await searchPartidos(query);
          setFilteredPartidos(results);
        } catch (error) {
          console.error("Error en búsqueda:", error);
          setFilteredPartidos([]);
        }
      }
    },
    [partidos]
  );

  const navigateToPartidoDetail = useCallback(
    (partidoId) => {
      router.push(`/partidos/${partidoId}`);
    },
    [router]
  );

  const navigateToCrearPartido = useCallback(() => {
    router.push("/partidos/add-partido");
  }, [router]);

  // Función para formatear fecha
  const formatDate = useCallback((fecha) => {
    if (!fecha) return "";
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }, []);

  // Función para formatear hora
  const formatTime = useCallback((fecha) => {
    if (!fecha) return "";
    const date = fecha instanceof Date ? fecha : new Date(fecha);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Función para determinar si un partido ya se jugó
  const isPartidoJugado = useCallback((fecha) => {
    const now = new Date();
    const partidoDate = fecha instanceof Date ? fecha : new Date(fecha);
    return partidoDate < now;
  }, []);

  const renderPartido = useCallback(
    ({ item }) => {
      const jugado = isPartidoJugado(item.fecha);
      const esLocal = item.lugar === "Casa";
      const tieneReporte = item.reportePartido?.completado;

      // Función para obtener el resultado del reporte

      const getResultadoTexto = () => {
        if (!tieneReporte || !item.reportePartido?.resultado) return null;

        const { golesLocal, golesVisitante } = item.reportePartido.resultado;

        return `${golesLocal}-${golesVisitante}`; // ← LOCAL - VISITANTE
      };

      // Función para obtener el color del resultado
      const getResultadoColor = () => {
        if (!tieneReporte || !item.reportePartido?.resultado) return null;

        const { golesLocal, golesVisitante } = item.reportePartido.resultado;
        const misGoles = esLocal ? golesLocal : golesVisitante;
        const golesRival = esLocal ? golesVisitante : golesLocal;

        if (misGoles > golesRival) return MODERN_COLORS.success + "20"; // Victoria
        if (misGoles === golesRival) return MODERN_COLORS.accent + "20"; // Empate
        return MODERN_COLORS.danger + "20"; // Derrota
      };

      // Función para obtener el color del texto del resultado
      const getResultadoTextColor = () => {
        if (!tieneReporte || !item.reportePartido?.resultado) return null;

        const { golesLocal, golesVisitante } = item.reportePartido.resultado;
        const misGoles = esLocal ? golesLocal : golesVisitante;
        const golesRival = esLocal ? golesVisitante : golesLocal;

        if (misGoles > golesRival) return MODERN_COLORS.success; // Victoria
        if (misGoles === golesRival) return MODERN_COLORS.accent; // Empate
        return MODERN_COLORS.danger; // Derrota
      };

      const resultadoTexto = getResultadoTexto();
      const resultadoColor = getResultadoColor();
      const resultadoTextColor = getResultadoTextColor();

      return (
        <TouchableOpacity
          style={styles.partidoCard}
          onPress={() => navigateToPartidoDetail(item.id)}
          activeOpacity={0.8}
        >
          {/* Header del partido */}
          <View style={styles.partidoHeader}>
            <View style={styles.partidoInfo}>
              <Text style={styles.tipoPartido}>
                {item.tipoPartido === "amistoso"
                  ? "Amistoso"
                  : item.tipoPartido === "torneo"
                    ? `${item.jornada}`
                    : `Jornada ${item.jornada}`}
              </Text>
              <View style={styles.fechaHoraContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={MODERN_COLORS.textGray}
                />
                <Text style={styles.fechaText}>{formatDate(item.fecha)}</Text>
                <Ionicons
                  name="time-outline"
                  size={14}
                  color={MODERN_COLORS.textGray}
                  style={{ marginLeft: 8 }}
                />
                <Text style={styles.horaText}>{formatTime(item.fecha)}</Text>
              </View>
            </View>

            <View
              style={[
                styles.estadoBadge,
                !jugado
                  ? styles.estadoPendiente
                  : resultadoTexto
                    ? { backgroundColor: resultadoColor }
                    : styles.estadoJugado,
              ]}
            >
              <Text
                style={[
                  styles.estadoText,
                  !jugado
                    ? styles.estadoPendienteText
                    : resultadoTexto
                      ? { color: resultadoTextColor }
                      : styles.estadoJugadoText,
                ]}
              >
                {!jugado
                  ? "Pendiente"
                  : resultadoTexto
                    ? resultadoTexto
                    : "Jugado"}
              </Text>
            </View>
          </View>

          {/* Contenido del partido */}
          <View style={styles.partidoContent}>
            <View style={styles.equiposContainer}>
              {/* Equipo local/visitante izquierdo */}
              <View style={styles.equipoInfo}>
                <Text style={styles.equipoNombre} numberOfLines={2}>
                  {esLocal ? user?.teamName : item.rival}
                </Text>
              </View>

              {/* VS */}
              <View style={styles.vsContainer}>
                <Text style={styles.vsText}>VS</Text>
              </View>

              {/* Equipo local/visitante derecho */}
              <View style={styles.equipoInfo}>
                <Text style={styles.equipoNombre} numberOfLines={2}>
                  {esLocal ? item.rival : user?.teamName}
                </Text>
              </View>
            </View>

            {/* Información adicional */}
            <View style={styles.partidoFooter}>
              <View style={styles.lugarContainer}>
                <Ionicons
                  name={esLocal ? "home-outline" : "airplane"}
                  size={16}
                  color={MODERN_COLORS.textGray}
                />
                <Text style={styles.lugarText}>
                  {esLocal
                    ? `Local • ${user?.homeField}`
                    : `Visitante • ${item.lugarEspecifico}`}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={MODERN_COLORS.textLight}
              />
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigateToPartidoDetail, formatDate, formatTime, isPartidoJugado, user]
  );

  if (isLoading) {
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
          <Text style={styles.title}>Partidos</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando partidos...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/partidos")}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={MODERN_COLORS.textDark}
            />
          </TouchableOpacity>
          <Text style={styles.title}>Partidos</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={MODERN_COLORS.danger}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              // Recargar
            }}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header moderno */}
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
          <Text style={styles.title}>Partidos</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color={MODERN_COLORS.textGray}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar partidos..."
            placeholderTextColor={MODERN_COLORS.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={MODERN_COLORS.textGray}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de partidos */}
      <FlatList
        data={filteredPartidos}
        renderItem={renderPartido}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="football-outline"
              size={64}
              color={MODERN_COLORS.textLight}
            />
            <Text style={styles.emptyTitle}>No hay partidos</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? "No se encontraron resultados"
                : "Añade tu primer partido"}
            </Text>
            {!searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={navigateToCrearPartido}
              >
                <Text style={styles.emptyButtonText}>Añadir partido</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Botón flotante */}
      {!isLoading && (
        <TouchableOpacity
          style={styles.fab}
          onPress={navigateToCrearPartido}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={MODERN_COLORS.textWhite} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // HEADER MODERNO
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
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  // BÚSQUEDA
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  // LOADING Y ERROR
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
    paddingHorizontal: 32,
    gap: 16,
  },

  errorText: {
    fontSize: 16,
    color: MODERN_COLORS.danger,
    textAlign: "center",
    marginTop: 16,
  },

  retryButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },

  retryButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },

  // LISTA
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  // TARJETA DE PARTIDO
  partidoCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  partidoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  partidoInfo: {
    flex: 1,
  },

  tipoPartido: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 4,
  },

  fechaHoraContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  fechaText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
    marginLeft: 4,
  },

  horaText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
    marginLeft: 4,
  },

  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },

  estadoPendiente: {
    backgroundColor: MODERN_COLORS.accent + "20",
  },

  estadoJugado: {
    backgroundColor: MODERN_COLORS.success + "20",
  },

  estadoText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  estadoPendienteText: {
    color: MODERN_COLORS.accent,
  },

  estadoJugadoText: {
    color: MODERN_COLORS.success,
  },

  // CONTENIDO DEL PARTIDO
  partidoContent: {
    padding: 16,
  },

  equiposContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  equipoInfo: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },

  equipoNombre: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    textAlign: "center",
    marginBottom: 4,
  },

  localBadge: {
    backgroundColor: MODERN_COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  visitanteBadge: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  vsContainer: {
    paddingHorizontal: 20,
  },

  vsText: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.textLight,
    letterSpacing: 1,
  },

  // FOOTER DEL PARTIDO
  partidoFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  lugarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  lugarText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  alineacionIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  alineacionText: {
    fontSize: 12,
    color: MODERN_COLORS.success,
    fontWeight: "600",
  },

  // ESTADO VACÍO
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginTop: 16,
  },

  emptySubtitle: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    textAlign: "center",
    marginBottom: 24,
  },

  emptyButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
