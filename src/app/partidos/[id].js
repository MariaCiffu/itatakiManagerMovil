// src/app/partidos/[id].js
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator, 
  Alert 
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getPartidoByIdWithDelay, deletePartidoWithDelay } from "../../services/partidosService";
import { getAllJugadores } from "../../services/jugadoresService";

export default function DetallePartidoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [partido, setPartido] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Definición de los roles disponibles (igual que en PlayerRoleSelector)
  const availableRoles = [
    { 
      id: "captain", 
      name: "Capitán", 
      type: "letter",
      letter: "C",
      letterColor: "#000000",
      backgroundColor: "#FFC107"  // Amarillo/Dorado
    },
    { 
      id: "freeKicks", 
      name: "Faltas lejanas", 
      type: "letter",
      letter: "F",
      letterColor: "#FFFFFF",
      backgroundColor: "#FF5722"  // Naranja/Rojo
    },
    {
      id: "freeKicksNear",
      name: "Faltas cercanas",
      type: "letter",
      letter: "f",
      letterColor: "#000000",
      backgroundColor: "#FF9800"  // Naranja
    },
    { 
      id: "corners", 
      name: "Córners", 
      type: "icon", 
      icon: "flag-outline",
      iconColor: "#FFFFFF",
      backgroundColor: "#2196F3"  // Azul
    },
    { 
      id: "penalties", 
      name: "Penaltis", 
      type: "letter",
      letter: "P",
      letterColor: "#FFFFFF",
      backgroundColor: "#E91E63"  // Rosa/Fucsia
    },
  ];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar partido y jugadores en paralelo
      const [partidoData, jugadoresData] = await Promise.all([
        getPartidoByIdWithDelay(id),
        getAllJugadores()
      ]);
      
      if (partidoData) {
        // Asegurarse de que la fecha es un objeto Date
        partidoData.fecha = new Date(partidoData.fecha);
        setPartido(partidoData);
      } else {
        // Manejar caso de partido no encontrado
        Alert.alert("Error", "Partido no encontrado");
        router.replace("/partidos");
        return;
      }
      
      setJugadores(jugadoresData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos");
      router.replace("/partidos");
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPartido = () => {
    router.push(`/partidos/editar/${id}`);
  };

  const handleEliminarPartido = () => {
    Alert.alert(
      "Eliminar partido",
      "¿Estás seguro de que quieres eliminar este partido?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: async () => {
            try {
              setDeleting(true);
              await deletePartidoWithDelay(id);
              router.replace("/partidos");
            } catch (error) {
              console.error("Error al eliminar partido:", error);
              Alert.alert("Error", "No se pudo eliminar el partido");
              setDeleting(false);
            }
          }
        }
      ]
    );
  };

  const handleVerAlineacion = () => {
    router.push(`/partidos/${id}/alineacion`);
  };

  // Función para obtener el nombre del jugador por ID usando el estado local
  const getPlayerNameById = (playerId) => {
    if (!playerId) return "No asignado";
    
    const jugador = jugadores.find(player => player.id === playerId);
    return jugador ? jugador.name : "No asignado";
  };

  // Función para renderizar el indicador de rol (icono o letra)
  const renderRoleIndicator = (role) => {
    if (role.type === "icon") {
      return (
        <View style={[styles.rolBadge, { backgroundColor: role.backgroundColor }]}>
          <Ionicons name={role.icon.replace("-outline", "")} size={12} color={role.iconColor || "#FFFFFF"} />
        </View>
      );
    } else if (role.type === "letter") {
      return (
        <View style={[styles.rolBadge, { backgroundColor: role.backgroundColor }]}>
          <Text style={[styles.rolBadgeText, { color: role.letterColor }]}>
            {role.letter}
          </Text>
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando partido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Determinar si hay notas para mostrar (estrategia o notas del rival)
  const hayNotas = partido.estrategia || partido.notasRival;
  
  // Determinar si hay roles especiales asignados
  const hayRolesEspeciales = partido.alineacion && 
    partido.alineacion.specialRoles && 
    Object.values(partido.alineacion.specialRoles).some(role => role !== null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del partido</Text>
        <TouchableOpacity onPress={handleEditarPartido} style={styles.editButton}>
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Sección de información general */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información general</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Jornada:</Text>
            <Text style={styles.infoValue}>{partido.jornada}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha:</Text>
            <Text style={styles.infoValue}>{partido.fecha.toLocaleDateString()}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lugar:</Text>
            <Text style={styles.infoValue}>
              {partido.lugar === "Casa" ? "Local" : "Visitante"}
              {partido.lugar === "Fuera" && partido.lugarEspecifico ? ` (${partido.lugarEspecifico})` : ""}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Rival:</Text>
            <Text style={styles.infoValue}>{partido.rival}</Text>
          </View>
        </View>

        {/* Sección de alineación (primero) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alineación</Text>
          
          {partido.alineacion ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Formación:</Text>
                <Text style={styles.infoValue}>{partido.alineacion.formacion || "4-3-3"}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Titulares:</Text>
                <Text style={styles.infoValue}>{partido.alineacion.titulares ? partido.alineacion.titulares.length : 11} jugadores</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Suplentes:</Text>
                <Text style={styles.infoValue}>{partido.alineacion.suplentes ? partido.alineacion.suplentes.length : 5} jugadores</Text>
              </View>
              
              {/* Roles especiales */}
              {hayRolesEspeciales && (
                <View style={styles.rolesContainer}>
                  <Text style={styles.rolesTitle}>Roles especiales:</Text>
                  
                  {availableRoles.map(role => {
                    const playerId = partido.alineacion.specialRoles?.[role.id];
                    if (!playerId) return null;
                    
                    return (
                      <View style={styles.rolRow} key={role.id}>
                        {renderRoleIndicator(role)}
                        <Text style={styles.rolText}>
                          {role.name}: {getPlayerNameById(playerId)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
              
              <TouchableOpacity style={styles.verAlineacionButton} onPress={handleVerAlineacion}>
                <Text style={styles.verAlineacionButtonText}>Ver alineación completa</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noAlineacionText}>No hay alineación configurada</Text>
          )}
        </View>

        {/* Sección de notas (después de alineación) */}
        {hayNotas && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas</Text>
            
            {partido.estrategia && (
              <View style={styles.notasContainer}>
                <Text style={styles.notasSubtitle}>Estrategia:</Text>
                <Text style={styles.notasText}>{partido.estrategia}</Text>
              </View>
            )}
            
            {partido.notasRival && (
              <View style={[styles.notasContainer, partido.estrategia && styles.notasSeparator]}>
                <Text style={styles.notasSubtitle}>Sobre el rival:</Text>
                <Text style={styles.notasText}>{partido.notasRival}</Text>
              </View>
            )}
          </View>
        )}
        
        {/* Botón de eliminar */}
        <TouchableOpacity 
          style={[styles.eliminarButton, deleting && styles.buttonDisabled]} 
          onPress={handleEliminarPartido}
          disabled={deleting}
        >
          {deleting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.eliminarButtonText}>Eliminar partido</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#1e1e1e",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginLeft: 8,
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
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
  section: {
    backgroundColor: "#1e1e1e",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  infoLabel: {
    fontSize: 16,
    color: "#ccc",
  },
  infoValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  notasContainer: {
    marginBottom: 12,
  },
  notasSeparator: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  notasSubtitle: {
    fontSize: 16,
    color: "#ccc",
    fontWeight: "500",
    marginBottom: 4,
  },
  notasText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  noAlineacionText: {
    fontSize: 16,
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 12,
  },
  verAlineacionButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  verAlineacionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  eliminarButton: {
    backgroundColor: "#F44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 24,
    flexDirection: "row",
    justifyContent: "center",
  },
  eliminarButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  // Estilos para los roles especiales
  rolesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  rolesTitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  rolRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rolBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  rolBadgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  rolText: {
    fontSize: 14,
    color: "#fff",
  },
});