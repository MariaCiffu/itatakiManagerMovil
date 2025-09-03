import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useCallback,
  useReducer,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  SafeAreaView,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";
import {
  FORMATIONS,
  getPositionsForFormation,
} from "../../constants/formations";
import { POSICIONES } from "../../constants/positions";
import { getAllJugadores } from "../../services/playersService";
import PlayerRoleIndicators from "../../components/alineacion/PlayerRoleIndicators";
import PlayerRoleSelector from "../../components/alineacion/PlayerRoleSelector";
import PlayerContextMenu from "../../context/PlayerContextMenu";
import FootballField from "../../components/alineacion/FootballField";
import PlayerList from "../../components/alineacion/PlayerList";
import ModalHeader from "../../components/alineacion/ModalHeader";
import ErrorMessage from "../../components/alineacion/ErrorMessage";
import {
  lineupReducer,
  ACTIONS,
  initialState,
} from "../../reducers/lineup-reducer";

// Constantes optimizadas
const { width, height } = Dimensions.get("window");
const FIELD_RATIO = 0.65;
const MODAL_MAX_HEIGHT_RATIO = 0.7;
const CONTEXT_MENU_Y_OFFSET = 50;
const CONTEXT_MENU_MAX_Y = height - 200;

// Función helper optimizada
const findPlayerById = (playerId, allPlayers, temporaryPlayers) => {
  const regularPlayer = allPlayers.find((p) => p.id === playerId);
  if (regularPlayer) return regularPlayer;
  return temporaryPlayers.find((p) => p.id === playerId) || null;
};

// Componente dropdown para posiciones
const PositionDropdown = ({ selectedPosition, onSelectPosition }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.positionDropdownButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.positionDropdownText}>{selectedPosition}</Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={MODERN_COLORS.textGray}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.positionOverlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.positionModal}>
            <View style={styles.positionHeader}>
              <Text style={styles.positionHeaderText}>
                Seleccionar posición
              </Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Ionicons
                  name="close"
                  size={24}
                  color={MODERN_COLORS.textDark}
                />
              </TouchableOpacity>
            </View>

            {POSICIONES.map((posicion) => (
              <TouchableOpacity
                key={posicion}
                style={[
                  styles.positionOption,
                  selectedPosition === posicion &&
                    styles.positionOptionSelected,
                ]}
                onPress={() => {
                  onSelectPosition(posicion);
                  setIsOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.positionOptionText,
                    selectedPosition === posicion &&
                      styles.positionOptionTextSelected,
                  ]}
                >
                  {posicion}
                </Text>
                {selectedPosition === posicion && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={MODERN_COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Componente NewPlayerForm optimizado
const NewPlayerForm = React.memo(
  ({
    name,
    onNameChange,
    number,
    onNumberChange,
    position,
    onPositionChange,
    onSubmit,
  }) => {
    return (
      <View style={styles.newPlayerFormContainer}>
        <View style={styles.formSeparator} />

        <View style={styles.formContent}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Nombre</Text>
            <TextInput
              style={styles.formInput}
              value={name}
              onChangeText={onNameChange}
              placeholder="Nombre del jugador"
              placeholderTextColor={MODERN_COLORS.textLight}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Dorsal</Text>
            <TextInput
              style={styles.formInput}
              value={number}
              onChangeText={onNumberChange}
              placeholder="Número del dorsal"
              placeholderTextColor={MODERN_COLORS.textLight}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Posición</Text>
            <PositionDropdown
              selectedPosition={position}
              onSelectPosition={onPositionChange}
            />
          </View>

          <TouchableOpacity
            style={styles.createPlayerButton}
            onPress={onSubmit}
          >
            <Text style={styles.createPlayerButtonText}>Crear jugador</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formSeparator} />
      </View>
    );
  }
);

// Componente FormationDropdown optimizado
const FormationDropdown = React.memo(
  ({ formations, selectedFormation, onSelectFormation, readOnly }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => !readOnly && setIsOpen(true)}
          disabled={readOnly}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedFormation.name}
          </Text>
          {!readOnly && (
            <Ionicons
              name="chevron-down"
              size={20}
              color={MODERN_COLORS.textGray}
            />
          )}
        </TouchableOpacity>

        <Modal
          visible={isOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsOpen(false)}
        >
          <TouchableOpacity
            style={styles.dropdownOverlay}
            onPress={() => setIsOpen(false)}
          >
            <View style={styles.dropdownModal}>
              <ModalHeader
                title="Seleccionar formación"
                onClose={() => setIsOpen(false)}
              />

              {formations.map((formation) => (
                <TouchableOpacity
                  key={formation.id}
                  style={[
                    styles.dropdownOption,
                    selectedFormation.id === formation.id &&
                      styles.dropdownOptionSelected,
                  ]}
                  onPress={() => {
                    onSelectFormation(formation);
                    setIsOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selectedFormation.id === formation.id &&
                        styles.dropdownOptionTextSelected,
                    ]}
                  >
                    {formation.name}
                  </Text>
                  {selectedFormation.id === formation.id && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={MODERN_COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }
);

// Componente FieldPlayer optimizado
const FieldPlayer = React.memo(
  ({
    player,
    onPress,
    onLongPress,
    readOnly,
    specialRoles,
    playerScaleAnim,
    position,
  }) => {
    if (!player) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={readOnly ? 1 : 0.7}
          disabled={readOnly}
          style={styles.emptyPositionContainer}
        >
          <View style={styles.emptyPosition}>
            <Ionicons name="add" size={20} color={MODERN_COLORS.textLight} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={readOnly ? 1 : 0.8}
        disabled={readOnly}
      >
        <Animated.View
          style={[
            styles.playerAssigned,
            { transform: [{ scale: playerScaleAnim }] },
          ]}
        >
          <View
            style={[
              styles.playerCircleField,
              player.isTemporary && styles.temporaryPlayerCircle,
            ]}
          >
            <Text style={styles.playerNumberField}>{player.number}</Text>
          </View>
          <View style={styles.playerNameContainer}>
            <Text style={styles.playerNameField} numberOfLines={1}>
              {player.name.split(" ")[0]}
            </Text>
          </View>
          <PlayerRoleIndicators player={player} specialRoles={specialRoles} />
        </Animated.View>
      </TouchableOpacity>
    );
  }
);

// Componente SubstitutePlayer optimizado
const SubstitutePlayer = React.memo(({ player, onRemove, readOnly }) => (
  <View style={styles.substituteItem}>
    <View
      style={[
        styles.substituteCircle,
        player.isTemporary && styles.temporarySubstituteCircle,
      ]}
    >
      <Text style={styles.substituteNumber}>{player.number}</Text>
    </View>
    <Text style={styles.substituteName} numberOfLines={1}>
      {player.name.split(" ")[0]}
    </Text>
    {!readOnly && (
      <TouchableOpacity
        style={styles.removeSubstituteButton}
        onPress={onRemove}
        hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
      >
        <Ionicons name="close-circle" size={16} color={MODERN_COLORS.danger} />
      </TouchableOpacity>
    )}
  </View>
));

const LineupScreen = forwardRef((props, ref) => {
  const {
    matchday = "",
    matchTitle = null,
    isEmbedded = false,
    initialData = null,
    onSaveLineup = null,
    readOnly = false,
  } = props;

  const router = useRouter();
  const [state, dispatch] = useReducer(lineupReducer, initialState);

  const {
    selectedFormation,
    previousFormation,
    lineup,
    substitutes,
    specialRoles,
    temporaryPlayers,
  } = state;

  // Estados para jugadores
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playersError, setPlayersError] = useState(null);

  // Estados de UI optimizados
  const [playerSelectorVisible, setPlayerSelectorVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [newPlayerModalVisible, setNewPlayerModalVisible] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerNumber, setNewPlayerNumber] = useState("");
  const [newPlayerPosition, setNewPlayerPosition] = useState(POSICIONES[0]);
  const [error, setError] = useState(null);

  // Referencias optimizadas
  const initialDataProcessedRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Animaciones optimizadas
  const formationChangeAnim = useRef(new Animated.Value(0)).current;
  const playerScaleAnim = useRef(new Animated.Value(1)).current;
  const savedIndicatorAnim = useRef(new Animated.Value(0)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;

  // Título optimizado
  const screenTitle = useMemo(
    () =>
      matchTitle ||
      (typeof matchday === "number"
        ? `Jornada ${matchday}`
        : matchday || "Alineación"),
    [matchTitle, matchday]
  );

  // Cargar jugadores
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setLoading(true);
        const jugadores = await getAllJugadores();
        setAllPlayers(jugadores);
        setPlayersError(null);
      } catch (err) {
        console.error("Error al cargar jugadores:", err);
        setPlayersError("No se pudieron cargar los jugadores");
        setAllPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    loadPlayers();
  }, []);

  // Calcular jugadores disponibles
  const availablePlayers = useMemo(() => {
    if (loading || playersError) return [];

    const assignedPlayerIds = new Set([
      ...Object.values(lineup)
        .filter(Boolean)
        .map((p) => p.id),
      ...substitutes.map((p) => p.id),
    ]);

    const combinedPlayers = [...allPlayers, ...temporaryPlayers];
    return combinedPlayers.filter(
      (player) => !assignedPlayerIds.has(player.id)
    );
  }, [
    allPlayers,
    temporaryPlayers,
    lineup,
    substitutes,
    loading,
    playersError,
  ]);

  // Función para mostrar errores
  const showError = useCallback(
    (message) => {
      setError(message);
      errorAnim.setValue(1);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        Animated.timing(errorAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setError(null));
      }, 3000);
    },
    [errorAnim]
  );

  // Efecto para mostrar errores de jugadores
  useEffect(() => {
    if (playersError) {
      showError(playersError);
    }
  }, [playersError, showError]);

  // Función para guardar
  const saveLineup = useCallback(
    (
      newLineup = lineup,
      newSubstitutes = substitutes,
      newSpecialRoles = specialRoles
    ) => {
      if (!isEmbedded || !onSaveLineup) return;

      try {
        const titulares = Object.entries(newLineup)
          .filter(([, p]) => p !== null)
          .map(([position, p]) => ({ ...p, fieldPosition: position }));

        onSaveLineup({
          formacion: selectedFormation.name,
          titulares,
          suplentes: newSubstitutes,
          specialRoles: newSpecialRoles,
          lineup: newLineup,
          temporaryPlayers,
        });
      } catch (error) {
        console.error("Error al guardar alineación:", error);
        showError("Error al guardar la alineación");
      }
    },
    [
      isEmbedded,
      onSaveLineup,
      lineup,
      substitutes,
      specialRoles,
      selectedFormation,
      temporaryPlayers,
      showError,
    ]
  );

  // Indicador de guardado
  const displaySavedIndicator = useCallback(() => {
    if (readOnly) return;

    setShowSavedIndicator(true);
    savedIndicatorAnim.setValue(1);

    setTimeout(() => {
      Animated.timing(savedIndicatorAnim, {
        toValue: 0,
        duration: 1000,
        delay: 1000,
        useNativeDriver: true,
      }).start(() => setShowSavedIndicator(false));
    }, 0);
  }, [savedIndicatorAnim, readOnly]);

  // Exponer métodos a través de la referencia
  useImperativeHandle(ref, () => ({
    getAlineacionData: () => {
      try {
        const titulares = Object.entries(lineup)
          .map(([position, player]) => {
            if (player) {
              return {
                id: player.id,
                fieldPosition: position,
                isTemporary: player.isTemporary || false,
              };
            }
            return null;
          })
          .filter((player) => player !== null);

        const suplentesIds = substitutes.map((player) => ({
          id: player.id,
          isTemporary: player.isTemporary || false,
        }));

        const rolesIds = {};
        Object.entries(specialRoles).forEach(([role, player]) => {
          rolesIds[role] = player;
        });

        const allTemporaryPlayers = [
          ...Object.values(lineup).filter((player) => player?.isTemporary),
          ...substitutes.filter((player) => player.isTemporary),
        ];

        return {
          formacion: selectedFormation.name,
          titulares,
          suplentes: suplentesIds,
          specialRoles: rolesIds,
          temporaryPlayers: allTemporaryPlayers,
        };
      } catch (error) {
        console.error("Error al obtener datos de alineación:", error);
        return null;
      }
    },
  }));

  // Inicializar con datos si se proporcionan
  useEffect(() => {
    if (
      initialData &&
      !initialDataProcessedRef.current &&
      allPlayers.length > 0
    ) {
      try {
        initialDataProcessedRef.current = true;
        console.log("Inicializando con datos:", initialData);

        const loadData = {
          temporaryPlayers: initialData.temporaryPlayers || [],
          formation: null,
          lineup: {},
          substitutes: [],
          specialRoles: initialData.specialRoles || {},
        };

        // Cargar formación
        if (
          initialData.formacion &&
          typeof initialData.formacion === "string"
        ) {
          loadData.formation =
            FORMATIONS.find((f) => f.name === initialData.formacion) ||
            FORMATIONS[0];
        } else {
          loadData.formation = FORMATIONS[0];
        }

        // Reconstruir el lineup a partir de los titulares con IDs
        if (initialData.titulares && Array.isArray(initialData.titulares)) {
          initialData.titulares.forEach((item) => {
            if (item && item.id && item.fieldPosition) {
              const player = findPlayerById(
                item.id,
                allPlayers,
                initialData.temporaryPlayers || []
              );
              if (player) {
                loadData.lineup[item.fieldPosition] = player;
              }
            }
          });
        }

        // Reconstruir suplentes a partir de IDs
        if (initialData.suplentes && Array.isArray(initialData.suplentes)) {
          initialData.suplentes.forEach((item) => {
            let playerId = null;

            if (typeof item === "string" || typeof item === "number") {
              playerId = item;
            } else if (item && item.id) {
              playerId = item.id;
            }

            if (playerId) {
              const player = findPlayerById(
                playerId,
                allPlayers,
                initialData.temporaryPlayers || []
              );
              if (player) {
                loadData.substitutes.push(player);
              }
            }
          });
        }

        dispatch({ type: ACTIONS.LOAD_INITIAL_DATA, payload: loadData });
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        showError("Error al cargar datos iniciales");
      }
    }
  }, [initialData, allPlayers, showError]);

  // Función para crear jugador temporal
  const createTemporaryPlayer = useCallback(() => {
    try {
      if (!newPlayerName.trim() || !newPlayerNumber.trim()) {
        Alert.alert("Error", "Todos los campos son obligatorios");
        return;
      }

      const numberValue = parseInt(newPlayerNumber.trim(), 10);
      if (isNaN(numberValue) || numberValue <= 0) {
        Alert.alert("Error", "El número debe ser un valor positivo");
        return;
      }

      const allExistingPlayers = [...allPlayers, ...temporaryPlayers];
      if (allExistingPlayers.some((p) => p.number === numberValue)) {
        Alert.alert("Error", "Este número ya está asignado");
        return;
      }

      const newPlayer = {
        id: `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: newPlayerName.trim(),
        number: numberValue,
        position: newPlayerPosition,
        isTemporary: true,
      };

      dispatch({ type: ACTIONS.ADD_TEMPORARY_PLAYER, payload: newPlayer });

      setNewPlayerName("");
      setNewPlayerNumber("");
      setNewPlayerPosition(POSICIONES[0]);
      setNewPlayerModalVisible(false);

      if (selectedPosition) {
        if (selectedPosition === "substitute") {
          dispatch({ type: ACTIONS.ADD_SUBSTITUTE, payload: newPlayer });
          saveLineup(lineup, [...substitutes, newPlayer]);
        } else {
          dispatch({
            type: ACTIONS.ASSIGN_PLAYER,
            payload: { position: selectedPosition, player: newPlayer },
          });
          saveLineup({ ...lineup, [selectedPosition]: newPlayer }, substitutes);
        }
        displaySavedIndicator();
      }
    } catch (error) {
      console.error("Error al crear jugador temporal:", error);
      showError("Error al crear jugador temporal");
    }
  }, [
    newPlayerName,
    newPlayerNumber,
    newPlayerPosition,
    selectedPosition,
    lineup,
    substitutes,
    temporaryPlayers,
    allPlayers,
    saveLineup,
    displaySavedIndicator,
    showError,
  ]);

  // Función para seleccionar jugador
  const selectPlayerForPosition = useCallback(
    (position, event) => {
      if (readOnly) return;

      try {
        const player = lineup[position];

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
          setSelectedPlayer(player);
          setSelectedPosition(position);

          // Usar las coordenadas del evento directamente
          const x =
            event?.nativeEvent?.pageX ||
            event?.nativeEvent?.locationX ||
            width / 2;
          const y =
            event?.nativeEvent?.pageY ||
            event?.nativeEvent?.locationY ||
            height / 2;

          setContextMenuPosition({
            x: x - 20,
            y: y - 130,
          });

          setContextMenuVisible(true);
        } else {
          setSelectedPosition(position);
          setPlayerSelectorVisible(true);
        }
      } catch (error) {
        console.error("Error al seleccionar jugador:", error);
        showError("Error al seleccionar jugador");
      }
    },
    [lineup, playerScaleAnim, readOnly, showError, width, height]
  );

  // Función para manejar pulsación larga
  const handleLongPressPlayer = useCallback(
    (position) => {
      if (readOnly) return;

      try {
        const player = lineup[position];
        if (player) {
          setSelectedPlayer(player);
          setSelectedPosition(position);
          setRoleModalVisible(true);
        }
      } catch (error) {
        console.error("Error al manejar pulsación larga:", error);
        showError("Error al manejar pulsación larga");
      }
    },
    [lineup, readOnly, showError]
  );

  // Renderizar jugador en posición
  const renderPlayerPosition = useCallback(
    (position, positionStyle) => {
      const player = lineup[position];

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
            { transform: [{ translateX: -25 }, { translateY: -35 }] },
          ]}
          key={position}
        >
          <FieldPlayer
            player={player}
            onPress={(event) => selectPlayerForPosition(position, event)}
            onLongPress={() => handleLongPressPlayer(position)}
            readOnly={readOnly}
            specialRoles={specialRoles}
            playerScaleAnim={playerScaleAnim}
            position={position}
          />
        </Animated.View>
      );
    },
    [
      lineup,
      previousFormation,
      formationChangeAnim,
      playerScaleAnim,
      selectPlayerForPosition,
      handleLongPressPlayer,
      readOnly,
      specialRoles,
    ]
  );

  // Limpiar timeouts
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Loading state
  if (loading && !readOnly) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons
            name="football-outline"
            size={48}
            color={MODERN_COLORS.primary}
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.loadingText}>Cargando jugadores...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Mensaje de error */}
      {error && (
        <Animated.View
          style={[styles.errorContainerTop, { opacity: errorAnim }]}
        >
          <ErrorMessage message={error} onDismiss={() => setError(null)} />
        </Animated.View>
      )}

      {/* Header */}
      {!isEmbedded && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={MODERN_COLORS.textDark}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{screenTitle}</Text>
          </View>

          {showSavedIndicator && !readOnly && (
            <Animated.View
              style={[styles.savedIndicator, { opacity: savedIndicatorAnim }]}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={MODERN_COLORS.success}
              />
              <Text style={styles.savedIndicatorText}>Guardado</Text>
            </Animated.View>
          )}
        </View>
      )}

      {/* Dropdown de formación */}
      {!readOnly && (
        <FormationDropdown
          formations={FORMATIONS}
          selectedFormation={selectedFormation}
          onSelectFormation={(formation) =>
            dispatch({ type: ACTIONS.SET_FORMATION, payload: formation })
          }
          readOnly={readOnly}
        />
      )}

      {/* Campo de fútbol */}
      <FootballField style={styles.fieldContainer}>
        {Object.entries(getPositionsForFormation(selectedFormation)).map(
          ([position, posStyle]) => renderPlayerPosition(position, posStyle)
        )}
      </FootballField>

      {/* Suplentes */}
      <View style={styles.substitutesContainer}>
        <Text style={styles.substitutesTitle}>Suplentes</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.substitutesList}
          contentContainerStyle={styles.substitutesContent}
        >
          {substitutes.map((player) => (
            <SubstitutePlayer
              key={player.id}
              player={player}
              onRemove={() => {
                dispatch({
                  type: ACTIONS.REMOVE_SUBSTITUTE,
                  payload: player.id,
                });
                const newSubstitutes = substitutes.filter(
                  (sub) => sub.id !== player.id
                );
                saveLineup(lineup, newSubstitutes);
                displaySavedIndicator();
              }}
              readOnly={readOnly}
            />
          ))}

          {!readOnly && (
            <TouchableOpacity
              style={styles.addSubstituteButton}
              onPress={() => {
                setSelectedPosition("substitute");
                setPlayerSelectorVisible(true);
              }}
            >
              <Ionicons
                name="add-circle"
                size={24}
                color={MODERN_COLORS.primary}
              />
              <Text style={styles.addSubstituteText}>Añadir</Text>
            </TouchableOpacity>
          )}

          {substitutes.length === 0 && readOnly && (
            <Text style={styles.emptyListText}>No hay suplentes</Text>
          )}
        </ScrollView>
      </View>

      {/* Modal para seleccionar jugador */}
      <Modal
        visible={playerSelectorVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPlayerSelectorVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ModalHeader
              title={
                selectedPosition === "substitute"
                  ? "Seleccionar suplente"
                  : "Seleccionar jugador"
              }
              onClose={() => setPlayerSelectorVisible(false)}
            />
            <PlayerList
              players={availablePlayers}
              onSelectPlayer={(player) => {
                if (selectedPosition === "substitute") {
                  dispatch({ type: ACTIONS.ADD_SUBSTITUTE, payload: player });
                  saveLineup(lineup, [...substitutes, player]);
                } else {
                  dispatch({
                    type: ACTIONS.ASSIGN_PLAYER,
                    payload: { position: selectedPosition, player },
                  });
                  const newLineup = { ...lineup };
                  Object.keys(newLineup).forEach((pos) => {
                    if (newLineup[pos]?.id === player.id) {
                      delete newLineup[pos];
                    }
                  });
                  newLineup[selectedPosition] = player;

                  const newSubstitutes = substitutes.filter(
                    (sub) => sub.id !== player.id
                  );
                  saveLineup(newLineup, newSubstitutes);
                }
                setPlayerSelectorVisible(false);
                displaySavedIndicator();
              }}
              onAddNewPlayer={() => {
                setPlayerSelectorVisible(false);
                setNewPlayerModalVisible(true);
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal para nuevo jugador */}
      <Modal
        visible={newPlayerModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setNewPlayerModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <ModalHeader
                title="Añadir jugador nuevo"
                onClose={() => setNewPlayerModalVisible(false)}
              />
              <NewPlayerForm
                name={newPlayerName}
                onNameChange={setNewPlayerName}
                number={newPlayerNumber}
                onNumberChange={setNewPlayerNumber}
                position={newPlayerPosition}
                onPositionChange={setNewPlayerPosition}
                onSubmit={createTemporaryPlayer}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para roles especiales */}
      <Modal
        visible={roleModalVisible && selectedPlayer !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.roleModalOverlay}
          activeOpacity={1}
          onPress={() => setRoleModalVisible(false)}
        >
          <View style={styles.roleModalContainer}>
            <TouchableOpacity activeOpacity={1}>
              {selectedPlayer && (
                <PlayerRoleSelector
                  player={selectedPlayer}
                  specialRoles={specialRoles}
                  onUpdateSpecialRoles={(newRoles) => {
                    try {
                      dispatch({
                        type: ACTIONS.SET_SPECIAL_ROLES,
                        payload: newRoles,
                      });
                      displaySavedIndicator();
                      saveLineup(lineup, substitutes, newRoles);
                    } catch (error) {
                      console.error(
                        "Error al actualizar roles especiales:",
                        error
                      );
                      showError("Error al actualizar roles especiales");
                    }
                  }}
                  onClose={() => setRoleModalVisible(false)}
                />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Menú contextual */}
      {contextMenuVisible && selectedPlayer && (
        <PlayerContextMenu
          player={selectedPlayer}
          onAssignRole={() => {
            setContextMenuVisible(false);
            setRoleModalVisible(true);
          }}
          onRemovePlayer={() => {
            try {
              dispatch({
                type: ACTIONS.REMOVE_PLAYER,
                payload: selectedPosition,
              });
              displaySavedIndicator();

              const newLineup = { ...lineup };
              delete newLineup[selectedPosition];
              saveLineup(newLineup);

              setContextMenuVisible(false);
            } catch (error) {
              console.error("Error al quitar jugador:", error);
              showError("Error al quitar jugador");
            }
          }}
          onClose={() => setContextMenuVisible(false)}
          position={contextMenuPosition}
          theme={MODERN_COLORS}
        />
      )}
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.background,
  },

  loadingText: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  // Error
  errorContainerTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },

  // Dropdown de formación
  dropdownContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  dropdownLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textGray,
    marginBottom: 8,
    letterSpacing: 0.2,
  },

  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    letterSpacing: 0.2,
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: `${MODERN_COLORS.textDark}80`,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  dropdownModal: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    width: "100%",
    maxWidth: 300,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  dropdownOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  dropdownOptionSelected: {
    backgroundColor: `${MODERN_COLORS.primary}10`,
  },

  dropdownOptionText: {
    fontSize: 16,
    fontWeight: "500",
    color: MODERN_COLORS.textDark,
    letterSpacing: 0.2,
  },

  dropdownOptionTextSelected: {
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

  // Campo y jugadores
  fieldContainer: {
    marginVertical: 12,
  },

  playerPosition: {
    position: "absolute",
    width: 50,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyPositionContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  emptyPosition: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MODERN_COLORS.surfaceGray,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: MODERN_COLORS.border,
    borderStyle: "dashed",
  },

  playerAssigned: {
    alignItems: "center",
  },

  playerCircleField: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  temporaryPlayerCircle: {
    borderColor: MODERN_COLORS.accent,
    backgroundColor: `${MODERN_COLORS.accent}10`,
  },

  playerNumberField: {
    fontWeight: "700",
    fontSize: 16,
    color: MODERN_COLORS.textDark,
  },

  playerNameContainer: {
    backgroundColor: `${MODERN_COLORS.textDark}90`,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
  },

  playerNameField: {
    fontSize: 11,
    color: MODERN_COLORS.textWhite,
    fontWeight: "500",
    textAlign: "center",
    maxWidth: 65,
  },

  // Suplentes
  substitutesContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    minHeight: 120,
  },

  substitutesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 12,
    letterSpacing: -0.2,
  },

  substitutesList: {
    flexDirection: "row",
    paddingTop: 2,
  },

  substitutesContent: {
    paddingRight: 20,
    alignItems: "center",
  },

  substituteItem: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
    position: "relative",
  },

  substituteCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: MODERN_COLORS.textLight,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  temporarySubstituteCircle: {
    borderColor: MODERN_COLORS.accent,
    backgroundColor: `${MODERN_COLORS.accent}10`,
  },

  substituteNumber: {
    fontWeight: "600",
    fontSize: 14,
    color: MODERN_COLORS.textDark,
  },

  substituteName: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 60,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  removeSubstituteButton: {
    position: "absolute",
    top: -6,
    right: 8,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 8,
    elevation: 2,
  },

  addSubstituteButton: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
    borderStyle: "dashed",
  },

  addSubstituteText: {
    fontSize: 11,
    marginTop: 4,
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  emptyListText: {
    fontSize: 14,
    color: MODERN_COLORS.textLight,
    fontStyle: "italic",
    marginLeft: 12,
    alignSelf: "center",
  },

  // Modales
  keyboardContainer: {
    flex: 1,
  },

  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: `${MODERN_COLORS.textDark}80`,
  },

  modalContent: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * MODAL_MAX_HEIGHT_RATIO,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },

  // Formulario nuevo jugador
  newPlayerFormContainer: {
    backgroundColor: MODERN_COLORS.surface,
  },

  formSeparator: {
    height: 1,
    backgroundColor: MODERN_COLORS.border,
    marginHorizontal: 20,
  },

  formContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  formGroup: {
    marginBottom: 20,
  },

  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 8,
    letterSpacing: 0.2,
  },

  formInput: {
    height: 48,
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  // Dropdown de posiciones
  positionDropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 48,
  },

  positionDropdownText: {
    fontSize: 16,
    fontWeight: "500",
    color: MODERN_COLORS.textDark,
  },

  positionOverlay: {
    flex: 1,
    backgroundColor: `${MODERN_COLORS.textDark}80`,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },

  positionModal: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    width: "100%",
    maxWidth: 280,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  positionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  positionHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.2,
  },

  positionOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  positionOptionSelected: {
    backgroundColor: `${MODERN_COLORS.primary}10`,
  },

  positionOptionText: {
    fontSize: 15,
    fontWeight: "500",
    color: MODERN_COLORS.textDark,
  },

  positionOptionTextSelected: {
    fontWeight: "700",
    color: MODERN_COLORS.primary,
  },

  createPlayerButton: {
    backgroundColor: MODERN_COLORS.success,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  createPlayerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textWhite,
    letterSpacing: 0.5,
  },

  // Modal de roles
  roleModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${MODERN_COLORS.textDark}80`,
  },

  roleModalContainer: {
    width: "90%",
    maxWidth: 350,
  },

  // Indicador de guardado
  savedIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${MODERN_COLORS.success}20`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${MODERN_COLORS.success}40`,
  },

  savedIndicatorText: {
    color: MODERN_COLORS.success,
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
});

export default LineupScreen;
