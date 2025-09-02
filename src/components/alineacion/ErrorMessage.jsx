// components/alineacion/ErrorMessage.jsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";

const ErrorMessage = ({ message, onDismiss, style }) => {
  return (
    <Animated.View style={[styles.errorContainer, style]}>
      <View style={styles.errorContent}>
        <Ionicons
          name="alert-circle"
          size={20}
          color={MODERN_COLORS.textWhite}
          style={styles.errorIcon}
        />
        <Text style={styles.errorText}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          accessible={true}
          accessibilityLabel="Cerrar mensaje de error"
          accessibilityRole="button"
          style={styles.dismissButton}
        >
          <Ionicons name="close" size={18} color={MODERN_COLORS.textWhite} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: MODERN_COLORS.danger,
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  errorContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  errorIcon: {
    marginRight: 8,
  },

  errorText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },

  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default React.memo(ErrorMessage);
