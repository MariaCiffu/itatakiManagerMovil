"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Modal,
  FlatList,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import DateTimePicker from "@react-native-community/datetimepicker"
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserFriendsIcon,
  SearchIcon,
  CheckIcon,
  EnvelopeIcon,
  FileIcon,
  MapIcon,
} from "../../components/Icons"
import { COLORS } from "../../constants/colors"
import { PLAYERS, getJugadoresConMultas } from "../../data/teamData"
import PLANTILLAS from "../../data/plantillasConv" // Importar plantillas desde el archivo separado

export default function Convocatorias() {
  const router = useRouter()
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(PLANTILLAS[0])
  const [jugadores, setJugadores] = useState(PLAYERS)
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState({})
  const [searchQuery, setSearchQuery] = useState("")
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [datos, setDatos] = useState({
    fecha: "",
    hora: "",
    lugar: "",
    rival: "",
  })
  const [mensajeFinal, setMensajeFinal] = useState("")
  const [mostrarPreview, setMostrarPreview] = useState(false)

  // Estados para la búsqueda de ubicaciones
  const [searchLocation, setSearchLocation] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  // Filtrar jugadores según la búsqueda
  const jugadoresFiltrados = searchQuery
    ? jugadores.filter(
        (jugador) =>
          jugador.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jugador.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jugador.number.toString().includes(searchQuery),
      )
    : jugadores

  // Actualizar mensaje cuando cambian los datos o jugadores seleccionados
  useEffect(() => {
    generarMensaje()
  }, [datos, jugadoresSeleccionados, plantillaSeleccionada, selectedLocation])

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const year = selectedDate.getFullYear()
      const dateStr = `${day}/${month}/${year}`
      setDatos({ ...datos, fecha: dateStr })
    }
  }

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, "0")
      const minutes = String(selectedTime.getMinutes()).padStart(2, "0")
      const timeStr = `${hours}:${minutes}`
      setDatos({ ...datos, hora: timeStr })
    }
  }

  const toggleJugadorSeleccionado = (jugadorId) => {
    setJugadoresSeleccionados((prev) => ({
      ...prev,
      [jugadorId]: !prev[jugadorId],
    }))
  }

  const seleccionarTodos = () => {
    const todos = {}
    jugadores.forEach((jugador) => {
      todos[jugador.id] = true
    })
    setJugadoresSeleccionados(todos)
  }

  const deseleccionarTodos = () => {
    setJugadoresSeleccionados({})
  }

  // Función para buscar lugares (simulada, en producción usarías la API de Google Places)
  const searchPlaces = (query) => {
    // Simulación de resultados
    const mockResults = [
      {
        id: "1",
        name: "Estadio Camp Nou",
        address: "C. d'Arístides Maillol, 12, 08028 Barcelona",
        coords: { lat: 41.3809, lng: 2.1228 },
      },
      {
        id: "2",
        name: "Ciudad Deportiva Joan Gamper",
        address: "Av. Onze de Setembre, s/n, 08970 Sant Joan Despí, Barcelona",
        coords: { lat: 41.3773, lng: 2.0502 },
      },
      {
        id: "3",
        name: "Estadio Olímpico Lluís Companys",
        address: "Passeig Olímpic, 17-19, 08038 Barcelona",
        coords: { lat: 41.365, lng: 2.1544 },
      },
    ]

    return mockResults.filter(
      (place) =>
        place.name.toLowerCase().includes(query.toLowerCase()) ||
        place.address.toLowerCase().includes(query.toLowerCase()),
    )
  }

  // Función para seleccionar un lugar
  const selectLocation = (location) => {
    setSelectedLocation(location)
    setDatos({ ...datos, lugar: location.name })
    setShowLocationModal(false)
  }

  // Función para generar enlace de Google Maps
  const generateMapsLink = (coords) => {
    return `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
  }

  const generarMensaje = () => {
    let mensaje = plantillaSeleccionada.texto

    // Reemplazar variables en la plantilla
    mensaje = mensaje.replace("{fecha}", datos.fecha || "[FECHA]")

    // Solo reemplazar hora y lugar si no es informe de multas
    if (plantillaSeleccionada.id !== "multas") {
      mensaje = mensaje.replace("{hora}", datos.hora || "[HORA]")

      // Si hay una ubicación seleccionada con coordenadas, añadir el enlace de Maps usando formato Markdown
      if (selectedLocation && selectedLocation.coords) {
        const mapsLink = generateMapsLink(selectedLocation.coords)
        mensaje = mensaje.replace("{lugar}", `[${datos.lugar || "[LUGAR]"}](${mapsLink})`)
      } else {
        mensaje = mensaje.replace("{lugar}", datos.lugar || "[LUGAR]")
      }
    }

    mensaje = mensaje.replace("{rival}", datos.rival || "[RIVAL]")

    // Generar lista de jugadores
    let listaJugadores = ""

    // Caso especial para el informe de multas
    if (plantillaSeleccionada.id === "multas") {
      const jugadoresConMultas = getJugadoresConMultas()

      if (jugadoresConMultas.length > 0) {
        jugadoresConMultas.forEach((jugador, index) => {
          listaJugadores += `${index + 1}. ${jugador.name} - Total: ${jugador.totalPendiente}€\n`
          jugador.multasPendientes.forEach((multa) => {
            listaJugadores += `   • ${multa.reason}: ${multa.amount}€ (${multa.date})\n`
          })
          listaJugadores += "\n"
        })
      } else {
        listaJugadores = "No hay jugadores con multas pendientes."
      }
    } else {
      // Para otros tipos de plantillas, usar la selección manual
      const jugadoresConvocados = jugadores.filter((j) => jugadoresSeleccionados[j.id])

      if (jugadoresConvocados.length > 0) {
        jugadoresConvocados.forEach((jugador, index) => {
          listaJugadores += `${index + 1}. ${jugador.name} (${jugador.number})\n`
        })
      } else {
        listaJugadores = "[SELECCIONA JUGADORES]"
      }
    }

    mensaje = mensaje.replace("{jugadores}", listaJugadores)

    setMensajeFinal(mensaje)
  }

  const enviarPorWhatsApp = async () => {
    // Verificar que todos los campos necesarios estén completos
    if (
      !datos.fecha ||
      (plantillaSeleccionada.id !== "multas" && !datos.hora) ||
      (plantillaSeleccionada.id !== "multas" && !datos.lugar) ||
      (plantillaSeleccionada.id === "convocatoria" && !datos.rival) ||
      (plantillaSeleccionada.id !== "multas" &&
        Object.keys(jugadoresSeleccionados).filter((id) => jugadoresSeleccionados[id]).length === 0)
    ) {
      Alert.alert("Datos incompletos", "Por favor completa todos los campos requeridos.")
      return
    }

    try {
      // Crear mensaje para WhatsApp
      console.log("Mensaje antes de enviar:", mensajeFinal)
      const mensaje = encodeURIComponent(mensajeFinal)

      // Abrir WhatsApp con el mensaje
      const url = `whatsapp://send?text=${mensaje}`
      const supported = await Linking.canOpenURL(url)

      if (supported) {
        await Linking.openURL(url)
      } else {
        Alert.alert("Error", "WhatsApp no está instalado en este dispositivo.")
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir WhatsApp.")
    }
  }

  const enviarPorWhatsAppIndividual = async () => {
    // Verificar que todos los campos necesarios estén completos
    if (
      !datos.fecha ||
      (plantillaSeleccionada.id !== "multas" && !datos.hora) ||
      (plantillaSeleccionada.id !== "multas" && !datos.lugar) ||
      (plantillaSeleccionada.id === "convocatoria" && !datos.rival) ||
      (plantillaSeleccionada.id !== "multas" &&
        Object.keys(jugadoresSeleccionados).filter((id) => jugadoresSeleccionados[id]).length === 0)
    ) {
      Alert.alert("Datos incompletos", "Por favor completa todos los campos requeridos.")
      return
    }

    // Preguntar si quiere enviar a todos los jugadores seleccionados
    Alert.alert("Enviar mensaje", "¿Quieres enviar este mensaje a todos los jugadores seleccionados individualmente?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Enviar",
        onPress: async () => {
          let jugadoresDestino = []

          if (plantillaSeleccionada.id === "multas") {
            // Para multas, enviar a los jugadores con multas pendientes
            jugadoresDestino = getJugadoresConMultas()
          } else {
            // Para otros tipos, usar los jugadores seleccionados
            jugadoresDestino = jugadores.filter((j) => jugadoresSeleccionados[j.id])
          }

          if (jugadoresDestino.length === 0) {
            Alert.alert("Sin destinatarios", "No hay jugadores seleccionados para enviar el mensaje.")
            return
          }

          // Mostrar alerta de progreso
          Alert.alert(
            "Enviando mensajes",
            `Se abrirá WhatsApp para cada uno de los ${jugadoresDestino.length} jugadores.`,
            [
              {
                text: "OK",
                onPress: async () => {
                  // Enviar a cada jugador
                  for (const jugador of jugadoresDestino) {
                    try {
                      const mensaje = encodeURIComponent(mensajeFinal)
                      // Formatear número de teléfono (eliminar espacios y añadir prefijo si es necesario)
                      let telefono = jugador.phone.replace(/\s+/g, "")
                      if (!telefono.startsWith("+")) {
                        telefono = `+34${telefono}` // Añadir prefijo de España por defecto
                      }

                      const url = `whatsapp://send?phone=${telefono}&text=${mensaje}`
                      const supported = await Linking.canOpenURL(url)

                      if (supported) {
                        await Linking.openURL(url)
                        // Esperar un poco entre cada apertura
                        await new Promise((resolve) => setTimeout(resolve, 1000))
                      } else {
                        throw new Error("WhatsApp no está instalado")
                      }
                    } catch (error) {
                      Alert.alert("Error", `No se pudo enviar el mensaje a ${jugador.name}.`)
                      break
                    }
                  }
                },
              },
            ],
          )
        },
      },
    ])
  }

  // Componente para el modal de búsqueda de ubicaciones
  const LocationSearchModal = () => (
    <Modal
      visible={showLocationModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowLocationModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buscar lugar</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <SearchIcon size={20} color={COLORS.textSecondary} />
            <TextInput
              placeholder="Buscar estadio, campo, etc..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchLocation}
              onChangeText={(text) => {
                setSearchLocation(text)
                if (text.length > 2) {
                  setSearchResults(searchPlaces(text))
                } else {
                  setSearchResults([])
                }
              }}
              style={styles.searchInput}
              autoFocus={true}
            />
          </View>

          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.locationItem} onPress={() => selectLocation(item)}>
                <MapIcon size={20} color={COLORS.primary} />
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{item.name}</Text>
                  <Text style={styles.locationAddress}>{item.address}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyResultsText}>
                {searchLocation.length > 2
                  ? "No se encontraron resultados"
                  : "Escribe al menos 3 caracteres para buscar"}
              </Text>
            }
          />
        </View>
      </View>
    </Modal>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Generar convocatoria</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Selector de plantilla */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seleccionar plantilla</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.plantillasContainer}
          >
            {PLANTILLAS.map((plantilla) => (
              <TouchableOpacity
                key={plantilla.id}
                style={[
                  styles.plantillaCard,
                  plantillaSeleccionada.id === plantilla.id && styles.plantillaSeleccionada,
                ]}
                onPress={() => setPlantillaSeleccionada(plantilla)}
                activeOpacity={0.7}
              >
                <FileIcon
                  size={24}
                  color={plantillaSeleccionada.id === plantilla.id ? COLORS.primary : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.plantillaText,
                    plantillaSeleccionada.id === plantilla.id && styles.plantillaTextSeleccionada,
                  ]}
                >
                  {plantilla.nombre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Datos de la convocatoria */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos</Text>

          {/* Fecha - siempre visible para todas las plantillas */}
          <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
            <CalendarIcon size={20} color={COLORS.primary} />
            <Text style={datos.fecha ? styles.input : styles.inputPlaceholder}>{datos.fecha || "Fecha *"}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={new Date()} mode="date" display="spinner" onChange={handleDateChange} />
          )}

          {/* Hora - solo visible para convocatorias y entrenamientos */}
          {plantillaSeleccionada.id !== "multas" && (
            <>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <ClockIcon size={20} color={COLORS.primary} />
                <Text style={datos.hora ? styles.input : styles.inputPlaceholder}>{datos.hora || "Hora *"}</Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker value={new Date()} mode="time" display="spinner" onChange={handleTimeChange} />
              )}
            </>
          )}

          {/* Lugar - solo visible para convocatorias y entrenamientos */}
          {plantillaSeleccionada.id !== "multas" && (
            <View style={styles.inputContainer}>
              <MapIcon size={20} color={COLORS.primary} />
              <TextInput
                placeholder="Lugar *"
                placeholderTextColor={COLORS.textSecondary}
                value={datos.lugar}
                onChangeText={(text) => setDatos({ ...datos, lugar: text })}
                style={styles.input}
              />
              <TouchableOpacity style={styles.locationButton} onPress={() => setShowLocationModal(true)}>
                <Text style={styles.locationButtonText}>Buscar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rival (solo para convocatoria de partido) */}
          {plantillaSeleccionada.id === "convocatoria" && (
            <View style={styles.inputContainer}>
              <UserFriendsIcon size={20} color={COLORS.primary} />
              <TextInput
                placeholder="Rival *"
                placeholderTextColor={COLORS.textSecondary}
                value={datos.rival}
                onChangeText={(text) => setDatos({ ...datos, rival: text })}
                style={styles.input}
              />
            </View>
          )}
        </View>

        {/* Selección de jugadores (solo para convocatorias y entrenamientos) */}
        {plantillaSeleccionada.id !== "multas" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Seleccionar jugadores</Text>
              <View style={styles.selectionButtons}>
                <TouchableOpacity style={styles.selectionButton} onPress={seleccionarTodos} activeOpacity={0.7}>
                  <Text style={styles.selectionButtonText}>Todos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectionButton, styles.selectionButtonClear]}
                  onPress={deseleccionarTodos}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectionButtonText}>Ninguno</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buscador */}
            <View style={styles.searchContainer}>
              <SearchIcon size={20} color={COLORS.textSecondary} />
              <TextInput
                placeholder="Buscar jugador..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
            </View>

            {/* Lista de jugadores */}
            <View style={styles.jugadoresList}>
              {jugadoresFiltrados.map((jugador) => (
                <TouchableOpacity
                  key={jugador.id}
                  style={styles.jugadorItem}
                  onPress={() => toggleJugadorSeleccionado(jugador.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.jugadorInfo}>
                    <Text style={styles.jugadorNombre}>{jugador.name}</Text>
                    <Text style={styles.jugadorPosicion}>{jugador.position}</Text>
                  </View>
                  <View style={[styles.checkbox, jugadoresSeleccionados[jugador.id] && styles.checkboxSelected]}>
                    {jugadoresSeleccionados[jugador.id] && <CheckIcon size={16} color="#fff" />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Sección especial para multas */}
        {plantillaSeleccionada.id === "multas" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informe de multas</Text>
            <Text style={styles.infoText}>
              Este informe mostrará automáticamente todos los jugadores que tienen multas pendientes de pago.
            </Text>

            <View style={styles.multasSummary}>
              {getJugadoresConMultas().length > 0 ? (
                getJugadoresConMultas().map((jugador) => (
                  <View key={jugador.id} style={styles.multaItem}>
                    <View style={styles.multaHeader}>
                      <Text style={styles.multaPlayerName}>{jugador.name}</Text>
                      <Text style={styles.multaTotal}>{jugador.totalPendiente}€</Text>
                    </View>
                    {jugador.multasPendientes.map((multa, index) => (
                      <View key={index} style={styles.multaDetail}>
                        <Text style={styles.multaReason}>{multa.reason}</Text>
                        <Text style={styles.multaAmount}>{multa.amount}€</Text>
                        <Text style={styles.multaDate}>{multa.date}</Text>
                      </View>
                    ))}
                  </View>
                ))
              ) : (
                <Text style={styles.noMultasText}>No hay jugadores con multas pendientes.</Text>
              )}
            </View>
          </View>
        )}

        {/* Vista previa y botones de acción */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.previewToggle}
            onPress={() => setMostrarPreview(!mostrarPreview)}
            activeOpacity={0.7}
          >
            <Text style={styles.previewToggleText}>
              {mostrarPreview ? "Ocultar vista previa" : "Mostrar vista previa"}
            </Text>
          </TouchableOpacity>

          {mostrarPreview && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>{mensajeFinal}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={enviarPorWhatsApp} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.actionButtonGradient}>
                <EnvelopeIcon size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Enviar a grupo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={enviarPorWhatsAppIndividual} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.secondary, "#E09600"]} style={styles.actionButtonGradient}>
                <UserFriendsIcon size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Enviar individual</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal de búsqueda de ubicaciones */}
      {showLocationModal && <LocationSearchModal />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "bold",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: "bold",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  selectionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectionButtonClear: {
    backgroundColor: COLORS.textSecondary,
  },
  selectionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  plantillasContainer: {
    paddingBottom: 8,
    gap: 12,
  },
  plantillaCard: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    minWidth: 120,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  plantillaSeleccionada: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  plantillaText: {
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: "center",
  },
  plantillaTextSeleccionada: {
    color: COLORS.text,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  inputPlaceholder: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 10,
    marginLeft: 8,
  },
  jugadoresList: {
    gap: 8,
  },
  jugadorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  jugadorInfo: {
    flex: 1,
  },
  jugadorNombre: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  jugadorPosicion: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  previewToggle: {
    alignSelf: "center",
    backgroundColor: COLORS.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  previewToggleText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  previewContainer: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  previewText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  actionButtonGradient: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Estilos para el modal de ubicaciones
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  locationButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  locationButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  locationAddress: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  emptyResultsText: {
    color: COLORS.textSecondary,
    textAlign: "center",
    padding: 16,
  },
  // Estilos para la sección de multas
  infoText: {
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  multasSummary: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  multaItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    paddingBottom: 12,
  },
  multaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  multaPlayerName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  multaTotal: {
    color: COLORS.danger,
    fontSize: 16,
    fontWeight: "bold",
  },
  multaDetail: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
    paddingLeft: 12,
  },
  multaReason: {
    color: COLORS.text,
    fontSize: 14,
    flex: 2,
  },
  multaAmount: {
    color: COLORS.danger,
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  multaDate: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flex: 1,
    textAlign: "right",
  },
  noMultasText: {
    color: COLORS.success,
    textAlign: "center",
    padding: 16,
    fontSize: 16,
  },
})
