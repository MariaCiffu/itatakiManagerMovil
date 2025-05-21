// components/alineacion/ModalHeader.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const ModalHeader = ({ title, onClose, colors, style }) => {
  return (
    <View style={[styles.modalHeader, { borderBottomColor: colors.modalBorder }, style]}>
      <Text style={[styles.modalTitle, { color: colors.modalText }]}>{title}</Text>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose}
        accessible={true}
        accessibilityLabel="Cerrar"
        accessibilityHint="Cierra este diálogo"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={24} color={colors.modalText} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
});

export default React.memo(ModalHeader);