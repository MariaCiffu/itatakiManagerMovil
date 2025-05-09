"use client";

import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  Dimensions,
  SafeAreaView,
  Animated,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PLAYERS } from "../../data/teamData"; // Importamos los jugadores desde el archivo de datos
import { FORMATIONS, getPositionsForFormation } from "../../data/formations"; // Importamos las formaciones
import PlayerRoleIndicators from "../../components/alineacion/PlayerRoleIndicators";
import PlayerRoleSelector from "../../components/alineacion/PlayerRoleSelector";
import PlayerContextMenu from "../../context/PlayerContextMenu";
import FootballField from "../../components/alineacion/FootballField";

// Obtener dimensiones de la pantalla
const { width, height } = Dimensions.get("window");
const FIELD_RATIO = 0.65; // Proporción del campo respecto a la altura de la pantalla

// Mapeo de posiciones para mostrar abreviatura
const POSITION_MAPPING = {
  Portero: "POR",
  Defensa: "DEF",
  Centrocampista: "MED",
  Delantero: "DEL",
};

export default function LineupScreen() {
  const router = useRouter();

  // Definir colores fijos en lugar de tema
  const colors = {
    background: "#121212",
    card: "#1e1e1e",
    text: "#ffffff",
    textSecondary: "#cccccc",
    accent: "#4CAF50",
    field: "#3a9d3a",
    fieldDark: "#358a35",
    fieldLines: "#ffffff",
    playerCircle: "#222222",
    playerCircleBorder: "#4CAF50",
    modalBackground: "rgba(0, 0, 0, 0.7)",
    modalContent: "#333333",
    modalText: "#ffffff",
    modalBorder: "#444444",
  };

  const [selectedFormation, setSelectedFormation] = useState(FORMATIONS[0]);
  const [previousFormation, setPreviousFormation] = useState(null);
  const [lineup, setLineup] = useState({});
  const [substitutes, setSubstitutes] = useState([]);
  const [playerSelectorVisible, setPlayerSelectorVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [matchday, setMatchday] = useState(35);
  const [availablePlayers, setAvailablePlayers] = useState(PLAYERS); // Usamos los jugadores del archivo de datos

  // Estados para los roles especiales
  const [specialRoles, setSpecialRoles] = useState({
    captain: null, // ID del jugador capitán
    freeKicks: null, // ID del jugador lanzador de faltas
    corners: null, // ID del jugador lanzador de córners
    penalties: null, // ID del jugador lanzador de penaltis
  });
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  // Estado para mostrar el indicador de autoguardado
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);

  // Animaciones
  const formationChangeAnim = useRef(new Animated.Value(0)).current;
  const playerScaleAnim = useRef(new Animated.Value(1)).current;
  const savedIndicatorAnim = useRef(new Animated.Value(0)).current;

  // Función para autoguardar
  const autoSave = () => {
    // Aquí implementarías la lógica para guardar en AsyncStorage, una base de datos, etc.
    console.log("Autoguardando alineación...");

    // Mostrar indicador de guardado
    setShowSavedIndicator(true);
    savedIndicatorAnim.setValue(1);

    // Ocultar el indicador después de 2 segundos
    setTimeout(() => {
      Animated.timing(savedIndicatorAnim, {
        toValue: 0,
        duration: 1000,
        delay: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShowSavedIndicator(false);
      });
    }, 0);
  };

  // Actualizar posiciones cuando cambia la formación
  useEffect(() => {
    if (previousFormation) {
      // Animar el cambio de formación
      formationChangeAnim.setValue(0);

      // Primero reasignar jugadores a nuevas posiciones
      reasignarJugadoresEnNuevaFormacion(previousFormation, selectedFormation);

      // Luego iniciar la animación
      setTimeout(() => {
        Animated.timing(formationChangeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }).start();

        // Autoguardar cuando cambia la formación
        autoSave();
      }, 0);
    }

    setPreviousFormation(selectedFormation);
  }, [selectedFormation]);

  // Autoguardar cuando cambia la alineación
  useEffect(() => {
    // Solo autoguardar si ya hay jugadores en la alineación
    if (Object.keys(lineup).length > 0) {
      autoSave();
    }
  }, [lineup]);

  // Autoguardar cuando cambian los suplentes
  useEffect(() => {
    // Solo autoguardar si ya hay suplentes
    if (substitutes.length > 0) {
      autoSave();
    }
  }, [substitutes]);

  // Autoguardar cuando cambian los roles especiales
  useEffect(() => {
    // Solo autoguardar si hay roles asignados
    const hasRoles = Object.values(specialRoles).some((role) => role !== null);
    if (hasRoles) {
      autoSave();
    }
  }, [specialRoles]);

  // Función para seleccionar un jugador para una posición
  const selectPlayerForPosition = (position, event) => {
    const player = lineup[position];

    // Animar la selección
    playerScaleAnim.setValue(1);
    Animated.sequence([
      Animated.timing(playerScaleAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(playerScaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    if (player) {
      // Si ya hay un jugador en esa posición, mostrar menú contextual
      setSelectedPlayer(player);
      setSelectedPosition(position);

      // Calcular posición del menú contextual
      if (event && event.nativeEvent) {
        setContextMenuPosition({
          x: event.nativeEvent.pageX,
          y: event.nativeEvent.pageY,
        });
      }

      setContextMenuVisible(true);
    } else {
      // Si no hay jugador, mostrar el selector de jugadores
      setSelectedPosition(position);
      setPlayerSelectorVisible(true);
    }
  };

  // Función para asignar un jugador a una posición
  const assignPlayerToPosition = (player) => {
    // Crear una copia de la alineación actual
    const newLineup = { ...lineup };

    // Si el jugador ya está en otra posición, quitarlo de ahí
    Object.keys(newLineup).forEach((pos) => {
      if (newLineup[pos]?.id === player.id) {
        delete newLineup[pos];
      }
    });

    // Si el jugador está en suplentes, quitarlo de ahí
    const newSubstitutes = substitutes.filter((sub) => sub.id !== player.id);
    setSubstitutes(newSubstitutes);

    // Asignar el jugador a la posición seleccionada
    newLineup[selectedPosition] = player;
    setLineup(newLineup);
    setPlayerSelectorVisible(false);
  };

  // Función para añadir un jugador a suplentes
  const addSubstitute = (player) => {
    // Verificar si el jugador ya está en la alineación
    const isInLineup = Object.values(lineup).some((p) => p?.id === player.id);

    // Verificar si el jugador ya está en suplentes
    const isInSubstitutes = substitutes.some((p) => p.id === player.id);

    if (!isInLineup && !isInSubstitutes) {
      setSubstitutes([...substitutes, player]);
    }

    setPlayerSelectorVisible(false);
  };

  // Función para quitar un jugador de una posición
  const removePlayerFromPosition = (position) => {
    const newLineup = { ...lineup };
    delete newLineup[position];
    setLineup(newLineup);
  };

  // Función para quitar un jugador de suplentes
  const removeSubstitute = (playerId) => {
    const newSubstitutes = substitutes.filter((sub) => sub.id !== playerId);
    setSubstitutes(newSubstitutes);
  };

  // Obtener jugadores disponibles (no seleccionados como titulares o suplentes)
  const getAvailablePlayers = () => {
    const selectedPlayerIds = [
      ...Object.values(lineup).map((player) => player.id),
      ...substitutes.map((player) => player.id),
    ];

    return PLAYERS.filter((player) => !selectedPlayerIds.includes(player.id));
  };

  // Función para reasignar jugadores cuando cambia la formación
  const reasignarJugadoresEnNuevaFormacion = (
    formacionAnterior,
    nuevaFormacion
  ) => {
    // Si no hay jugadores en la alineación, no hay nada que hacer
    if (Object.keys(lineup).length === 0) return;

    // Obtener las posiciones de ambas formaciones
    const posicionesAnteriores = getPositionsForFormation(formacionAnterior);
    const nuevasPosiciones = getPositionsForFormation(nuevaFormacion);

    // Crear una nueva alineación
    const nuevaLineup = {};

    // Mapeo de tipos de posiciones para intentar mantener jugadores en posiciones similares
    const mapeoTiposPosiciones = {
      // Portero
      GK: ["GK"],
      // Defensas
      DEF1: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
      DEF2: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
      DEF3: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
      DEF4: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
      DEF5: ["DEF1", "DEF2", "DEF3", "DEF4", "DEF5"],
      // Centrocampistas
      MID1: ["MID1", "MID2", "MID3", "MID4", "MID5"],
      MID2: ["MID1", "MID2", "MID3", "MID4", "MID5"],
      MID3: ["MID1", "MID2", "MID3", "MID4", "MID5"],
      MID4: ["MID1", "MID2", "MID3", "MID4", "MID5"],
      MID5: ["MID1", "MID2", "MID3", "MID4", "MID5"],
      // Delanteros
      FWD1: ["FWD1", "FWD2", "FWD3"],
      FWD2: ["FWD1", "FWD2", "FWD3"],
      FWD3: ["FWD1", "FWD2", "FWD3"],
    };

    // Posiciones ya asignadas en la nueva formación
    const posicionesAsignadas = new Set();

    // Primero, intentar mantener jugadores en posiciones equivalentes
    Object.entries(lineup).forEach(([posicionAnterior, jugador]) => {
      // Intentar encontrar la misma posición en la nueva formación
      if (
        nuevasPosiciones[posicionAnterior] &&
        !posicionesAsignadas.has(posicionAnterior)
      ) {
        nuevaLineup[posicionAnterior] = jugador;
        posicionesAsignadas.add(posicionAnterior);
      } else {
        // Si no existe la misma posición, buscar una posición similar
        const tiposPosicionesSimilares =
          mapeoTiposPosiciones[posicionAnterior] || [];

        // Buscar una posición similar disponible
        const posicionSimilar = tiposPosicionesSimilares.find(
          (tipo) => nuevasPosiciones[tipo] && !posicionesAsignadas.has(tipo)
        );

        if (posicionSimilar) {
          nuevaLineup[posicionSimilar] = jugador;
          posicionesAsignadas.add(posicionSimilar);
        }
        // Si no se encuentra posición similar, el jugador no se asigna
      }
    });

    // Actualizar la alineación
    setLineup(nuevaLineup);
  };

  // Función para manejar la asignación de roles desde el menú contextual
  const handleAssignRoleFromMenu = () => {
    setContextMenuVisible(false);
    setRoleModalVisible(true);
  };

  // Función para quitar un jugador desde el menú contextual
  const handleRemovePlayerFromMenu = () => {
    removePlayerFromPosition(selectedPosition);
    setContextMenuVisible(false);
  };

  // Función para manejar la pulsación larga en un jugador
  const handleLongPressPlayer = (position) => {
    const player = lineup[position];
    if (player) {
      setSelectedPlayer(player);
      setSelectedPosition(position);
      setRoleModalVisible(true);
    }
  };

  // Función para reiniciar la alineación
  const handleResetLineup = () => {
    Alert.alert(
      "Reiniciar alineación",
      "¿Estás seguro de que quieres quitar todos los jugadores?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Reiniciar",
          onPress: () => {
            setLineup({});
            setSubstitutes([]);
            setSpecialRoles({
              captain: null,
              freeKicks: null,
              corners: null,
              penalties: null,
            });
            // Autoguardar después de reiniciar
            autoSave();
          },
        },
      ]
    );
  };

  // Renderizar jugador en posición
  const renderPlayerPosition = (position, positionStyle) => {
    const player = lineup[position];

    // Calcular posición animada durante cambio de formación
    const animatedStyle = previousFormation
      ? {
          left: formationChangeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [positionStyle.left, positionStyle.left],
          }),
          top: formationChangeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [positionStyle.top, positionStyle.top],
          }),
        }
      : positionStyle;

    return (
      <Animated.View
        style={[
          styles.playerPosition,
          animatedStyle,
          { transform: [{ translateX: -25 }, { translateY: -35 }] }, // Ajustado para fichas más grandes
        ]}
        key={position}
      >
        <TouchableOpacity
          onPress={(event) => selectPlayerForPosition(position, event)}
          onLongPress={() => handleLongPressPlayer(position)}
          delayLongPress={500}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={
            player
              ? `Jugador ${player.name}, número ${player.number}`
              : `Posición vacía ${position}`
          }
          accessibilityHint={
            player
              ? "Toca para ver opciones del jugador"
              : "Toca para asignar un jugador"
          }
        >
          {player ? (
            <Animated.View
              style={[
                styles.playerAssigned,
                { transform: [{ scale: playerScaleAnim }] },
              ]}
            >
              <View style={styles.playerCircle}>
                <Text style={[styles.playerNumber, { color: colors.text }]}>
                  {player.number}
                </Text>
              </View>
              <View style={styles.playerNameContainer}>
                <Text
                  style={[styles.playerName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {player.name.split(" ")[0]}
                </Text>
              </View>

              {/* Añadir los indicadores de roles especiales */}
              <PlayerRoleIndicators
                player={player}
                specialRoles={specialRoles}
              />
            </Animated.View>
          ) : (
            <View
              style={[
                styles.emptyPosition,
                { backgroundColor: `${colors.playerCircle}80` },
              ]}
            >
              <Ionicons name="add" size={24} color={colors.fieldLines} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: `${colors.text}20` }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Alineación jornada {matchday}
        </Text>

        {/* Indicador de autoguardado */}
        {showSavedIndicator && (
          <Animated.View
            style={[styles.savedIndicator, { opacity: savedIndicatorAnim }]}
          >
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.savedIndicatorText}>Guardado</Text>
          </Animated.View>
        )}
      </View>

      <View style={styles.formationSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FORMATIONS.map((formation) => (
            <TouchableOpacity
              key={formation.id}
              onPress={() => setSelectedFormation(formation)}
              accessible={true}
              accessibilityLabel={`Formación ${formation.name}`}
              accessibilityState={{
                selected: selectedFormation.id === formation.id,
              }}
            >
              <LinearGradient
                colors={
                  selectedFormation.id === formation.id
                    ? ["#4CAF50", "#2E7D32"]
                    : [colors.card, "#2a2a2a"]
                }
                style={styles.formationButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text
                  style={[
                    styles.formationText,
                    {
                      color:
                        selectedFormation.id === formation.id
                          ? "#fff"
                          : colors.textSecondary,
                    },
                    selectedFormation.id === formation.id &&
                      styles.formationTextSelected,
                  ]}
                >
                  {formation.name}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FootballField
        colors={{
          field: colors.field,
          fieldDark: colors.fieldDark,
          fieldLines: colors.fieldLines,
        }}
      >
        {/* Posiciones de jugadores */}
        {Object.entries(getPositionsForFormation(selectedFormation)).map(
          ([position, posStyle]) => renderPlayerPosition(position, posStyle)
        )}
      </FootballField>

      <View
        style={[
          styles.substitutesContainer,
          { backgroundColor: colors.card, borderTopColor: `${colors.text}20` },
        ]}
      >
        <Text style={[styles.substitutesTitle, { color: colors.text }]}>
          Suplentes:
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.substitutesList}
          contentContainerStyle={styles.substitutesContent}
        >
          {substitutes.map((player) => (
            <View key={player.id} style={styles.substituteItem}>
              <View style={styles.substituteCircle}>
                <Text style={[styles.substituteNumber, { color: colors.text }]}>
                  {player.number}
                </Text>
              </View>
              <Text
                style={[styles.substituteName, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {player.name.split(" ")[0]}
              </Text>
              <TouchableOpacity
                style={styles.removeSubstituteButton}
                onPress={() => removeSubstitute(player.id)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Ionicons name="close-circle" size={16} color="#ff4d4d" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addSubstituteButton}
            onPress={() => {
              setSelectedPosition("substitute");
              setPlayerSelectorVisible(true);
            }}
          >
            <Ionicons name="add-circle" size={24} color={colors.accent} />
            <Text style={[styles.addSubstituteText, { color: colors.accent }]}>
              Añadir
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Solo botón flotante para reiniciar */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: "#F44336" }]}
          onPress={handleResetLineup}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Modal para seleccionar jugador */}
      <Modal
        visible={playerSelectorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPlayerSelectorVisible(false)}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.modalBackground },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              { backgroundColor: colors.modalContent },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { borderBottomColor: colors.modalBorder },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.modalText }]}>
                {selectedPosition === "substitute"
                  ? "Seleccionar suplente"
                  : "Seleccionar jugador"}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setPlayerSelectorVisible(false)}
              >
                <Ionicons name="close" size={24} color={colors.modalText} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getAvailablePlayers()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.playerItem,
                    { borderBottomColor: colors.modalBorder },
                  ]}
                  onPress={() => {
                    if (selectedPosition === "substitute") {
                      addSubstitute(item);
                    } else {
                      assignPlayerToPosition(item);
                    }
                  }}
                >
                  <View style={styles.playerItemCircle}>
                    <Text
                      style={[styles.playerItemNumber, { color: colors.text }]}
                    >
                      {item.number}
                    </Text>
                  </View>
                  <View style={styles.playerItemInfo}>
                    <Text
                      style={[
                        styles.playerItemName,
                        { color: colors.modalText },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.playerItemPosition,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {item.position}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text
                    style={[
                      styles.emptyListText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    No hay jugadores disponibles
                  </Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Modal para la selección de roles especiales */}
      <Modal
        visible={roleModalVisible && selectedPlayer !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <TouchableOpacity
          style={[
            styles.roleModalOverlay,
            { backgroundColor: colors.modalBackground },
          ]}
          activeOpacity={1}
          onPress={() => setRoleModalVisible(false)}
        >
          <View style={styles.roleModalContainer}>
            <TouchableOpacity activeOpacity={1}>
              {selectedPlayer && (
                <PlayerRoleSelector
                  player={selectedPlayer}
                  specialRoles={specialRoles}
                  onUpdateSpecialRoles={setSpecialRoles}
                  onClose={() => setRoleModalVisible(false)}
                  theme={colors}
                />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menú contextual para jugadores */}
      {contextMenuVisible && selectedPlayer && (
        <PlayerContextMenu
          player={selectedPlayer}
          onAssignRole={handleAssignRoleFromMenu}
          onRemovePlayer={handleRemovePlayerFromMenu}
          onClose={() => setContextMenuVisible(false)}
          position={contextMenuPosition}
          theme={colors}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    flex: 1,
  },
  // Indicador de autoguardado
  savedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  savedIndicatorText: {
    color: "#4CAF50",
    fontSize: 12,
    marginLeft: 5,
    fontWeight: "bold",
  },
  formationSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  formationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formationText: {
    fontWeight: "500",
  },
  formationTextSelected: {
    fontWeight: "bold",
  },
  penaltyArcTop: {
    position: "absolute",
    width: width * 0.2,
    height: width * 0.1,
    borderBottomLeftRadius: width * 0.1,
    borderBottomRightRadius: width * 0.1,
    borderWidth: 2,
    borderTopWidth: 0,
    top: "60%",
    left: "50%",
    transform: [{ translateX: -width * 0.1 }],
  },
  playerPosition: {
    position: "absolute",
    width: 50, // Aumentado para fichas más grandes
    height: 70, // Aumentado para fichas más grandes
    alignItems: "center",
    justifyContent: "center",
  },
  emptyPosition: {
    width: 46, // Aumentado para fichas más grandes
    height: 46, // Aumentado para fichas más grandes
    borderRadius: 23, // Aumentado para fichas más grandes
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  playerAssigned: {
    alignItems: "center",
  },
  playerCircle: {
    width: 46, // Aumentado para fichas más grandes
    height: 46, // Aumentado para fichas más grandes
    borderRadius: 23, // Aumentado para fichas más grandes
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  playerNumber: {
    fontWeight: "bold",
    fontSize: 18, // Aumentado para fichas más grandes
  },
  playerNameContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginTop: 2,
  },
  playerName: {
    fontSize: 12, // Aumentado para fichas más grandes
    maxWidth: 70, // Aumentado para fichas más grandes
    textAlign: "center",
  },
  substitutesContainer: {
    padding: 12,
    borderTopWidth: 1,
    minHeight: 100, // Asegura un espacio mínimo
  },
  substitutesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  substitutesList: {
    flexDirection: "row",
  },
  substitutesContent: {
    paddingRight: 20, // Añade espacio al final
  },
  substituteItem: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
    position: "relative",
  },
  substituteCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#666",
  },
  substituteNumber: {
    fontWeight: "bold",
  },
  substituteName: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 60,
  },
  removeSubstituteButton: {
    position: "absolute",
    top: -5,
    right: 5,
  },
  addSubstituteButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  addSubstituteText: {
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  playerItemCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerItemNumber: {
    fontWeight: "bold",
    fontSize: 16,
  },
  playerItemInfo: {
    flex: 1,
  },
  playerItemName: {
    fontSize: 16,
    fontWeight: "500",
  },
  playerItemPosition: {
    fontSize: 14,
  },
  emptyListContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyListText: {
    fontSize: 16,
  },
  // Estilos para el modal de roles
  roleModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  roleModalContainer: {
    width: "90%",
    maxWidth: 350,
  },
  // Estilos para el menú contextual
  contextMenuContainer: {
    position: "absolute",
    zIndex: 1000,
  },
  // Botón flotante (solo reiniciar)
  fabContainer: {
    position: "absolute",
    right: 20,
    bottom: 120,
    alignItems: "center",
  },
  fab: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
