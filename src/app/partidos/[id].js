"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getPartidoByIdWithDelay,
  deletePartidoWithDelay,
} from "../../services/partidosService";
import { getAllJugadores } from "../../services/jugadoresService";
import PLANTILLAS from "../../data/plantillasConv";
import { availableRoles } from "../../data/roles";

export default function DetallePartidoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [partido, setPartido] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [generatingConvocatoria, setGeneratingConvocatoria] = useState(false);

  // Estados para la convocatoria
  const [showConvocatoriaModal, setShowConvocatoriaModal] = useState(false);
  const [mensajeConvocatoria, setMensajeConvocatoria] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Cargar partido y jugadores en paralelo
      const [partidoData, jugadoresData] = await Promise.all([
        getPartidoByIdWithDelay(id),
        getAllJugadores(),
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
          },
        },
      ]
    );
  };

  const handleVerAlineacion = () => {
    router.push(`/partidos/${id}/alineacion`);
  };

  // Función para obtener el nombre del jugador por ID usando el estado local
  const getPlayerNameById = (playerId) => {
    if (!playerId) return "No asignado";

    const jugador = jugadores.find((player) => player.id === playerId);
    return jugador ? jugador.name : "No asignado";
  };

  // Función para renderizar el indicador de rol (icono o letra)
  const renderRoleIndicator = (role) => {
    if (role.type === "icon") {
      return (
        <View
          style={[styles.rolBadge, { backgroundColor: role.backgroundColor }]}
        >
          <Ionicons
            name={role.icon.replace("-outline", "")}
            size={12}
            color={role.iconColor || "#FFFFFF"}
          />
        </View>
      );
    } else if (role.type === "letter") {
      return (
        <View
          style={[styles.rolBadge, { backgroundColor: role.backgroundColor }]}
        >
          <Text style={[styles.rolBadgeText, { color: role.letterColor }]}>
            {role.letter}
          </Text>
        </View>
      );
    }
    return null;
  };

  // Función para generar la convocatoria
  const handleGenerarConvocatoria = () => {
    if (!partido) return;

    setGeneratingConvocatoria(true);

    try {
      // Formatear fecha en formato "Día de la semana DD mes"
      const opciones = { weekday: "long", day: "numeric", month: "long" };
      const fechaFormateada = partido.fecha.toLocaleDateString(
        "es-ES",
        opciones
      );
      // Convertir primera letra a mayúscula
      const fecha = fechaFormateada.toUpperCase().replace(",", "");

      // Obtener lugar y generar enlace de Google Maps
      const lugarNombre =
        partido.lugar === "Casa"
          ? "Campo local"
          : partido.lugarEspecifico || "Campo visitante";
      // Generar enlace de Google Maps (codificamos el nombre del lugar para la búsqueda)
      const lugarEncoded = encodeURIComponent(lugarNombre);
      const mapsLink = `https://maps.google.com/?q=${lugarEncoded}`;
      // Usar formato de Markdown para crear un enlace oculto: [texto visible](url)
      const lugar = `[${lugarNombre}](${mapsLink})`;

      // Obtener jugadores convocados (titulares y suplentes)
      let titulares = [];
      let suplentes = [];

      if (partido.alineacion) {
        // Procesar titulares
        if (
          partido.alineacion.titulares &&
          partido.alineacion.titulares.length > 0
        ) {
          // Filtrar solo jugadores válidos (con ID existente en la lista de jugadores)
          titulares = partido.alineacion.titulares
            .filter(
              (jugador) =>
                jugador.id && jugadores.some((j) => j.id === jugador.id)
            )
            .map((jugador) => {
              const player = jugadores.find((j) => j.id === jugador.id);
              return {
                id: jugador.id,
                name: player ? player.name : "",
                number: player ? player.number : "",
              };
            });
        }

        // Procesar suplentes
        if (
          partido.alineacion.suplentes &&
          partido.alineacion.suplentes.length > 0
        ) {
          // Si suplentes es un array de IDs (string)
          if (typeof partido.alineacion.suplentes[0] === "string") {
            suplentes = partido.alineacion.suplentes
              .filter((id) => id && jugadores.some((j) => j.id === id))
              .map((id) => {
                const player = jugadores.find((j) => j.id === id);
                return {
                  id: id,
                  name: player ? player.name : "",
                  number: player ? player.number : "",
                };
              });
          } else {
            // Si suplentes es un array de objetos
            suplentes = partido.alineacion.suplentes
              .filter(
                (jugador) =>
                  jugador.id && jugadores.some((j) => j.id === jugador.id)
              )
              .map((jugador) => {
                const player = jugadores.find((j) => j.id === jugador.id);
                return {
                  id: jugador.id,
                  name: player ? player.name : "",
                  number: player ? player.number : "",
                };
              });
          }
        }
      }

      // Generar lista de titulares
      let listaTitulares = "";
      if (titulares.length > 0) {
        titulares.forEach((jugador, index) => {
          listaTitulares += `${index + 1}. ${jugador.name}${jugador.number ? ` (${jugador.number})` : ""}\n`;
        });
      } else {
        listaTitulares = "No hay titulares seleccionados.\n";
      }

      // Generar lista de suplentes
      let listaSuplentes = "";
      if (suplentes.length > 0) {
        suplentes.forEach((jugador, index) => {
          listaSuplentes += `${index + 1}. ${jugador.name}${jugador.number ? ` (${jugador.number})` : ""}\n`;
        });
      } else {
        listaSuplentes = "No hay suplentes seleccionados.\n";
      }

      // Obtener la plantilla de convocatoria
      const plantillaConvocatoria = PLANTILLAS.find(
        (p) => p.id === "convocatoria"
      );

      if (!plantillaConvocatoria) {
        throw new Error("No se encontró la plantilla de convocatoria");
      }

      // Combinar titulares y suplentes para la lista de jugadores
      const listaJugadores = `*TITULARES:*\n${listaTitulares}\n*SUPLENTES:*\n${listaSuplentes}`;

      // Reemplazar variables en la plantilla
      let mensaje = plantillaConvocatoria.texto
        .replace("{fecha}", fecha)
        .replace("{hora}", partido.hora)
        .replace("{lugar}", lugar)
        .replace("{rival}", partido.rival)
        .replace("{jugadores}", listaJugadores);

      // Añadir encabezado personalizado
      mensaje = `🔵🔴 *CONVOCATORIA DE PARTIDO* 🔵🔴\n\n${mensaje}`;

      setMensajeConvocatoria(mensaje);
      setShowConvocatoriaModal(true);
    } catch (error) {
      console.error("Error al generar convocatoria:", error);
      Alert.alert("Error", "No se pudo generar la convocatoria");
    } finally {
      setGeneratingConvocatoria(false);
    }
  };

  // Función para enviar la convocatoria por WhatsApp
  const enviarConvocatoriaPorWhatsApp = async () => {
    try {
      const mensajeEncoded = encodeURIComponent(mensajeConvocatoria);

      // Abrir WhatsApp con el mensaje
      const url = `whatsapp://send?text=${mensajeEncoded}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
        setShowConvocatoriaModal(false);
      } else {
        Alert.alert("Error", "WhatsApp no está instalado en este dispositivo.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir WhatsApp.");
    }
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
  const hayRolesEspeciales =
    partido.alineacion &&
    partido.alineacion.specialRoles &&
    Object.values(partido.alineacion.specialRoles).some(
      (role) => role !== null
    );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del partido</Text>
        <TouchableOpacity
          onPress={handleEditarPartido}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Sección de información general */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información general</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo:</Text>
            <Text style={styles.infoValue}>
              {partido.tipoPartido === "liga"
                ? "Liga"
                : partido.tipoPartido === "torneo"
                  ? "Torneo"
                  : "Amistoso"}
            </Text>
          </View>

          {partido.tipoPartido !== "amistoso" && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {partido.tipoPartido === "liga" ? "Jornada:" : "Torneo:"}
              </Text>
              <Text style={styles.infoValue}>{partido.jornada}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha y hora:</Text>
            <Text style={styles.infoValue}>
              {partido.fecha.toLocaleDateString()}{" "}
              {partido.fecha.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Lugar:</Text>
            <Text style={styles.infoValue}>
              {partido.lugar === "Casa" ? "Local" : "Visitante"}
              {partido.lugar === "Fuera" && partido.lugarEspecifico
                ? ` (${partido.lugarEspecifico})`
                : ""}
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
                <Text style={styles.infoValue}>
                  {partido.alineacion.formacion || "4-3-3"}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Titulares:</Text>
                <Text style={styles.infoValue}>
                  {partido.alineacion.titulares
                    ? partido.alineacion.titulares.length
                    : 11}{" "}
                  jugadores
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Suplentes:</Text>
                <Text style={styles.infoValue}>
                  {partido.alineacion.suplentes
                    ? partido.alineacion.suplentes.length
                    : 5}{" "}
                  jugadores
                </Text>
              </View>

              {/* Roles especiales */}
              {hayRolesEspeciales && (
                <View style={styles.rolesContainer}>
                  <Text style={styles.rolesTitle}>Roles especiales:</Text>

                  {availableRoles.map((role) => {
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

              <TouchableOpacity
                style={styles.verAlineacionButton}
                onPress={handleVerAlineacion}
              >
                <Text style={styles.verAlineacionButtonText}>
                  Ver alineación completa
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.noAlineacionText}>
              No hay alineación configurada
            </Text>
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
              <View
                style={[
                  styles.notasContainer,
                  partido.estrategia && styles.notasSeparator,
                ]}
              >
                <Text style={styles.notasSubtitle}>Sobre el rival:</Text>
                <Text style={styles.notasText}>{partido.notasRival}</Text>
              </View>
            )}
          </View>
        )}

        {/* Botón para generar convocatoria */}
        <TouchableOpacity
          style={styles.convocatoriaButton}
          onPress={handleGenerarConvocatoria}
          disabled={generatingConvocatoria}
        >
          {generatingConvocatoria ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons
                name="megaphone-outline"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.convocatoriaButtonText}>
                Generar convocatoria
              </Text>
            </>
          )}
        </TouchableOpacity>

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
              <Ionicons
                name="trash-outline"
                size={20}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.eliminarButtonText}>Eliminar partido</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de convocatoria */}
      <Modal
        visible={showConvocatoriaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConvocatoriaModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Convocatoria generada</Text>
              <TouchableOpacity
                onPress={() => setShowConvocatoriaModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.mensajeContainer}>
              <Text style={styles.mensajeText}>{mensajeConvocatoria}</Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConvocatoriaModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={enviarConvocatoriaPorWhatsApp}
              >
                <Ionicons
                  name="logo-whatsapp"
                  size={20}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.whatsappButtonText}>
                  Enviar por WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  convocatoriaButton: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "center",
  },
  convocatoriaButtonText: {
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
  // Estilos para el modal de convocatoria
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  mensajeContainer: {
    backgroundColor: "#121212",
    borderRadius: 8,
    padding: 12,
    maxHeight: 300,
    marginBottom: 16,
  },
  mensajeText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#333",
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  whatsappButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#25D366", // Color de WhatsApp
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  whatsappButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
