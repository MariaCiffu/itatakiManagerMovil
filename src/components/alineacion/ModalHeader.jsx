// components/alineacion/ModalHeader.jsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";

const ModalHeader = ({ title, onClose, colors, style }) => {
  // Usar colors prop si se pasa, sino usar MODERN_COLORS por defecto
  const themeColors = colors || {
    modalText: MODERN_COLORS.textDark,
    modalBorder: MODERN_COLORS.border,
  };

  return (
    <View
      style={[
        styles.modalHeader,
        { borderBottomColor: themeColors.modalBorder || MODERN_COLORS.border },
        style,
      ]}
    >
      <Text
        style={[
          styles.modalTitle,
          { color: themeColors.modalText || MODERN_COLORS.textDark },
        ]}
      >
        {title}
      </Text>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessible={true}
        accessibilityLabel="Cerrar"
        accessibilityHint="Cierra este diálogo"
        accessibilityRole="button"
      >
        <Ionicons
          name="close"
          size={24}
          color={themeColors.modalText || MODERN_COLORS.textDark}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    backgroundColor: MODERN_COLORS.surface,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
    flex: 1,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(ModalHeader);
