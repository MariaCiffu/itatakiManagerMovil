import { useState, useCallback, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useGlobalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getMultasJugador,
  updateMultaStatus,
  deleteMultaFromJugador,
} from "../../../services/playersService";
import { CheckIcon, ClockIcon, EditIcon } from "../../../components/Icons";
import { MODERN_COLORS } from "../../../constants/modernColors";

export default function Multas() {
  const router = useRouter();
  const params = useGlobalSearchParams();
  const playerId = params.id; // 🆕 OBTENER ID DEL GLOBAL PARAMS

  const [selectedMulta, setSelectedMulta] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [multas, setMultas] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMultas, setIsLoadingMultas] = useState(true);

  // 🔥 CARGAR MULTAS DESDE FIREBASE
  useFocusEffect(
    useCallback(() => {
      const loadMultas = async () => {
        if (!playerId) {
          console.log("❌ No hay ID de jugador para cargar multas");
          setIsLoadingMultas(false);
          return;
        }

        try {
          setIsLoadingMultas(true);
          console.log("📄 Cargando multas desde Firebase:", playerId);

          const multasData = await getMultasJugador(playerId);
          console.log("✅ Multas cargadas:", multasData.length);

          setMultas(multasData);
        } catch (error) {
          console.error("❌ Error cargando multas:", error);
          setMultas([]);
        } finally {
          setIsLoadingMultas(false);
        }
      };

      loadMultas();
    }, [playerId])
  );

  // Función optimizada para añadir multa
  const handleAddMulta = useCallback(() => {
    if (!playerId) {
      Alert.alert("Error", "No se pudo identificar el jugador");
      return;
    }

    router.push({
      pathname: "/jugadores/add-multa",
      params: { jugadorId: playerId },
    });
  }, [playerId, router]);

  // Función optimizada para manejar el press en una multa
  const handleMultaPress = useCallback((multa) => {
    setSelectedMulta(multa);
    setShowActionModal(true);
  }, []);

  // Función optimizada para editar multa
  const handleEditMulta = useCallback(() => {
    if (!selectedMulta || !playerId) {
      Alert.alert("Error", "No se pudo identificar la multa o el jugador");
      return;
    }

    setShowActionModal(false);
    router.push({
      pathname: `/jugadores/edit-multa`,
      params: {
        multaData: JSON.stringify(selectedMulta),
        jugadorId: playerId,
      },
    });
  }, [selectedMulta, playerId, router]);

  // Cambiar estado de la multa
  const handleTogglePagado = useCallback(async () => {
    if (!selectedMulta || !selectedMulta.id) {
      Alert.alert("Error", "No se pudo identificar la multa");
      return;
    }

    setShowActionModal(false);
    setIsLoading(true);

    try {
      console.log("📄 Actualizando estado de multa:", selectedMulta.id);

      const result = await updateMultaStatus(
        selectedMulta.id,
        !selectedMulta.paid
      );

      if (result.success) {
        console.log("✅ Estado de multa actualizado");

        // Actualizar el estado local
        setMultas((prevMultas) =>
          prevMultas.map((m) =>
            m.id === selectedMulta.id ? { ...m, paid: !m.paid } : m
          )
        );

        Alert.alert(
          "Estado actualizado",
          `Multa marcada como ${!selectedMulta.paid ? "pagada" : "pendiente"}`
        );
      } else {
        Alert.alert(
          "Error",
          result.message || "No se pudo actualizar el estado de la multa"
        );
      }
    } catch (error) {
      console.error("❌ Error al actualizar estado:", error);
      Alert.alert("Error", "Ocurrió un error al actualizar el estado");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMulta]);

  //ELIMINAR MULTA
  const handleDeleteMulta = useCallback(() => {
    if (!selectedMulta || !selectedMulta.id) {
      Alert.alert("Error", "No se pudo identificar la multa");
      return;
    }

    setShowActionModal(false);

    Alert.alert(
      "Eliminar multa",
      "¿Estás seguro de que quieres eliminar esta multa?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            setIsLoading(true);

            try {
              console.log("🗑️ Eliminando multa:", selectedMulta.id);

              const result = await deleteMultaFromJugador(selectedMulta.id);

              if (result.success) {
                console.log("✅ Multa eliminada");

                // Actualizar el estado local
                setMultas((prevMultas) =>
                  prevMultas.filter((m) => m.id !== selectedMulta.id)
                );

                Alert.alert(
                  "Multa eliminada",
                  "La multa ha sido eliminada correctamente"
                );
              } else {
                Alert.alert(
                  "Error",
                  result.message || "No se pudo eliminar la multa"
                );
              }
            } catch (error) {
              console.error("❌ Error al eliminar multa:", error);
              Alert.alert("Error", "Ocurrió un error al eliminar la multa");
            } finally {
              setIsLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  }, [selectedMulta]);

  // Cálculos optimizados con useMemo
  const { totalMultas, importeTotal, importePendiente } = useMemo(() => {
    return {
      totalMultas: multas.length,
      importeTotal: multas.reduce((sum, multa) => sum + (multa.amount || 0), 0),
      importePendiente: multas
        .filter((multa) => !multa.paid)
        .reduce((sum, multa) => sum + (multa.amount || 0), 0),
    };
  }, [multas]);

  // 📄 MOSTRAR LOADING SI NO HAY ID
  if (!playerId) {
    return (
      <View style={[styles.container, styles.loadingMainContainer]}>
        <Text style={styles.loadingText}>
          Cargando información del jugador...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        </View>
      )}

      <View style={styles.headerContainer}>
        <View
          style={[
            styles.headerIndicator,
            { backgroundColor: MODERN_COLORS.primary },
          ]}
        />
        <Text style={styles.title}>Multas</Text>
      </View>

      {/* 📄 MOSTRAR LOADING MIENTRAS SE CARGAN LAS MULTAS */}
      {isLoadingMultas ? (
        <View style={styles.loadingMultasContainer}>
          <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
          <Text style={styles.loadingText}>Cargando multas...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.multasList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.multasListContent}
        >
          {multas.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No hay multas registradas
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Las multas del jugador aparecerán aquí
              </Text>
            </View>
          ) : (
            multas.map((multa) => (
              <TouchableOpacity
                key={multa.id}
                style={[
                  styles.multaItem,
                  {
                    borderLeftWidth: 4,
                    borderLeftColor: multa.paid
                      ? MODERN_COLORS.success
                      : MODERN_COLORS.danger,
                  },
                ]}
                onPress={() => handleMultaPress(multa)}
                activeOpacity={0.8}
              >
                <View style={styles.multaContent}>
                  <View style={styles.multaHeader}>
                    <Text style={styles.multaDate}>{multa.date}</Text>
                    <View
                      style={[
                        styles.multaStatus,
                        {
                          backgroundColor: multa.paid
                            ? MODERN_COLORS.success
                            : MODERN_COLORS.danger,
                          borderColor: multa.paid
                            ? MODERN_COLORS.success
                            : MODERN_COLORS.danger,
                        },
                      ]}
                    >
                      {multa.paid ? (
                        <CheckIcon size={12} color={MODERN_COLORS.textWhite} />
                      ) : (
                        <ClockIcon size={12} color={MODERN_COLORS.textWhite} />
                      )}
                      <Text style={styles.multaStatusText}>
                        {multa.paid ? "Pagado" : "Pendiente"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.multaReason} numberOfLines={2}>
                    {multa.reason}
                  </Text>
                  <Text style={[styles.multaAmount]}>{multa.amount}€</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Botón flotante para añadir nueva multa */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={handleAddMulta}
      >
        <LinearGradient
          colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color={MODERN_COLORS.textWhite} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Resumen de multas */}
      <View style={styles.summaryContainer}>
        <LinearGradient
          colors={[MODERN_COLORS.surface, MODERN_COLORS.surfaceGray]}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total multas</Text>
              <Text style={styles.summaryValue}>{totalMultas}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Importe total</Text>
              <Text style={styles.summaryValue}>{importeTotal}€</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pendiente</Text>
              <Text
                style={[styles.summaryValue, { color: MODERN_COLORS.danger }]}
              >
                {importePendiente}€
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Modal de acciones para multa */}
      <Modal
        visible={showActionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowActionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Opciones</Text>
                <TouchableOpacity onPress={() => setShowActionModal(false)}>
                  <Ionicons
                    name="close"
                    size={20}
                    color={MODERN_COLORS.textGray}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleEditMulta}
              >
                <EditIcon size={20} color={MODERN_COLORS.primary} />
                <Text style={styles.modalOptionText}>Editar multa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleTogglePagado}
              >
                {selectedMulta?.paid ? (
                  <>
                    <ClockIcon size={20} color={MODERN_COLORS.warning} />
                    <Text style={styles.modalOptionText}>
                      Marcar como pendiente
                    </Text>
                  </>
                ) : (
                  <>
                    <CheckIcon size={20} color={MODERN_COLORS.success} />
                    <Text style={styles.modalOptionText}>
                      Marcar como pagada
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalOption}
                onPress={handleDeleteMulta}
              >
                <Ionicons name="trash" size={20} color={MODERN_COLORS.danger} />
                <Text
                  style={[
                    styles.modalOptionText,
                    { color: MODERN_COLORS.danger },
                  ]}
                >
                  Eliminar multa
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
    padding: 16,
  },

  // 📄 ESTILOS DE LOADING PRINCIPAL
  loadingMainContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: MODERN_COLORS.textGray,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },

  // 📄 ESTILOS DE LOADING DE MULTAS
  loadingMultasContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
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
    letterSpacing: -0.3,
  },

  // Lista de multas
  multasList: {
    flex: 1,
  },
  multasListContent: {
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    color: MODERN_COLORS.textDark,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: MODERN_COLORS.textGray,
    fontSize: 14,
    textAlign: "center",
  },

  // Botón para añadir
  addButton: {
    position: "absolute",
    bottom: 90,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  // Resumen de multas
  summaryContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 16,
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 1,
  },
  summaryContent: {
    flexDirection: "row",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 15,
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: 8,
  },
  summaryLabel: {
    color: MODERN_COLORS.textGray,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  summaryValue: {
    color: MODERN_COLORS.textDark,
    fontSize: 18,
    fontWeight: "bold",
  },

  // Modal de acciones
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  modalTitle: {
    color: MODERN_COLORS.textDark,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  modalOptionText: {
    color: MODERN_COLORS.textDark,
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },

  // 🆕 ESTILOS PARA MULTA ITEM (TEMPORAL)
  multaItem: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  multaContent: {
    gap: 8,
  },

  multaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  multaDate: {
    color: MODERN_COLORS.textGray,
    fontSize: 12,
    fontWeight: "500",
  },

  multaStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },

  multaStatusText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  multaReason: {
    color: MODERN_COLORS.textDark,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },

  multaAmount: {
    color: MODERN_COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },
});
