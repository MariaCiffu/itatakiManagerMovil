"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserFriendsIcon,
  SearchIcon,
  CheckIcon,
  FileIcon,
  MapIcon,
  TrophyIcon,
  NumberIcon,
  PlusIcon,
  WhatsAppIcon,
  ShirtIcon,
} from "../../components/Icons";
import { COLORS } from "../../constants/colors";
import {
  getAllJugadores,
  getJugadoresConMultas,
} from "../../services/playersService";
import PLANTILLAS from "../../data/plantillasConv";
import { POSICIONES } from "../../constants/positions";
import { useAuth } from "../../hooks/useFirebase";

export default function Convocatorias() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(
    PLANTILLAS[0]
  );

  // ✅ Inicializar jugadores desde el servicio
  const [jugadores, setJugadores] = useState([]);
  const [jugadoresSeleccionados, setJugadoresSeleccionados] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showCitacionPicker, setShowCitacionPicker] = useState(false);
  const [datos, setDatos] = useState({
    fecha: "",
    hora: "",
    citacion: "",
    lugar: "",
    rival: "",
    tipoPartido: "liga",
    jornada: "",
    nombreTorneo: "",
  });
  const [mensajeFinal, setMensajeFinal] = useState("");
  const [mostrarPreview, setMostrarPreview] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [tempPlayer, setTempPlayer] = useState({
    name: "",
    number: "",
    position: "JUG",
  });
  const [loadingJugadores, setLoadingJugadores] = useState(true);

  useEffect(() => {
    const loadAllJugadores = async () => {
      try {
        setLoadingJugadores(true);

        // 1. Cargar jugadores de Firebase
        let jugadoresData = await getAllJugadores();
        console.log("Jugadores de Firebase cargados:", jugadoresData.length);

        // 2. Procesar datos del partido si existen
        if (params.datosPartido) {
          const datosPartido = JSON.parse(params.datosPartido);

          // 2a. Agregar jugadores temporales del partido
          if (
            datosPartido.temporaryPlayers &&
            datosPartido.temporaryPlayers.length > 0
          ) {
            console.log(
              "Agregando jugadores temporales del partido:",
              datosPartido.temporaryPlayers.length
            );
            jugadoresData = [
              ...jugadoresData,
              ...datosPartido.temporaryPlayers,
            ];
          }

          // 2b. Configurar datos del partido
          setDatos({
            fecha: datosPartido.fecha || "",
            hora: datosPartido.hora || "",
            citacion: "",
            lugar: datosPartido.lugar || "",
            rival: datosPartido.rival || "",
            tipoPartido: datosPartido.tipoPartido || "liga",
            jornada: datosPartido.jornada || "",
            nombreTorneo: datosPartido.nombreTorneo || "",
          });

          // 2c. Configurar jugadores seleccionados
          if (datosPartido.jugadoresSeleccionados) {
            const seleccionados = {};

            if (datosPartido.jugadoresSeleccionados.titulares) {
              datosPartido.jugadoresSeleccionados.titulares.forEach((id) => {
                if (id) seleccionados[id] = true;
              });
            }

            if (datosPartido.jugadoresSeleccionados.suplentes) {
              datosPartido.jugadoresSeleccionados.suplentes.forEach((id) => {
                if (id) seleccionados[id] = true;
              });
            }

            setJugadoresSeleccionados(seleccionados);
          }

          // 2d. Seleccionar plantilla de convocatoria
          const plantillaConvocatoria = PLANTILLAS.find(
            (p) => p.id === "convocatoria"
          );
          if (plantillaConvocatoria) {
            setPlantillaSeleccionada(plantillaConvocatoria);
          }
        }

        // 3. Establecer jugadores finales
        setJugadores(jugadoresData);
        console.log("Total jugadores cargados:", jugadoresData.length);
      } catch (error) {
        console.error("Error cargando datos:", error);
        Alert.alert("Error", "No se pudieron cargar los datos");
      } finally {
        setLoadingJugadores(false);
      }
    };

    loadAllJugadores();
  }, [params.datosPartido]);

  // Función para formatear la fecha
  const formatearFecha = useCallback((fechaStr) => {
    if (!fechaStr) return "";

    try {
      const partes = fechaStr.split("/");
      if (partes.length !== 3) return fechaStr;

      const fecha = new Date(partes[2], partes[1] - 1, partes[0]);

      const diasSemana = [
        "DOMINGO",
        "LUNES",
        "MARTES",
        "MIÉRCOLES",
        "JUEVES",
        "VIERNES",
        "SÁBADO",
      ];

      const meses = [
        "ENERO",
        "FEBRERO",
        "MARZO",
        "ABRIL",
        "MAYO",
        "JUNIO",
        "JULIO",
        "AGOSTO",
        "SEPTIEMBRE",
        "OCTUBRE",
        "NOVIEMBRE",
        "DICIEMBRE",
      ];

      const diaSemana = diasSemana[fecha.getDay()];
      const dia = fecha.getDate();
      const mes = meses[fecha.getMonth()];

      return `${diaSemana} ${dia} ${mes}`;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return fechaStr;
    }
  }, []);

  // Filtrar y ordenar jugadores según la búsqueda, posición y número de dorsal
  const jugadoresFiltrados = useMemo(() => {
    const jugadoresFiltrados = searchQuery
      ? jugadores.filter(
          (jugador) =>
            jugador.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            jugador.position
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            jugador.number.toString().includes(searchQuery)
        )
      : jugadores;

    // ✅ Ordenar primero por posición (según array POSICIONES) y luego por número de dorsal
    return jugadoresFiltrados.sort((a, b) => {
      // Obtener índice de posición en el array POSICIONES
      const posicionA = POSICIONES.indexOf(a.position);
      const posicionB = POSICIONES.indexOf(b.position);

      // Si las posiciones son diferentes, ordenar por posición
      if (posicionA !== posicionB) {
        // Si la posición no está en el array, ponerla al final
        const indexA = posicionA === -1 ? 999 : posicionA;
        const indexB = posicionB === -1 ? 999 : posicionB;
        return indexA - indexB;
      }

      // Si tienen la misma posición, ordenar por número de dorsal
      const numeroA = Number(a.number) || 999;
      const numeroB = Number(b.number) || 999;
      return numeroA - numeroB;
    });
  }, [jugadores, searchQuery]);

  // Calcular jugadores convocados y no convocados (ordenados por posición y dorsal)
  const jugadoresConvocados = useMemo(() => {
    return jugadores
      .filter((j) => jugadoresSeleccionados[j.id])
      .sort((a, b) => {
        // Ordenar por posición primero
        const posicionA = POSICIONES.indexOf(a.position);
        const posicionB = POSICIONES.indexOf(b.position);

        if (posicionA !== posicionB) {
          const indexA = posicionA === -1 ? 999 : posicionA;
          const indexB = posicionB === -1 ? 999 : posicionB;
          return indexA - indexB;
        }

        // Luego por número de dorsal
        const numeroA = Number(a.number) || 999;
        const numeroB = Number(b.number) || 999;
        return numeroA - numeroB;
      });
  }, [jugadores, jugadoresSeleccionados]);

  const jugadoresNoConvocados = useMemo(() => {
    return jugadores
      .filter((j) => !jugadoresSeleccionados[j.id])
      .sort((a, b) => {
        // Ordenar por posición primero
        const posicionA = POSICIONES.indexOf(a.position);
        const posicionB = POSICIONES.indexOf(b.position);

        if (posicionA !== posicionB) {
          const indexA = posicionA === -1 ? 999 : posicionA;
          const indexB = posicionB === -1 ? 999 : posicionB;
          return indexA - indexB;
        }

        // Luego por número de dorsal
        const numeroA = Number(a.number) || 999;
        const numeroB = Number(b.number) || 999;
        return numeroA - numeroB;
      });
  }, [jugadores, jugadoresSeleccionados]);

  // Actualizar mensaje cuando cambian los datos o jugadores seleccionados
  useEffect(() => {
    generarMensaje();
  }, [
    datos,
    jugadoresSeleccionados,
    plantillaSeleccionada,
    jugadoresConvocados,
    jugadoresNoConvocados,
  ]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = selectedDate.getFullYear();
      const dateStr = `${day}/${month}/${year}`;

      setDatos({
        ...datos,
        fecha: dateStr,
      });
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, "0");
      const minutes = String(selectedTime.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;

      setDatos({
        ...datos,
        hora: timeStr,
      });
    }
  };

  const handleCitacionChange = (event, selectedTime) => {
    setShowCitacionPicker(false);
    if (selectedTime) {
      const hours = String(selectedTime.getHours()).padStart(2, "0");
      const minutes = String(selectedTime.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;
      setDatos({ ...datos, citacion: timeStr });
    }
  };

  const toggleJugadorSeleccionado = useCallback((jugadorId) => {
    setJugadoresSeleccionados((prev) => ({
      ...prev,
      [jugadorId]: !prev[jugadorId],
    }));
  }, []);

  const seleccionarTodos = useCallback(() => {
    const todos = {};
    jugadores.forEach((jugador) => {
      todos[jugador.id] = true;
    });
    setJugadoresSeleccionados(todos);
  }, [jugadores]);

  const deseleccionarTodos = useCallback(() => {
    setJugadoresSeleccionados({});
  }, []);

  const cambiarTipoPartido = useCallback((tipo) => {
    setDatos((prev) => ({
      ...prev,
      tipoPartido: tipo,
      jornada: tipo === "liga" ? prev.jornada : "",
      nombreTorneo: tipo === "torneo" ? prev.nombreTorneo : "",
      rival: tipo === "torneo" ? "" : prev.rival,
    }));
  }, []);

  const generateMapsLink = useCallback((lugar) => {
    if (!lugar) return "";
    const encodedPlace = encodeURIComponent(lugar);
    return `https://www.google.com/maps/search/?api=1&query=${encodedPlace}`;
  }, []);

  const generarMensaje = useCallback(() => {
    let mensaje = plantillaSeleccionada.texto;

    const fechaFormateada = formatearFecha(datos.fecha);
    mensaje = mensaje.replace("{fecha}", fechaFormateada || "[FECHA]");

    let tipoPartidoTexto = "";
    if (datos.tipoPartido === "liga") {
      tipoPartidoTexto = `JORNADA ${datos.jornada ? datos.jornada : "[NUMERO JORNADA]"} DE ${user?.category.toUpperCase() || "[CATEGORÍA]"}`;
    } else if (datos.tipoPartido === "torneo") {
      tipoPartidoTexto = `TORNEO ${datos.nombreTorneo ? datos.nombreTorneo.toUpperCase() : "[NOMBRE DEL TORNEO]"}`;
    } else if (datos.tipoPartido === "amistoso") {
      tipoPartidoTexto = "AMISTOSO";
    }

    mensaje = mensaje.replace("{tipoPartido}", tipoPartidoTexto);

    if (plantillaSeleccionada.id !== "multas") {
      mensaje = mensaje.replace("{hora}", datos.hora || "[HORA]");
      mensaje = mensaje.replace(
        "{citacion}",
        datos.citacion || "[HORA DE CITACIÓN]"
      );

      if (datos.lugar) {
        const mapsLink = generateMapsLink(datos.lugar);
        mensaje = mensaje.replace("{lugar}", `${datos.lugar}\n${mapsLink}`);
      } else {
        mensaje = mensaje.replace("{lugar}", "[LUGAR]");
      }

      if (datos.tipoPartido !== "torneo") {
        mensaje = mensaje.replace("{rival}", datos.rival || "[RIVAL]");
      } else {
        mensaje = mensaje.replace(" - {rival}", "");
      }
    }

    let listaJugadoresConvocados = "";
    let listaJugadoresNoConvocados = "";

    // ✅ Caso especial para el informe de multas
    if (plantillaSeleccionada.id === "multas") {
      console.log("🚨 Generando informe de multas...");
      const jugadoresConMultas = getJugadoresConMultas();
      console.log("📋 Jugadores con multas:", jugadoresConMultas);

      if (jugadoresConMultas.length > 0) {
        jugadoresConMultas.forEach((jugador, index) => {
          listaJugadoresConvocados += `${index + 1}. ${jugador.name} - Total: ${jugador.totalPendiente}€\n`;
          jugador.multasPendientes.forEach((multa) => {
            listaJugadoresConvocados += `   • ${multa.reason}: ${multa.amount}€ (${multa.date})\n`;
          });
          listaJugadoresConvocados += "\n";
        });
      } else {
        listaJugadoresConvocados = "No hay jugadores con multas pendientes.";
      }
    } else {
      // Para otros tipos de plantillas, usar la selección manual
      if (jugadoresConvocados.length > 0) {
        jugadoresConvocados.forEach((jugador, index) => {
          listaJugadoresConvocados += `${index + 1}. ${jugador.name}\n`;
        });
      } else {
        listaJugadoresConvocados = "[SELECCIONA JUGADORES]";
      }

      if (jugadoresNoConvocados.length > 0) {
        jugadoresNoConvocados.forEach((jugador, index) => {
          listaJugadoresNoConvocados += `${index + 1}. ${jugador.name}\n`;
        });
        mensaje = mensaje.replace("{jugadoresNo}", listaJugadoresNoConvocados);
      } else {
        mensaje = mensaje.replace(
          "\n\n*Jugadores no convocados:*\n{jugadoresNo}",
          ""
        );
      }
    }

    mensaje = mensaje.replace("{jugadores}", listaJugadoresConvocados);
    setMensajeFinal(mensaje);
  }, [
    datos,
    jugadoresConvocados,
    jugadoresNoConvocados,
    plantillaSeleccionada,
    formatearFecha,
    generateMapsLink,
    user,
  ]);

  const enviarPorWhatsApp = useCallback(async () => {
    if (
      !datos.fecha ||
      (plantillaSeleccionada.id !== "multas" && !datos.hora) ||
      (plantillaSeleccionada.id !== "multas" && !datos.lugar) ||
      (plantillaSeleccionada.id === "convocatoria" &&
        datos.tipoPartido !== "torneo" &&
        !datos.rival) ||
      (plantillaSeleccionada.id === "convocatoria" &&
        datos.tipoPartido === "liga" &&
        !datos.jornada) ||
      (plantillaSeleccionada.id === "convocatoria" &&
        datos.tipoPartido === "torneo" &&
        !datos.nombreTorneo) ||
      (plantillaSeleccionada.id !== "multas" &&
        Object.keys(jugadoresSeleccionados).filter(
          (id) => jugadoresSeleccionados[id]
        ).length === 0)
    ) {
      Alert.alert(
        "Datos incompletos",
        "Por favor completa todos los campos requeridos."
      );
      return;
    }

    try {
      console.log("Mensaje antes de enviar:", mensajeFinal);
      const mensaje = encodeURIComponent(mensajeFinal);

      const url = `whatsapp://send?text=${mensaje}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "WhatsApp no está instalado en este dispositivo.");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir WhatsApp.");
    }
  }, [datos, jugadoresSeleccionados, mensajeFinal, plantillaSeleccionada]);

  const getPlaceholderText = (field) => {
    if (field === "fecha") {
      return datos.tipoPartido === "torneo"
        ? "Fecha del torneo *"
        : "Fecha del partido *";
    } else if (field === "hora") {
      return datos.tipoPartido === "torneo"
        ? "Hora del torneo *"
        : "Hora del partido *";
    }
    return "";
  };

  const handleAddTempPlayer = () => {
    if (!tempPlayer.name || !tempPlayer.number || !tempPlayer.position) {
      Alert.alert("Error", "Por favor, complete todos los campos.");
      return;
    }

    const newPlayer = {
      id: `temp-${Date.now()}`,
      name: tempPlayer.name,
      position: tempPlayer.position,
      number: Number.parseInt(tempPlayer.number),
      phone: "+34666666666",
      isTemporary: true,
    };

    setJugadores((prevJugadores) => [...prevJugadores, newPlayer]);

    setJugadoresSeleccionados((prev) => ({
      ...prev,
      [newPlayer.id]: true,
    }));

    setShowAddPlayerModal(false);
    setTempPlayer({ name: "", number: "", position: "JUG" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
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
                  plantillaSeleccionada.id === plantilla.id &&
                    styles.plantillaSeleccionada,
                ]}
                onPress={() => setPlantillaSeleccionada(plantilla)}
                activeOpacity={0.7}
              >
                <FileIcon
                  size={24}
                  color={
                    plantillaSeleccionada.id === plantilla.id
                      ? COLORS.primary
                      : COLORS.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.plantillaText,
                    plantillaSeleccionada.id === plantilla.id &&
                      styles.plantillaTextSeleccionada,
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

          {/* Tipo de partido - solo visible para convocatorias */}
          {plantillaSeleccionada.id === "convocatoria" && (
            <View style={styles.tipoPartidoContainer}>
              <Text style={styles.tipoPartidoLabel}>Tipo de partido:</Text>
              <View style={styles.tipoPartidoOptions}>
                <TouchableOpacity
                  style={[
                    styles.tipoPartidoOption,
                    datos.tipoPartido === "liga" &&
                      styles.tipoPartidoOptionSelected,
                  ]}
                  onPress={() => cambiarTipoPartido("liga")}
                >
                  <Text
                    style={[
                      styles.tipoPartidoText,
                      datos.tipoPartido === "liga" &&
                        styles.tipoPartidoTextSelected,
                    ]}
                  >
                    Liga
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoPartidoOption,
                    datos.tipoPartido === "amistoso" &&
                      styles.tipoPartidoOptionSelected,
                  ]}
                  onPress={() => cambiarTipoPartido("amistoso")}
                >
                  <Text
                    style={[
                      styles.tipoPartidoText,
                      datos.tipoPartido === "amistoso" &&
                        styles.tipoPartidoTextSelected,
                    ]}
                  >
                    Amistoso
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.tipoPartidoOption,
                    datos.tipoPartido === "torneo" &&
                      styles.tipoPartidoOptionSelected,
                  ]}
                  onPress={() => cambiarTipoPartido("torneo")}
                >
                  <Text
                    style={[
                      styles.tipoPartidoText,
                      datos.tipoPartido === "torneo" &&
                        styles.tipoPartidoTextSelected,
                    ]}
                  >
                    Torneo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Jornada - solo visible para partidos de liga */}
          {plantillaSeleccionada.id === "convocatoria" &&
            datos.tipoPartido === "liga" && (
              <View style={styles.inputContainer}>
                <NumberIcon size={20} color={COLORS.primary} />
                <TextInput
                  placeholder="Número de jornada *"
                  placeholderTextColor={COLORS.textSecondary}
                  value={datos.jornada}
                  onChangeText={(text) => setDatos({ ...datos, jornada: text })}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
            )}

          {/* Nombre del torneo - solo visible para torneos */}
          {plantillaSeleccionada.id === "convocatoria" &&
            datos.tipoPartido === "torneo" && (
              <View style={styles.inputContainer}>
                <TrophyIcon size={20} color={COLORS.primary} />
                <TextInput
                  placeholder="Nombre del torneo *"
                  placeholderTextColor={COLORS.textSecondary}
                  value={datos.nombreTorneo}
                  onChangeText={(text) =>
                    setDatos({ ...datos, nombreTorneo: text })
                  }
                  style={styles.input}
                />
              </View>
            )}

          {/* Fecha - siempre visible para todas las plantillas */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.7}
          >
            <CalendarIcon size={20} color={COLORS.primary} />
            <Text style={datos.fecha ? styles.input : styles.inputPlaceholder}>
              {datos.fecha
                ? formatearFecha(datos.fecha)
                : getPlaceholderText("fecha")}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}

          {/* Hora del partido - solo visible para convocatorias y entrenamientos */}
          {plantillaSeleccionada.id !== "multas" && (
            <>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowTimePicker(true)}
                activeOpacity={0.7}
              >
                <ClockIcon size={20} color={COLORS.primary} />
                <Text
                  style={datos.hora ? styles.input : styles.inputPlaceholder}
                >
                  {datos.hora || getPlaceholderText("hora")}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="spinner"
                  onChange={handleTimeChange}
                />
              )}
            </>
          )}

          {/* Rival - solo visible para convocatorias de liga y amistosos */}
          {plantillaSeleccionada.id === "convocatoria" &&
            datos.tipoPartido !== "torneo" && (
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

          {/* Hora de citación - solo visible para convocatorias y entrenamientos */}
          {plantillaSeleccionada.id !== "multas" && (
            <>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowCitacionPicker(true)}
                activeOpacity={0.7}
              >
                <ClockIcon size={20} color={COLORS.warning} />
                <Text
                  style={
                    datos.citacion ? styles.input : styles.inputPlaceholder
                  }
                >
                  {datos.citacion || "Hora de citación *"}
                </Text>
              </TouchableOpacity>
              {showCitacionPicker && (
                <DateTimePicker
                  value={new Date()}
                  mode="time"
                  display="spinner"
                  onChange={handleCitacionChange}
                />
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
            </View>
          )}
        </View>

        {/* Selección de jugadores (solo para convocatorias y entrenamientos) */}
        {plantillaSeleccionada.id !== "multas" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Seleccionar jugadores</Text>
              <View style={styles.selectionButtons}>
                <TouchableOpacity
                  style={styles.selectionButton}
                  onPress={seleccionarTodos}
                  activeOpacity={0.7}
                >
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

            {/* Buscador con botón de añadir */}
            <View style={styles.searchContainer}>
              <SearchIcon size={20} color={COLORS.textSecondary} />
              <TextInput
                placeholder="Buscar jugador..."
                placeholderTextColor={COLORS.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              <TouchableOpacity
                style={styles.addPlayerButton}
                onPress={() => setShowAddPlayerModal(true)}
                activeOpacity={0.7}
              >
                <PlusIcon size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            {/* Lista de jugadores */}
            <View style={styles.jugadoresList}>
              {jugadoresFiltrados.map((jugador) => (
                <TouchableOpacity
                  key={jugador.id}
                  style={[
                    styles.jugadorItem,
                    jugador.isTemporary && styles.jugadorItemTemporary,
                  ]}
                  onPress={() => toggleJugadorSeleccionado(jugador.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.jugadorInfo}>
                    <View style={styles.jugadorHeader}>
                      <Text style={styles.jugadorNombre}>{jugador.name}</Text>
                      <Text style={styles.jugadorNumero}>
                        #{jugador.number}
                      </Text>
                    </View>
                    <View style={styles.jugadorDetalles}>
                      <Text style={styles.jugadorPosicion}>
                        {jugador.position}
                      </Text>
                      {jugador.isTemporary && (
                        <View style={styles.temporaryBadge}>
                          <Text style={styles.temporaryBadgeText}>
                            Temporal
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.checkbox,
                      jugadoresSeleccionados[jugador.id] &&
                        styles.checkboxSelected,
                      jugador.isTemporary &&
                        jugadoresSeleccionados[jugador.id] &&
                        styles.checkboxSelectedTemporary,
                    ]}
                  >
                    {jugadoresSeleccionados[jugador.id] && (
                      <CheckIcon size={16} color="#fff" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Resumen de selección */}
            <View style={styles.selectionSummary}>
              <Text style={styles.summaryText}>
                Convocados: {jugadoresConvocados.length} | No convocados:{" "}
                {jugadoresNoConvocados.length}
              </Text>
            </View>
          </View>
        )}

        {/* ✅ Sección especial para multas */}
        {plantillaSeleccionada.id === "multas" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informe de multas</Text>
            <Text style={styles.infoText}>
              Este informe mostrará automáticamente todos los jugadores que
              tienen multas pendientes de pago.
            </Text>

            <View style={styles.multasSummary}>
              {(() => {
                const jugadoresConMultas = getJugadoresConMultas();
                console.log("🎯 Renderizando multas:", jugadoresConMultas);

                return jugadoresConMultas.length > 0 ? (
                  jugadoresConMultas.map((jugador) => (
                    <View key={jugador.id} style={styles.multaItem}>
                      <View style={styles.multaHeader}>
                        <Text style={styles.multaPlayerName}>
                          {jugador.name}
                        </Text>
                        <Text style={styles.multaTotal}>
                          {jugador.totalPendiente}€
                        </Text>
                      </View>
                      {jugador.multasPendientes.map((multa, index) => (
                        <View key={index} style={styles.multaDetail}>
                          <Text style={styles.multaReason}>{multa.reason}</Text>
                          <Text style={styles.multaAmount}>
                            {multa.amount}€
                          </Text>
                          <Text style={styles.multaDate}>{multa.date}</Text>
                        </View>
                      ))}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noMultasText}>
                    No hay jugadores con multas pendientes.
                  </Text>
                );
              })()}
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
            <TouchableOpacity
              style={styles.actionButton}
              onPress={enviarPorWhatsApp}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.actionButtonGradient}
              >
                <WhatsAppIcon />
                <Text style={styles.actionButtonText}>Enviar a grupo</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modal para añadir jugador temporal */}
      <Modal
        visible={showAddPlayerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddPlayerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={["#FF9500", "#FF7800"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Añadir jugador temporal</Text>
            </LinearGradient>

            <View style={styles.modalContent}>
              <View style={styles.inputContainer}>
                <UserFriendsIcon size={20} color="#FF9500" />
                <TextInput
                  placeholder="Nombre del jugador *"
                  placeholderTextColor={COLORS.textSecondary}
                  value={tempPlayer.name}
                  onChangeText={(text) =>
                    setTempPlayer({ ...tempPlayer, name: text })
                  }
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <ShirtIcon size={20} color="#FF9500" />
                <TextInput
                  placeholder="Número de dorsal *"
                  placeholderTextColor={COLORS.textSecondary}
                  value={tempPlayer.number}
                  onChangeText={(text) =>
                    setTempPlayer({ ...tempPlayer, number: text })
                  }
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.positionLabel}>Posición:</Text>
              <View style={styles.positionContainer}>
                {POSICIONES.map((pos) => (
                  <TouchableOpacity
                    key={pos}
                    style={[
                      styles.positionButton,
                      tempPlayer.position === pos &&
                        styles.positionButtonSelected,
                    ]}
                    onPress={() =>
                      setTempPlayer({ ...tempPlayer, position: pos })
                    }
                  >
                    <Text
                      style={[
                        styles.positionButtonText,
                        tempPlayer.position === pos &&
                          styles.positionButtonTextSelected,
                      ]}
                    >
                      {pos}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowAddPlayerModal(false)}
                >
                  <Text style={styles.buttonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.addButton]}
                  onPress={handleAddTempPlayer}
                >
                  <LinearGradient
                    colors={["#FF9500", "#FF7800"]}
                    style={styles.addButtonGradient}
                  >
                    <Text style={styles.addButtonText}>Añadir</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
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
  tipoPartidoContainer: {
    marginBottom: 16,
  },
  tipoPartidoLabel: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 8,
  },
  tipoPartidoOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  tipoPartidoOption: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tipoPartidoOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
  },
  tipoPartidoText: {
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  tipoPartidoTextSelected: {
    color: COLORS.text,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 12,
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 0,
    minHeight: 52,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 14,
  },
  inputPlaceholder: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 16,
    paddingVertical: 14,
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
    minHeight: 52,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    paddingVertical: 14,
    marginLeft: 8,
  },
  addPlayerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${COLORS.primary}20`,
    justifyContent: "center",
    alignItems: "center",
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
  jugadorItemTemporary: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  jugadorInfo: {
    flex: 1,
  },
  jugadorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  jugadorNombre: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "bold",
  },
  jugadorNumero: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  jugadorPosicion: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  jugadorDetalles: {
    flexDirection: "row",
    alignItems: "center",
  },
  temporaryBadge: {
    backgroundColor: "#FF9500",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  temporaryBadgeText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "bold",
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
  checkboxSelectedTemporary: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
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
  selectionSummary: {
    marginTop: 12,
    backgroundColor: COLORS.card,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  summaryText: {
    color: COLORS.text,
    fontSize: 14,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  modalContent: {
    padding: 20,
  },
  positionLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 10,
    marginTop: 5,
  },
  positionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    gap: 8,
  },
  positionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: COLORS.card,
    marginRight: 8,
    marginBottom: 8,
  },
  positionButtonSelected: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
  },
  positionButtonText: {
    color: COLORS.textSecondary,
    fontWeight: "500",
    fontSize: 14,
  },
  positionButtonTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    overflow: "hidden",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.textSecondary,
    paddingVertical: 12,
    alignItems: "center",
  },
  addButton: {
    // Solo contenedor, el estilo real está en el gradiente
  },
  addButtonGradient: {
    paddingVertical: 12,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
