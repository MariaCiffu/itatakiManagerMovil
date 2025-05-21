"use client"

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback, useReducer } from "react"
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
} from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { PLAYERS } from "../../data/teamData" // Importamos los jugadores desde el archivo de datos
import { FORMATIONS, getPositionsForFormation } from "../../constants/formations" // Importamos las formaciones
import { POSICIONES } from "../../constants/positions" // Importamos las posiciones disponibles
import PlayerRoleIndicators from "../../components/alineacion/PlayerRoleIndicators"
import PlayerRoleSelector from "../../components/alineacion/PlayerRoleSelector"
import PlayerContextMenu from "../../context/PlayerContextMenu"
import FootballField from "../../components/alineacion/FootballField"
import PlayerList from "../../components/alineacion/PlayerList" // Importamos el nuevo componente
import ModalHeader from "../../components/alineacion/ModalHeader" // Importamos el componente de encabezado modal
import ErrorMessage from "../../components/alineacion/ErrorMessage" // Importamos el componente de mensaje de error
import { lineupReducer, ACTIONS, initialState } from "../../reducers/lineup-reducer" // Importamos el reducer
import { usePlayers } from "../../hooks/usePlayers" // Importamos el hook de jugadores

// Constantes para dimensiones y animaciones
const { width, height } = Dimensions.get("window")
const FIELD_RATIO = 0.65 // Proporción del campo respecto a la altura de la pantalla
const MODAL_MAX_HEIGHT_RATIO = 0.7 // Altura máxima del modal como proporción de la pantalla
const CONTEXT_MENU_Y_OFFSET = 50 // Desplazamiento vertical del menú contextual
const CONTEXT_MENU_MAX_Y = height - 200 // Posición Y máxima para el menú contextual

// Mapeo de posiciones para mostrar abreviatura
const POSITION_MAPPING = {
  Portero: "POR",
  Defensa: "DEF",
  Centrocampista: "MED",
  Delantero: "DEL",
}

// Definir colores fijos para usar en todo el componente
const COLORS = {
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
  temporaryPlayer: "#FFA500", // Color para jugadores temporales
  error: "#ff4d4d", // Color para errores
}

// Componente para el selector de formaciones (memoizado)
const FormationSelector = React.memo(({ formations, selectedFormation, onSelectFormation, readOnly }) => {
  return (
    <View style={styles.formationSelector}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {formations.map((formation) => (
          <TouchableOpacity
            key={formation.id}
            onPress={() => !readOnly && onSelectFormation(formation)}
            accessible={true}
            accessibilityLabel={`Formación ${formation.name}`}
            accessibilityHint="Toca para cambiar a esta formación"
            accessibilityRole="button"
            accessibilityState={{
              selected: selectedFormation.id === formation.id,
            }}
            disabled={readOnly}
          >
            <LinearGradient
              colors={selectedFormation.id === formation.id ? ["#4CAF50", "#2E7D32"] : [COLORS.card, "#2a2a2a"]}
              style={styles.formationButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text
                style={[
                  styles.formationText,
                  {
                    color: selectedFormation.id === formation.id ? "#fff" : COLORS.textSecondary,
                  },
                  selectedFormation.id === formation.id && styles.formationTextSelected,
                ]}
              >
                {formation.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

// Componente para jugador en el campo (memoizado)
const FieldPlayer = React.memo(({ 
  player, 
  onPress, 
  onLongPress, 
  readOnly, 
  specialRoles, 
  playerScaleAnim,
  position
}) => {
  if (!player) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={readOnly ? 1 : 0.7}
        disabled={readOnly}
        accessible={true}
        accessibilityLabel={`Posición vacía ${position}`}
        accessibilityHint="Toca para asignar un jugador a esta posición"
        accessibilityRole="button"
      >
        <View style={[styles.emptyPosition, { backgroundColor: `${COLORS.playerCircle}80` }]}>
          <Ionicons name="add" size={24} color={COLORS.fieldLines} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={readOnly ? 1 : 0.7}
      accessible={true}
      accessibilityLabel={`Jugador ${player.name}, número ${player.number}`}
      accessibilityHint="Toca para ver opciones del jugador, mantén pulsado para asignar roles"
      accessibilityRole="button"
      disabled={readOnly}
    >
      <Animated.View 
        style={[
          styles.playerAssigned, 
          { transform: [{ scale: playerScaleAnim }] }
        ]}
      >
        <View style={[
          styles.playerCircle, 
          player.isTemporary && { borderColor: COLORS.temporaryPlayer } // Borde naranja para jugadores temporales
        ]}>
          <Text style={[styles.playerNumber, { color: COLORS.text }]}>{player.number}</Text>
        </View>
        <View style={styles.playerNameContainer}>
          <Text style={[styles.playerName, { color: COLORS.text }]} numberOfLines={1}>
            {player.name.split(" ")[0]}
          </Text>
        </View>

        {/* Añadir los indicadores de roles especiales */}
        <PlayerRoleIndicators player={player} specialRoles={specialRoles} />
      </Animated.View>
    </TouchableOpacity>
  );
});

// Componente para suplente (memoizado)
const SubstitutePlayer = React.memo(({ player, onRemove, readOnly }) => {
  return (
    <View key={player.id} style={styles.substituteItem}>
      <View style={[
        styles.substituteCircle,
        player.isTemporary && { borderColor: COLORS.temporaryPlayer } // Borde naranja para jugadores temporales
      ]}>
        <Text style={[styles.substituteNumber, { color: COLORS.text }]}>{player.number}</Text>
      </View>
      <Text style={[styles.substituteName, { color: COLORS.textSecondary }]} numberOfLines={1}>
        {player.name.split(" ")[0]}
      </Text>
      {!readOnly && (
        <TouchableOpacity
          style={styles.removeSubstituteButton}
          onPress={onRemove}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          accessible={true}
          accessibilityLabel={`Quitar a ${player.name} de suplentes`}
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={16} color="#ff4d4d" />
        </TouchableOpacity>
      )}
    </View>
  );
});

// Componente para el formulario de nuevo jugador (memoizado)
const NewPlayerForm = React.memo(({ 
  name, 
  onNameChange, 
  number, 
  onNumberChange, 
  position, 
  onPositionChange, 
  onSubmit, 
  onCancel 
}) => {
  return (
    <View style={styles.newPlayerForm}>
      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: COLORS.modalText }]}>Nombre:</Text>
        <TextInput
          style={[styles.formInput, { color: COLORS.modalText, borderColor: COLORS.modalBorder }]}
          value={name}
          onChangeText={onNameChange}
          placeholder="Nombre del jugador"
          placeholderTextColor={`${COLORS.textSecondary}80`}
          accessible={true}
          accessibilityLabel="Nombre del jugador"
          accessibilityHint="Introduce el nombre del nuevo jugador"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: COLORS.modalText }]}>Número:</Text>
        <TextInput
          style={[styles.formInput, { color: COLORS.modalText, borderColor: COLORS.modalBorder }]}
          value={number}
          onChangeText={onNumberChange}
          placeholder="Número"
          placeholderTextColor={`${COLORS.textSecondary}80`}
          keyboardType="number-pad"
          accessible={true}
          accessibilityLabel="Número del jugador"
          accessibilityHint="Introduce el número del nuevo jugador"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={[styles.formLabel, { color: COLORS.modalText }]}>Posición:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.positionScrollView}>
          <View style={styles.positionSelector}>
            {POSICIONES.map((posicion) => (
              <TouchableOpacity
                key={posicion}
                style={[
                  styles.positionButton,
                  {
                    backgroundColor: position === posicion ? COLORS.temporaryPlayer : COLORS.card,
                  },
                ]}
                onPress={() => onPositionChange(posicion)}
                accessible={true}
                accessibilityLabel={`Posición ${posicion}`}
                accessibilityState={{ selected: position === posicion }}
                accessibilityRole="button"
              >
                <Text
                  style={[
                    styles.positionButtonText,
                    {
                      color: position === posicion ? "#000" : COLORS.textSecondary,
                    },
                  ]}
                >
                  {posicion}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.createPlayerButton, { backgroundColor: COLORS.temporaryPlayer }]}
        onPress={onSubmit}
        accessible={true}
        accessibilityLabel="Crear jugador"
        accessibilityHint="Crea un nuevo jugador con los datos introducidos"
        accessibilityRole="button"
      >
        <Text style={[styles.createPlayerButtonText, { color: "#000" }]}>Crear jugador</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.cancelButton, { borderColor: COLORS.modalBorder }]}
        onPress={onCancel}
        accessible={true}
        accessibilityLabel="Cancelar"
        accessibilityHint="Cancela la creación del nuevo jugador"
        accessibilityRole="button"
      >
        <Text style={[styles.cancelButtonText, { color: COLORS.modalText }]}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
});

const LineupScreen = forwardRef(
  (
    { matchday = "", matchTitle = null, isEmbedded = false, initialData = null, onSaveLineup = null, readOnly = false },
    ref,
  ) => {
    const router = useRouter()

    // Inicializar el estado con useReducer
    const [state, dispatch] = useReducer(lineupReducer, initialState);

    // Extraer valores del estado
    const { 
      selectedFormation, 
      previousFormation, 
      lineup, 
      substitutes, 
      specialRoles, 
      temporaryPlayers, 
      initialDataLoaded 
    } = state;

    // Usar el hook de jugadores
    const { availablePlayers } = usePlayers(lineup, substitutes, temporaryPlayers);

    // Estados de UI
    const [playerSelectorVisible, setPlayerSelectorVisible] = useState(false)
    const [selectedPosition, setSelectedPosition] = useState(null)
    const [roleModalVisible, setRoleModalVisible] = useState(false)
    const [selectedPlayer, setSelectedPlayer] = useState(null)
    const [contextMenuVisible, setContextMenuVisible] = useState(false)
    const [contextMenuPosition, setContextMenuPosition] = useState({
      x: 0,
      y: 0,
    })
    const [showSavedIndicator, setShowSavedIndicator] = useState(false)
    const [newPlayerModalVisible, setNewPlayerModalVisible] = useState(false)
    const [newPlayerName, setNewPlayerName] = useState("")
    const [newPlayerNumber, setNewPlayerNumber] = useState("")
    const [newPlayerPosition, setNewPlayerPosition] = useState(POSICIONES[0])
    const [error, setError] = useState(null) // Estado para mensajes de error

    // Referencias
    const initialDataProcessedRef = useRef(false)
    const formationChangeRef = useRef(false)
    
    // Animaciones
    const formationChangeAnim = useRef(new Animated.Value(0)).current
    const playerScaleAnim = useRef(new Animated.Value(1)).current
    const savedIndicatorAnim = useRef(new Animated.Value(0)).current
    const errorAnim = useRef(new Animated.Value(0)).current

    // Título de la pantalla (memoizado)
    const screenTitle = useMemo(() => {
      return matchTitle || (typeof matchday === "number" ? `Jornada ${matchday}` : matchday || "Alineación")
    }, [matchTitle, matchday])

    // Función para mostrar un error
    const showError = useCallback((message) => {
      setError(message);
      errorAnim.setValue(1);
      
      // Auto-dismiss después de 3 segundos
      setTimeout(() => {
        Animated.timing(errorAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setError(null);
        });
      }, 3000);
    }, [errorAnim]);

    // Función unificada para guardar la alineación
    const saveLineup = useCallback(
      (newLineup = lineup, newSubstitutes = substitutes, newSpecialRoles = specialRoles) => {
        if (!isEmbedded || !onSaveLineup) return

        try {
          const titulares = Object.entries(newLineup)
            .map(([position, p]) => {
              if (p) {
                return {
                  ...p,
                  fieldPosition: position,
                }
              }
              return null
            })
            .filter((p) => p !== null)

          onSaveLineup({
            formacion: selectedFormation.name,
            titulares,
            suplentes: newSubstitutes,
            specialRoles: newSpecialRoles,
            lineup: newLineup,
            temporaryPlayers, // Guardar también los jugadores temporales
          })
        } catch (error) {
          console.error("Error al guardar alineación:", error);
          showError("Error al guardar la alineación");
        }
      },
      [isEmbedded, onSaveLineup, lineup, substitutes, specialRoles, selectedFormation, temporaryPlayers, showError],
    )

    // Función para mostrar el indicador de guardado
    const displaySavedIndicator = useCallback(() => {
      // No mostrar el indicador en modo de solo lectura
      if (readOnly) return

      setShowSavedIndicator(true)
      savedIndicatorAnim.setValue(1)
      setTimeout(() => {
        Animated.timing(savedIndicatorAnim, {
          toValue: 0,
          duration: 1000,
          delay: 1000,
          useNativeDriver: true,
        }).start(() => {
          setShowSavedIndicator(false)
        })
      }, 0)
    }, [savedIndicatorAnim, readOnly])

    // Exponer métodos a través de la referencia
    useImperativeHandle(ref, () => ({
      getAlineacionData: () => {
        try {
          // Convertir el objeto lineup a un array de titulares, pero solo con IDs y posiciones
          const titulares = Object.entries(lineup)
            .map(([position, player]) => {
              if (player) {
                // Solo guardar el ID y la posición en el campo
                return {
                  id: player.id,
                  fieldPosition: position,
                  isTemporary: player.isTemporary || false, // Indicar si es un jugador temporal
                }
              }
              return null
            })
            .filter((player) => player !== null)

          // Convertir suplentes a solo IDs
          const suplentesIds = substitutes.map((player) => ({
            id: player.id,
            isTemporary: player.isTemporary || false, // Indicar si es un jugador temporal
          }))

          // Convertir roles especiales a un objeto con solo IDs
          const rolesIds = {}
          Object.entries(specialRoles).forEach(([role, player]) => {
            rolesIds[role] = player
          })

          // Devolver los datos de la alineación con la estructura correcta
          return {
            formacion: selectedFormation.name, // Solo el nombre de la formación
            titulares, // Array de jugadores titulares con sus IDs y posiciones
            suplentes: suplentesIds, // Array de IDs de jugadores suplentes
            specialRoles: rolesIds, // Objeto con roles especiales (IDs)
            temporaryPlayers, // Incluir los jugadores temporales completos
          }
        } catch (error) {
          console.error("Error al obtener datos de alineación:", error);
          showError("Error al obtener datos de alineación");
          return null;
        }
      },
    }))

    // Inicializar con datos si se proporcionan - USANDO REF PARA EVITAR MÚLTIPLES EJECUCIONES
    useEffect(() => {
      // Usar una referencia para evitar múltiples procesamientos
      if (initialData && !initialDataProcessedRef.current) {
        try {
          initialDataProcessedRef.current = true;
          console.log("Inicializando con datos:", initialData)

          // Preparar datos para cargar
          const loadData = {
            temporaryPlayers: initialData.temporaryPlayers || [],
            formation: null,
            lineup: {},
            substitutes: [],
            specialRoles: initialData.specialRoles || {}
          };

          // Cargar formación
          if (initialData.formacion && typeof initialData.formacion === "string") {
            console.log("Estableciendo formación:", initialData.formacion)
            loadData.formation = FORMATIONS.find((f) => f.name === initialData.formacion) || FORMATIONS[0];
          } else if (initialData.formation) {
            loadData.formation = initialData.formation;
          } else {
            loadData.formation = FORMATIONS[0];
          }

          // Reconstruir el lineup a partir de los titulares con IDs
          if (initialData.titulares && Array.isArray(initialData.titulares) && initialData.titulares.length > 0) {
            console.log("Procesando titulares:", initialData.titulares.length)
            
            // Reconstruir jugadores completos a partir de IDs
            initialData.titulares.forEach((item) => {
              if (item && item.id && item.fieldPosition) {
                // Buscar primero en jugadores temporales si es un jugador temporal
                if (item.isTemporary) {
                  const tempPlayer = initialData.temporaryPlayers?.find(p => p.id === item.id)
                  if (tempPlayer) {
                    loadData.lineup[item.fieldPosition] = tempPlayer
                  }
                } else {
                  // Buscar el jugador completo por ID en la lista principal
                  const player = PLAYERS.find((p) => p.id === item.id)
                  if (player) {
                    loadData.lineup[item.fieldPosition] = player
                  }
                }
              }
            });
          }

          // Reconstruir suplentes a partir de IDs
          if (initialData.suplentes && Array.isArray(initialData.suplentes) && initialData.suplentes.length > 0) {
            console.log("Procesando suplentes:", initialData.suplentes.length)
            
            // Procesar cada suplente
            initialData.suplentes.forEach((item) => {
              // Si es solo un ID
              if (typeof item === "string" || typeof item === "number") {
                const player = PLAYERS.find((p) => p.id === item)
                if (player) {
                  loadData.substitutes.push(player)
                }
              } 
              // Si es un objeto con ID y flag de temporal
              else if (item && item.id) {
                if (item.isTemporary) {
                  const tempPlayer = initialData.temporaryPlayers?.find(p => p.id === item.id)
                  if (tempPlayer) {
                    loadData.substitutes.push(tempPlayer)
                  }
                } else {
                  const player = PLAYERS.find((p) => p.id === item.id)
                  if (player) {
                    loadData.substitutes.push(player)
                  }
                }
              }
              // Si es un objeto completo (para compatibilidad)
              else if (item) {
                loadData.substitutes.push(item)
              }
            });
          }

          // Cargar todos los datos en el estado
          dispatch({ type: ACTIONS.LOAD_INITIAL_DATA, payload: loadData });
        } catch (error) {
          console.error("Error al cargar datos iniciales:", error);
          showError("Error al cargar datos iniciales");
        }
      }
    }, [initialData, showError]); // Solo depende de initialData y showError

    // Actualizar posiciones cuando cambia la formación - CON REFERENCIA PARA EVITAR BUCLES
    useEffect(() => {
      // Solo ejecutar cuando cambia la formación seleccionada y no es la primera carga
      if (selectedFormation && previousFormation && selectedFormation !== previousFormation && !formationChangeRef.current) {
        try {
          formationChangeRef.current = true;
          console.log("Cambiando formación de", previousFormation.name, "a", selectedFormation.name);

          // Animar el cambio de formación
          formationChangeAnim.setValue(0);

          // Reasignar jugadores
          dispatch({ 
            type: ACTIONS.REASSIGN_PLAYERS, 
            payload: { 
              previousFormation, 
              newFormation: selectedFormation 
            } 
          });

          // Luego iniciar la animación
          setTimeout(() => {
            Animated.timing(formationChangeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: false,
            }).start();

            // Mostrar indicador de guardado cuando cambia la formación
            displaySavedIndicator();

            // Guardar la alineación
            saveLineup();
            
            // Resetear la referencia después de un tiempo para permitir futuros cambios
            setTimeout(() => {
              formationChangeRef.current = false;
            }, 100);
          }, 0);
        } catch (error) {
          console.error("Error al cambiar formación:", error);
          showError("Error al cambiar formación");
          formationChangeRef.current = false;
        }
      }

      // Siempre actualizar previousFormation si hay un cambio
      if (selectedFormation !== previousFormation) {
        dispatch({ type: ACTIONS.SET_PREVIOUS_FORMATION, payload: selectedFormation });
      }
    }, [selectedFormation, previousFormation, displaySavedIndicator, saveLineup, formationChangeAnim, showError]);

    // Función para crear un nuevo jugador temporal
    const createTemporaryPlayer = useCallback(() => {
      try {
        // Validar campos
        if (!newPlayerName.trim()) {
          Alert.alert("Error", "El nombre del jugador es obligatorio");
          return;
        }
        
        if (!newPlayerNumber.trim()) {
          Alert.alert("Error", "El número del jugador es obligatorio");
          return;
        }
        
        const numberValue = parseInt(newPlayerNumber.trim(), 10);
        if (isNaN(numberValue) || numberValue <= 0) {
          Alert.alert("Error", "El número debe ser un valor positivo");
          return;
        }
        
        // Verificar si el número ya está en uso
        const allPlayers = [...PLAYERS, ...temporaryPlayers];
        if (allPlayers.some(p => p.number === numberValue)) {
          Alert.alert("Error", "Este número ya está asignado a otro jugador");
          return;
        }

        // Generar un ID único para el jugador temporal
        const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        
        // Crear el objeto del jugador temporal
        const newPlayer = {
          id: tempId,
          name: newPlayerName.trim(),
          number: numberValue,
          position: newPlayerPosition,
          isTemporary: true, // Marcar como jugador temporal
        }

        // Añadir a la lista de jugadores temporales
        dispatch({ type: ACTIONS.ADD_TEMPORARY_PLAYER, payload: newPlayer });

        // Limpiar el formulario
        setNewPlayerName("")
        setNewPlayerNumber("")
        setNewPlayerPosition(POSICIONES[0])
        
        // Cerrar el modal
        setNewPlayerModalVisible(false)

        // Si estamos añadiendo directamente a una posición o como suplente
        if (selectedPosition) {
          if (selectedPosition === "substitute") {
            // Añadir como suplente
            dispatch({ type: ACTIONS.ADD_SUBSTITUTE, payload: newPlayer });
          } else {
            // Añadir a la posición seleccionada
            dispatch({ 
              type: ACTIONS.ASSIGN_PLAYER, 
              payload: { position: selectedPosition, player: newPlayer } 
            });
          }
          
          // Mostrar indicador de guardado
          displaySavedIndicator()
          
          // Guardar la alineación
          saveLineup(
            selectedPosition === "substitute" ? lineup : { ...lineup, [selectedPosition]: newPlayer },
            selectedPosition === "substitute" ? [...substitutes, newPlayer] : substitutes
          );
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
      saveLineup, 
      displaySavedIndicator,
      showError
    ])

    // Función para seleccionar un jugador para una posición
    const selectPlayerForPosition = useCallback(
      (position, event) => {
        if (readOnly) return

        try {
          const player = lineup[position]

          // Animar la selección
          playerScaleAnim.setValue(1)
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
          ]).start()

          if (player) {
            // Si ya hay un jugador en esa posición, mostrar menú contextual
            setSelectedPlayer(player)
            setSelectedPosition(position)

            // Calcular posición del menú contextual
            if (event && event.nativeEvent) {
              // Ajustar la posición Y para que aparezca más abajo
              const adjustedY = Math.min(event.nativeEvent.pageY, CONTEXT_MENU_MAX_Y)

              setContextMenuPosition({
                x: event.nativeEvent.pageX,
                y: adjustedY + CONTEXT_MENU_Y_OFFSET,
              })
            }

            setContextMenuVisible(true)
          } else {
            // Si no hay jugador, mostrar el selector de jugadores
            setSelectedPosition(position)
            setPlayerSelectorVisible(true)
          }
        } catch (error) {
          console.error("Error al seleccionar jugador:", error);
          showError("Error al seleccionar jugador");
        }
      },
      [lineup, playerScaleAnim, readOnly, showError],
    )

    // Función para asignar un jugador a una posición
    const assignPlayerToPosition = useCallback(
      (player) => {
        try {
          // Asignar jugador usando el reducer
          dispatch({ 
            type: ACTIONS.ASSIGN_PLAYER, 
            payload: { position: selectedPosition, player } 
          });
          
          setPlayerSelectorVisible(false)

          // Mostrar indicador de guardado
          displaySavedIndicator()

          // Guardar la alineación - Calculamos el nuevo estado para pasarlo a saveLineup
          const newLineup = { ...lineup };
          
          // Quitar el jugador de otra posición si ya está asignado
          Object.keys(newLineup).forEach((pos) => {
            if (newLineup[pos]?.id === player.id) {
              delete newLineup[pos];
            }
          });
          
          // Asignar el jugador a la posición seleccionada
          newLineup[selectedPosition] = player;
          
          // Quitar de suplentes si está ahí
          const newSubstitutes = substitutes.filter((sub) => sub.id !== player.id);
          
          saveLineup(newLineup, newSubstitutes);
        } catch (error) {
          console.error("Error al asignar jugador:", error);
          showError("Error al asignar jugador");
        }
      },
      [lineup, selectedPosition, substitutes, displaySavedIndicator, saveLineup, showError],
    )

    // Función para añadir un jugador a suplentes
    const addSubstitute = useCallback(
      (player) => {
        try {
          // Añadir suplente usando el reducer
          dispatch({ type: ACTIONS.ADD_SUBSTITUTE, payload: player });
          
          setPlayerSelectorVisible(false)

          // Mostrar indicador de guardado
          displaySavedIndicator()

          // Guardar la alineación
          saveLineup(lineup, [...substitutes, player]);
        } catch (error) {
          console.error("Error al añadir suplente:", error);
          showError("Error al añadir suplente");
        }
      },
      [lineup, substitutes, displaySavedIndicator, saveLineup, showError],
    )

    // Función para quitar un jugador de una posición
    const removePlayerFromPosition = useCallback(
      (position) => {
        try {
          // Quitar jugador usando el reducer
          dispatch({ type: ACTIONS.REMOVE_PLAYER, payload: position });

          // Mostrar indicador de guardado
          displaySavedIndicator()

          // Guardar la alineación
          const newLineup = { ...lineup };
          delete newLineup[position];
          saveLineup(newLineup);
        } catch (error) {
          console.error("Error al quitar jugador:", error);
          showError("Error al quitar jugador");
        }
      },
      [lineup, displaySavedIndicator, saveLineup, showError],
    )

    // Función para quitar un jugador de suplentes
    const removeSubstitute = useCallback(
      (playerId) => {
        try {
          // Quitar suplente usando el reducer
          dispatch({ type: ACTIONS.REMOVE_SUBSTITUTE, payload: playerId });

          // Mostrar indicador de guardado
          displaySavedIndicator()

          // Guardar la alineación
          const newSubstitutes = substitutes.filter((sub) => sub.id !== playerId);
          saveLineup(lineup, newSubstitutes);
        } catch (error) {
          console.error("Error al quitar suplente:", error);
          showError("Error al quitar suplente");
        }
      },
      [substitutes, lineup, displaySavedIndicator, saveLineup, showError],
    )

    // Función para manejar la asignación de roles desde el menú contextual
    const handleAssignRoleFromMenu = useCallback(() => {
      setContextMenuVisible(false)
      setRoleModalVisible(true)
    }, [])

    // Función para quitar un jugador desde el menú contextual
    const handleRemovePlayerFromMenu = useCallback(() => {
      removePlayerFromPosition(selectedPosition)
      setContextMenuVisible(false)
    }, [removePlayerFromPosition, selectedPosition])

    // Función para manejar la pulsación larga en un jugador
    const handleLongPressPlayer = useCallback(
      (position) => {
        if (readOnly) return

        try {
          const player = lineup[position]
          if (player) {
            setSelectedPlayer(player)
            setSelectedPosition(position)
            setRoleModalVisible(true)
          }
        } catch (error) {
          console.error("Error al manejar pulsación larga:", error);
          showError("Error al manejar pulsación larga");
        }
      },
      [lineup, readOnly, showError],
    )

    // Renderizar jugador en posición (memoizado)
    const renderPlayerPosition = useCallback(
      (position, positionStyle) => {
        const player = lineup[position]

        // Calcular posición animada durante cambio de formación
        const animatedStyle = previousFormation
          ? {
              left: formationChangeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  positionStyle.left, // Posición inicial
                  positionStyle.left, // Posición final
                ],
              }),
              top: formationChangeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [
                  positionStyle.top, // Posición inicial
                  positionStyle.top, // Posición final
                ],
              }),
            }
          : positionStyle

        return (
          <Animated.View
            style={[
              styles.playerPosition,
              animatedStyle,
              { transform: [{ translateX: -25 }, { translateY: -35 }] }, // Ajustado para fichas más grandes
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
        )
      },
      [
        lineup,
        previousFormation,
        formationChangeAnim,
        playerScaleAnim,
        selectPlayerForPosition,
        handleLongPressPlayer,
        readOnly,
        specialRoles
      ],
    )

    // Manejar la actualización de roles especiales
    const handleUpdateSpecialRoles = useCallback((newRoles) => {
      try {
        dispatch({ type: ACTIONS.SET_SPECIAL_ROLES, payload: newRoles });
        
        // Mostrar indicador de guardado
        displaySavedIndicator();
        
        // Guardar la alineación
        saveLineup(lineup, substitutes, newRoles);
      } catch (error) {
        console.error("Error al actualizar roles especiales:", error);
        showError("Error al actualizar roles especiales");
      }
    }, [lineup, substitutes, saveLineup, displaySavedIndicator, showError]);

    // Manejar la selección de formación
    const handleSelectFormation = useCallback((formation) => {
      if (readOnly) return;
      dispatch({ type: ACTIONS.SET_FORMATION, payload: formation });
    }, [readOnly]);

    // Manejar la selección de un jugador en la lista
    const handleSelectPlayer = useCallback((player) => {
      if (selectedPosition === "substitute") {
        addSubstitute(player);
      } else {
        assignPlayerToPosition(player);
      }
    }, [selectedPosition, addSubstitute, assignPlayerToPosition]);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        {/* Mensaje de error */}
        {error && (
          <Animated.View style={{ opacity: errorAnim }}>
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError(null)} 
            />
          </Animated.View>
        )}
        
        {!isEmbedded && (
          <View style={[styles.header, { borderBottomColor: `${COLORS.text}20` }]}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
              accessible={true}
              accessibilityLabel="Volver"
              accessibilityHint="Vuelve a la pantalla anterior"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text 
              style={[styles.headerTitle, { color: COLORS.text }]}
              accessible={true}
              accessibilityLabel={`Título: ${screenTitle}`}
              accessibilityRole="header"
            >
              {screenTitle}
            </Text>

            {/* Indicador de guardado - solo visible si no es de solo lectura */}
            {showSavedIndicator && !readOnly && (
              <Animated.View style={[styles.savedIndicator, { opacity: savedIndicatorAnim }]}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.savedIndicatorText}>Guardado</Text>
              </Animated.View>
            )}
          </View>
        )}

        {/* Ocultar el selector de formación en modo de solo lectura */}
        {!readOnly && (
          <FormationSelector
            formations={FORMATIONS}
            selectedFormation={selectedFormation}
            onSelectFormation={handleSelectFormation}
            readOnly={readOnly}
          />
        )}

        <FootballField style={{ marginBottom: 8 }}>
          {/* Posiciones de jugadores */}
          {Object.entries(getPositionsForFormation(selectedFormation)).map(([position, posStyle]) =>
            renderPlayerPosition(position, posStyle),
          )}
        </FootballField>

        {/* Mostrar suplentes tanto en modo edición como en modo de solo lectura */}
        <View
          style={[
            styles.substitutesContainer,
            {
              backgroundColor: COLORS.card,
              borderTopColor: `${COLORS.text}20`,
            },
          ]}
        >
          <Text 
            style={[styles.substitutesTitle, { color: COLORS.text }]}
            accessible={true}
            accessibilityLabel="Suplentes"
            accessibilityRole="header"
          >
            Suplentes:
          </Text>
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
                onRemove={() => removeSubstitute(player.id)}
                readOnly={readOnly}
              />
            ))}
            {!readOnly && (
              <TouchableOpacity
                style={styles.addSubstituteButton}
                onPress={() => {
                  setSelectedPosition("substitute")
                  setPlayerSelectorVisible(true)
                }}
                accessible={true}
                accessibilityLabel="Añadir suplente"
                accessibilityHint="Toca para añadir un jugador suplente"
                accessibilityRole="button"
              >
                <Ionicons name="add-circle" size={24} color={COLORS.accent} />
                <Text style={[styles.addSubstituteText, { color: COLORS.accent }]}>Añadir</Text>
              </TouchableOpacity>
            )}
            {substitutes.length === 0 && readOnly && (
              <Text style={[styles.emptyListText, { color: COLORS.textSecondary, marginLeft: 10 }]}>
                No hay suplentes
              </Text>
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
          <View style={[styles.modalContainer, { backgroundColor: COLORS.modalBackground }]}>
            <View style={[styles.modalContent, { backgroundColor: COLORS.modalContent }]}>
              <ModalHeader
                title={selectedPosition === "substitute" ? "Seleccionar suplente" : "Seleccionar jugador"}
                onClose={() => setPlayerSelectorVisible(false)}
                colors={COLORS}
              />

              {/* Reemplazado FlatList con el componente PlayerList */}
              <PlayerList
                players={availablePlayers}
                onSelectPlayer={handleSelectPlayer}
                onAddNewPlayer={() => {
                  setPlayerSelectorVisible(false);
                  setNewPlayerModalVisible(true);
                }}
                colors={COLORS}
                styles={styles}
              />
            </View>
          </View>
        </Modal>

        {/* Modal para añadir nuevo jugador */}
        <Modal
          visible={newPlayerModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setNewPlayerModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            <View style={[styles.modalContainer, { backgroundColor: COLORS.modalBackground }]}>
              <View style={[styles.modalContent, { backgroundColor: COLORS.modalContent }]}>
                <ModalHeader
                  title="Añadir jugador nuevo"
                  onClose={() => setNewPlayerModalVisible(false)}
                  colors={COLORS}
                />

                <NewPlayerForm
                  name={newPlayerName}
                  onNameChange={setNewPlayerName}
                  number={newPlayerNumber}
                  onNumberChange={setNewPlayerNumber}
                  position={newPlayerPosition}
                  onPositionChange={setNewPlayerPosition}
                  onSubmit={createTemporaryPlayer}
                  onCancel={() => setNewPlayerModalVisible(false)}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Modal para la selección de roles especiales */}
        <Modal
          visible={roleModalVisible && selectedPlayer !== null}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRoleModalVisible(false)}
        >
          <TouchableOpacity
            style={[styles.roleModalOverlay, { backgroundColor: COLORS.modalBackground }]}
            activeOpacity={1}
            onPress={() => setRoleModalVisible(false)}
          >
            <View style={styles.roleModalContainer}>
              <TouchableOpacity activeOpacity={1}>
                {selectedPlayer && (
                  <PlayerRoleSelector
                    player={selectedPlayer}
                    specialRoles={specialRoles}
                    onUpdateSpecialRoles={handleUpdateSpecialRoles}
                    onClose={() => setRoleModalVisible(false)}
                    theme={COLORS}
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
            theme={COLORS}
          />
        )}
      </SafeAreaView>
    )
  },
)

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
  // Indicador de guardado
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
    position: "relative", // Para posicionar el badge
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
  // Estilos para el badge de jugadores temporales (mantenidos para compatibilidad)
  temporaryBadgeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  substitutesContainer: {
    padding: 12,
    borderTopWidth: 1,
    minHeight: 140, // Aumentado para dar más espacio
    height: "auto", // Permitir que crezca según el contenido
  },
  substitutesTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  substitutesList: {
    flexDirection: "row",
    height: 100, // Altura fija para el ScrollView
  },
  substitutesContent: {
    paddingRight: 20, // Añade espacio al final
    paddingBottom: 10, // Añadir padding inferior
    alignItems: "center", // Centrar verticalmente
  },
  substituteItem: {
    alignItems: "center",
    marginRight: 16,
    width: 60,
    position: "relative",
    marginBottom: 5, // Añadir margen inferior
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
    position: "relative", // Para posicionar el badge
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
    maxHeight: height * MODAL_MAX_HEIGHT_RATIO,
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
    borderWidth: 1,
    borderColor: "#666",
    position: "relative", // Para posicionar el badge
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
  // Estilos para añadir nuevo jugador
  addNewPlayerButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  addNewPlayerText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 12,
  },
  newPlayerForm: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
  },
  formInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  positionScrollView: {
    maxHeight: 120,
  },
  positionSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    paddingBottom: 8,
  },
  positionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  positionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  createPlayerButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  createPlayerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  // Estilos para mensajes de error
  errorContainer: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
})

export default LineupScreen