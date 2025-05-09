// src/app/partidos/[id]/alineacion.js
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getPartidoByIdWithDelay } from "../../../services/partidosService";
import LineupScreen from "../../alineacion"; // Asegúrate de que la ruta sea correcta

export default function AlineacionPartidoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartido();
  }, [id]);

  const loadPartido = async () => {
    try {
      setLoading(true);
      const data = await getPartidoByIdWithDelay(id);
      if (data) {
        setPartido(data);
      }
    } catch (error) {
      console.error("Error al cargar partido:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando alineación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!partido || !partido.alineacion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alineación</Text>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se ha configurado la alineación para este partido</Text>
          <TouchableOpacity 
            style={styles.configButton}
            onPress={() => router.push(`/partidos/editar/${id}?step=3`)}
          >
            <Text style={styles.configButtonText}>Configurar alineación</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alineación - Jornada {partido.jornada}</Text>
      </View>
      
      <LineupScreen 
        matchday={parseInt(partido.jornada) || 0}
        isEmbedded={true}
        initialData={partido.alineacion}
        readOnly={true}
      />
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
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorText: {
    color: "#ccc",
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  configButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  configButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});