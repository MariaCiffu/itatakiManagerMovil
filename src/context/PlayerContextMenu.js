// src/components/PlayerContextMenu.js
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width: screenWidth } = Dimensions.get("window")

const PlayerContextMenu = ({ player, onAssignRole, onRemovePlayer, onClose, position, theme }) => {
  const colors = theme || {
    modalContent: "#333333",
    text: "#ffffff",
    textSecondary: "#cccccc",
    modalBorder: "#444444",
  }

  // Determinar si el menú debe mostrarse a la izquierda o derecha
  const showOnLeft = position && position.x > screenWidth / 2

  // Calcular el estilo de posición basado en la ubicación del toque
  const positionStyle = showOnLeft
    ? { right: 10 } // Si está en la mitad derecha, alinear a la izquierda del punto
    : { left: 10 } // Si está en la mitad izquierda, alinear a la derecha del punto

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.modalContent, borderColor: colors.modalBorder },
        positionStyle,
      ]}
    >
      <View style={[styles.header, { borderBottomColor: colors.modalBorder }]}>
        <Text style={[styles.playerName, { color: colors.text }]}>{player.name}</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.menuItem} onPress={onAssignRole}>
        <Ionicons name="star-outline" size={20} color="#FFC107" />
        <Text style={[styles.menuItemText, { color: colors.text }]}>Asignar roles especiales</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={onRemovePlayer}>
        <Ionicons name="trash-outline" size={20} color="#F44336" />
        <Text style={[styles.menuItemText, { color: colors.text }]}>Quitar de la alineación</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    borderRadius: 8,
    padding: 12,
    width: 250,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  playerName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  menuItemText: {
    marginLeft: 10,
  },
})

export default PlayerContextMenu