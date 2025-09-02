// src/components/PlayerContextMenu.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../constants/modernColors";

const { width: screenWidth } = Dimensions.get("window");

const PlayerContextMenu = ({
  player,
  onAssignRole,
  onRemovePlayer,
  onClose,
  position,
}) => {
  // Determinar si el menú debe mostrarse a la izquierda o derecha
  const showOnLeft = position && position.x > screenWidth / 2;

  // Calcular el estilo de posición basado en la ubicación del toque
  const positionStyle = showOnLeft
    ? { right: 16 } // Si está en la mitad derecha, alinear a la izquierda del punto
    : { left: 16 }; // Si está en la mitad izquierda, alinear a la derecha del punto

  return (
    <View style={[styles.container, positionStyle]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerNumber}>#{player.number}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={MODERN_COLORS.textGray} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={onAssignRole}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.menuItemIcon,
            { backgroundColor: `${MODERN_COLORS.accent}15` },
          ]}
        >
          <Ionicons
            name="star-outline"
            size={18}
            color={MODERN_COLORS.accent}
          />
        </View>
        <Text style={styles.menuItemText}>Asignar roles especiales</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={MODERN_COLORS.textLight}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.menuItem}
        onPress={onRemovePlayer}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.menuItemIcon,
            { backgroundColor: `${MODERN_COLORS.danger}15` },
          ]}
        >
          <Ionicons
            name="trash-outline"
            size={18}
            color={MODERN_COLORS.danger}
          />
        </View>
        <Text style={styles.menuItemText}>Quitar de la alineación</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={MODERN_COLORS.textLight}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 10,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    width: 280,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  playerName: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.2,
  },

  playerNumber: {
    fontSize: 13,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
    marginTop: 2,
  },

  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 4,
  },

  menuItemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: MODERN_COLORS.textDark,
    letterSpacing: 0.1,
  },
});

export default PlayerContextMenu;
