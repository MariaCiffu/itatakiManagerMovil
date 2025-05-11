// src/app/partidos/index.js
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { getPartidosWithDelay } from "../../services/partidosService";
import BackButton from "../../components/BackButton";
import { COLORS } from "../../constants/colors";

export default function PartidosScreen() {
  const router = useRouter();
  const [partidos, setPartidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar partidos al iniciar
  useEffect(() => {
    loadPartidos();
  }, []);

  const loadPartidos = async () => {
    try {
      setLoading(true);
      const data = await getPartidosWithDelay();
      setPartidos(data);
    } catch (error) {
      console.error("Error al cargar partidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPartidoDetail = (partidoId) => {
    router.push(`/partidos/${partidoId}`);
  };

  const navigateToCrearPartido = () => {
    router.push("/partidos/crear");
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Partidos</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando partidos...</Text>
        </View>
      ) : (
        <FlatList
          data={partidos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.partidoCard}
              onPress={() => navigateToPartidoDetail(item.id)}
            >
              <View style={styles.jornadaHeader}>
                <Text style={styles.jornada}>
                  {item.tipoPartido === "amistoso"
                    ? "Amistoso"
                    : item.tipoPartido === "torneo"
                      ? `Torneo: ${item.jornada}`
                      : `Jornada ${item.jornada}`}
                </Text>
                <Text style={styles.fecha}>{formatDate(item.fecha)}</Text>
              </View>

              <View style={styles.partidoContent}>
                <View style={styles.equipoContainer}>
                  <Text style={styles.equipoNombre}>
                    {item.lugar === "Casa" ? "Tu Equipo" : item.rival}
                  </Text>
                  <Text style={styles.vs}>VS</Text>
                  <Text style={styles.equipoNombre}>
                    {item.lugar === "Casa" ? item.rival : "Tu Equipo"}
                  </Text>
                </View>
              </View>

              <View style={styles.partidoFooter}>
                <Text style={styles.partidoStatus}>
                  {item.lugar === "Casa" ? "Local" : "Visitante"}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay partidos creados</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={navigateToCrearPartido}
              >
                <Text style={styles.createButtonText}>
                  Crear primer partido
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Botón flotante para añadir partido */}
      <TouchableOpacity 
        style={styles.addFloatingButton} 
        activeOpacity={0.8} 
        onPress={navigateToCrearPartido}
      >
        <LinearGradient 
          colors={[COLORS ? COLORS.primary : "#4CAF50", COLORS ? COLORS.primaryDark : "#388E3C"]} 
          style={styles.addButtonGradient}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,

  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  placeholder: {
    width: 40, // Mismo ancho que el BackButton para mantener el título centrado
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 16,
  },
  partidoCard: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: "hidden",
  },
  jornadaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#4CAF50", // Color verde para la cabecera de jornada
  },
  jornada: {
    color: "#fff",
    fontWeight: "bold",
  },
  fecha: {
    color: "#fff",
  },
  partidoContent: {
    padding: 16,
  },
  equipoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  equipoNombre: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
  vs: {
    color: "#ccc",
    fontSize: 14,
    marginHorizontal: 8,
  },
  partidoFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  partidoStatus: {
    color: "#ccc",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 100,
  },
  emptyText: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  // Estilos para el botón flotante
  addFloatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
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
});