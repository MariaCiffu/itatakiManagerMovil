import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../src/config/firebase";
import { COLORS } from "../../src/constants/colors";
import { useAuth } from "../../src/hooks/useFirebase";

export default function PendingUsersScreen() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      setLoading(true);
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("approved", "==", false));
      const snapshot = await getDocs(q);

      const users = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        });
      });

      // Ordenar por fecha de creación (más recientes primero)
      users.sort((a, b) => b.createdAt - a.createdAt);

      setPendingUsers(users);
    } catch (error) {
      console.error("Error cargando usuarios pendientes:", error);
      Alert.alert("Error", "No se pudieron cargar los usuarios pendientes");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const approveUser = async (userId, userName) => {
    Alert.alert(
      "Aprobar Usuario",
      `¿Estás seguro de que quieres aprobar a ${userName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Aprobar",
          onPress: async () => {
            try {
              const userRef = doc(db, "users", userId);
              await updateDoc(userRef, {
                approved: true,
                approvedAt: new Date(),
              });

              Alert.alert(
                "Éxito",
                `${userName} ha sido aprobado correctamente`
              );
              loadPendingUsers(); // Recargar lista
            } catch (error) {
              console.error("Error aprobando usuario:", error);
              Alert.alert("Error", "No se pudo aprobar el usuario");
            }
          },
        },
      ]
    );
  };

  const rejectUser = async (userId, userName) => {
    Alert.alert(
      "Rechazar Usuario",
      `¿Estás seguro de que quieres rechazar a ${userName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          onPress: async () => {
            try {
              const userRef = doc(db, "users", userId);
              await updateDoc(userRef, {
                rejected: true,
                approved: false, // asegurarnos de que no quede aprobado
                rejectedAt: new Date(),
              });

              Alert.alert(
                "Usuario Rechazado",
                `${userName} ha sido rechazado correctamente`
              );
              loadPendingUsers(); // Recargar lista
            } catch (error) {
              console.error("Error rechazando usuario:", error);
              Alert.alert("Error", "No se pudo rechazar el usuario");
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPendingUsers();
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userTeam}>
          Equipo: {item.teamName || "No especificado"}
        </Text>
        <Text style={styles.userDate}>
          Registrado: {item.createdAt.toLocaleDateString("es-ES")}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.approveButton}
        onPress={() => approveUser(item.id, item.name)}
      >
        <LinearGradient
          colors={["#22c55e", "#16a34a"]}
          style={styles.buttonGradient}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.buttonText}>Aprobar</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Usuarios Pendientes</Text>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {loading && pendingUsers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      ) : pendingUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
          <Text style={styles.emptyTitle}>¡Todo al día!</Text>
          <Text style={styles.emptyText}>
            No hay usuarios pendientes de aprobación
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  logoutButton: {
    padding: 8,
  },
  listContainer: {
    padding: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  userTeam: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  approveButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
});
