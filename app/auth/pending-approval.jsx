// pending-approval.jsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/hooks/useFirebase";
import { COLORS } from "../../src/constants/colors";

export default function PendingApprovalScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <LinearGradient
      colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="time-outline" size={64} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Cuenta Pendiente de Aprobación</Text>

        <Text style={styles.message}>
          Tu cuenta ha sido creada exitosamente, pero necesita ser aprobada por
          un administrador antes de que puedas acceder.
        </Text>

        <Text style={styles.submessage}>
          Te notificaremos cuando tu cuenta sea aprobada. Esto puede tomar entre
          24 y 48 horas.
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 12,
    maxWidth: 300,
  },
  submessage: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 32,
    maxWidth: 280,
  },
  logoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#ef4444",
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
