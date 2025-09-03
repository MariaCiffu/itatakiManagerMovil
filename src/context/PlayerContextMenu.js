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

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const PlayerContextMenu = ({
  player,
  onAssignRole,
  onRemovePlayer,
  onClose,
  position,
}) => {
  // Calcular posición simple del menú
  const calculatePosition = () => {
    if (!position) {
      return { left: 16, top: 150 };
    }

    const MENU_WIDTH = 220;
    let left = position.x - MENU_WIDTH / 2; // Centrar horizontalmente
    let top = position.y; // Usar posición vertical tal como viene

    // Solo verificar que no se salga de los bordes
    if (left + MENU_WIDTH > screenWidth - 16) {
      left = screenWidth - MENU_WIDTH - 16;
    }
    if (left < 16) {
      left = 16;
    }

    return { left, top };
  };

  const menuPosition = calculatePosition();

  return (
    <>
      {/* Overlay para cerrar el menú al tocar fuera */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Menú contextual compacto */}
      <View style={[styles.container, menuPosition]}>
        <View style={styles.compactHeader}>
          <Text style={styles.compactPlayerName}>{player.name}</Text>
          <Text style={styles.compactPlayerNumber}>#{player.number}</Text>
        </View>

        <View style={styles.menuItemsContainer}>
          <TouchableOpacity
            style={styles.compactMenuItem}
            onPress={onAssignRole}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.compactMenuIcon,
                { backgroundColor: `${MODERN_COLORS.accent}15` },
              ]}
            >
              <Ionicons
                name="star-outline"
                size={14}
                color={MODERN_COLORS.accent}
              />
            </View>
            <Text style={styles.compactMenuText}>Roles</Text>
          </TouchableOpacity>

          <View style={styles.menuSeparator} />

          <TouchableOpacity
            style={styles.compactMenuItem}
            onPress={onRemovePlayer}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.compactMenuIcon,
                { backgroundColor: `${MODERN_COLORS.danger}15` },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={14}
                color={MODERN_COLORS.danger}
              />
            </View>
            <Text style={styles.compactMenuText}>Quitar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },

  container: {
    position: "absolute",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 10,
    width: 220,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 1000,
  },

  compactHeader: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  compactPlayerName: {
    fontSize: 14,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    textAlign: "center",
  },

  compactPlayerNumber: {
    fontSize: 11,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
    marginTop: 1,
  },

  menuItemsContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  compactMenuItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  compactMenuIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },

  compactMenuText: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    textAlign: "center",
  },

  menuSeparator: {
    width: 1,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: 4,
    marginVertical: 4,
  },
});

export default PlayerContextMenu;
