"use client"

// app/jugadores/[id]/multas.js
import { useState, useCallback, useContext } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Calendar, Check, Clock, Plus, Edit, Trash2, X } from "react-native-feather"
import { COLORS } from "../../../constants/colors"
import { useRouter, useLocalSearchParams } from "expo-router"
import { useFocusEffect } from "@react-navigation/native"
import { PlayerContext } from "../../../context/PlayerContext"
import { updateMultaStatus, deleteMulta } from "../../../services/jugadoresService"

export default function Multas() {
  const router = useRouter()
  const [selectedMulta, setSelectedMulta] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const player = useContext(PlayerContext)
  const [multas, setMultas] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Las multas ya vienen del contexto del jugador, que se actualiza en _layout.js
  useFocusEffect(
    useCallback(() => {
      if (player && player.multas) {
        setMultas(player.multas)
      }

      return () => {
        // Limpieza si es necesaria
      }
    }, [player]),
  )

  const handleAddMulta = () => {
    router.push({
      pathname: "/jugadores/add-multa",
      params: { jugadorId: player.id },
    })
  }

  const handleMultaPress = (multa) => {
    setSelectedMulta(multa)
    setShowActionModal(true)
  }

  const handleEditMulta = () => {
    setShowActionModal(false)
    router.push({
      pathname: `/jugadores/edit-multa`,
      params: {
        multaData: JSON.stringify(selectedMulta),
        jugadorId: player.id,
      },
    })
  }

  const handleTogglePagado = async () => {
    setShowActionModal(false)
    setIsLoading(true)

    try {
      // Llamar al servicio para actualizar el estado
      const result = await updateMultaStatus(player.id, selectedMulta.id, !selectedMulta.paid)

      setIsLoading(false)

      if (result.success) {
        // Actualizar el estado local solo si la API fue exitosa
        setMultas(multas.map((m) => (m.id === selectedMulta.id ? { ...m, paid: !m.paid } : m)))

      } else {
        Alert.alert("Error", result.message || "No se pudo actualizar el estado de la multa")
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Error al actualizar estado:", error)
      Alert.alert("Error", "Ocurrió un error al actualizar el estado")
    }
  }

  const handleDeleteMulta = () => {
    setShowActionModal(false)

    Alert.alert("Eliminar multa", "¿Estás seguro de que quieres eliminar esta multa?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Eliminar",
        onPress: async () => {
          setIsLoading(true)

          try {
            const result = await deleteMulta(player.id, selectedMulta.id)

            setIsLoading(false)

            if (result.success) {
              setMultas(multas.filter((m) => m.id !== selectedMulta.id))
              Alert.alert("Multa eliminada", "La multa ha sido eliminada correctamente")
            } else {
              Alert.alert("Error", result.message || "No se pudo eliminar la multa")
            }
          } catch (error) {
            setIsLoading(false)
            console.error("Error al eliminar multa:", error)
            Alert.alert("Error", "Ocurrió un error al eliminar la multa")
          }
        },
        style: "destructive",
      },
    ])
  }

  // Cálculos para el resumen
  const totalMultas = multas.length
  const importeTotal = multas.reduce((sum, multa) => sum + multa.amount, 0)
  const importePendiente = multas.filter((multa) => !multa.paid).reduce((sum, multa) => sum + multa.amount, 0)

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      )}

      <View style={styles.headerContainer}>
        <View style={[styles.headerIndicator, { backgroundColor: COLORS.primary }]} />
        <Text style={styles.title}>Multas</Text>
      </View>

      <ScrollView
        style={styles.multasList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.multasListContent}
      >
        {multas.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No hay multas registradas</Text>
          </View>
        ) : (
          multas.map((multa) => <MultaCard key={multa.id} multa={multa} onPress={() => handleMultaPress(multa)} />)
        )}
      </ScrollView>

      {/* Botón flotante para añadir nueva multa */}
      <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={handleAddMulta}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.addButtonGradient}>
          <Plus width={24} height={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Resumen de multas */}
      <View style={styles.summaryContainer}>
        <LinearGradient colors={[COLORS.card, "#252525"]} style={styles.summaryGradient}>
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
              <Text style={[styles.summaryValue, { color: COLORS.danger }]}>{importePendiente}€</Text>
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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowActionModal(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Opciones</Text>
                <TouchableOpacity onPress={() => setShowActionModal(false)}>
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.modalOption} onPress={handleEditMulta}>
                <Edit size={20} color={COLORS.primary} />
                <Text style={styles.modalOptionText}>Editar multa</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={handleTogglePagado}>
                {selectedMulta?.paid ? (
                  <>
                    <Clock size={20} color={COLORS.warning} />
                    <Text style={styles.modalOptionText}>Marcar como pendiente</Text>
                  </>
                ) : (
                  <>
                    <Check size={20} color={COLORS.success} />
                    <Text style={styles.modalOptionText}>Marcar como pagada</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalOption} onPress={handleDeleteMulta}>
                <Trash2 size={20} color={COLORS.danger} />
                <Text style={[styles.modalOptionText, { color: COLORS.danger }]}>Eliminar multa</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

function MultaCard({ multa, onPress }) {
  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9} onPress={onPress}>
      <LinearGradient colors={[COLORS.card, "#252525"]} style={styles.cardGradient}>
        <View style={styles.cardContent}>
          {/* Indicador de estado de pago */}
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: multa.paid ? `${COLORS.success}20` : `${COLORS.danger}20` },
            ]}
          >
            {multa.paid ? (
              <Check width={16} height={16} color={COLORS.success} />
            ) : (
              <Clock width={16} height={16} color={COLORS.danger} />
            )}
          </View>

          {/* Contenido principal */}
          <View style={styles.cardMain}>
            {/* Fecha y motivo */}
            <View style={styles.cardHeader}>
              <View style={styles.fechaContainer}>
                <Calendar width={14} height={14} color="#999" style={styles.fechaIcon} />
                <Text style={styles.fechaText}>{multa.date}</Text>
              </View>
              <Text style={styles.motivoText}>{multa.reason}</Text>
            </View>

            {/* Importe y estado */}
            <View style={styles.cardFooter}>
              <View style={styles.importeContainer}>
                <Text style={styles.importeText}>{multa.amount}€</Text>
              </View>
              <Text style={[styles.estadoText, { color: multa.paid ? COLORS.success : COLORS.danger }]}>
                {multa.paid ? "Pagado" : "Pendiente"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
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
    color: COLORS.text,
    fontWeight: "bold",
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
    paddingVertical: 40,
  },
  emptyStateText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },

  // Tarjeta de multa
  cardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
  },
  cardContent: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 16,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardMain: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    marginBottom: 8,
  },
  fechaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  fechaIcon: {
    marginRight: 4,
  },
  fechaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  motivoText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  importeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  importeText: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: "bold",
  },
  estadoText: {
    fontSize: 14,
    fontWeight: "500",
  },

  // Botón para añadir
  addButton: {
    position: "absolute",
    bottom: 90, // Ajustado para dejar espacio para el resumen
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
    padding: 1, // Borde gradiente
  },
  summaryContent: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 8,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: COLORS.text,
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
    backgroundColor: COLORS.card,
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
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalOptionText: {
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 12,
  },
})