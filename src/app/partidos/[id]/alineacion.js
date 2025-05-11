// src/app/partidos/[id]/alineacion.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getPartidoByIdWithDelay } from "../../../services/partidosService";
import { PLAYERS } from "../../../data/teamData"; // Importar jugadores
import LineupScreen from "../../alineacion";

export default function PartidoAlineacionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [partido, setPartido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPartido = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPartidoByIdWithDelay(id);
        console.log(
          "Datos del partido cargados:",
          JSON.stringify(data, null, 2)
        );

        // Verificar que la alineación tenga la estructura correcta
        if (data.alineacion) {
          console.log(
            "Alineación cargada:",
            JSON.stringify(data.alineacion, null, 2)
          );
        }

        setPartido(data);
      } catch (error) {
        console.error("Error al cargar partido:", error);
        setError(error.error || "Error al cargar el partido");
      } finally {
        setLoading(false);
      }
    };

    loadPartido();
  }, [id]);

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

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!partido || !partido.alineacion) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No hay alineación configurada para este partido
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Usar valores directos en lugar de funciones para evitar actualizaciones de estado durante el renderizado
  return (
    <LineupScreen
      matchday={partido.tipoPartido === "amistoso" ? "Amistoso" : 
               partido.tipoPartido === "torneo" ? partido.jornada : 
               parseInt(partido.jornada) || 0}
      matchTitle={partido.tipoPartido === "amistoso" ? "Amistoso" : 
                 partido.tipoPartido === "torneo" ? partido.jornada : 
                 `Jornada ${partido.jornada || ""}`}
      initialData={partido.alineacion}
      readOnly={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
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
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
});