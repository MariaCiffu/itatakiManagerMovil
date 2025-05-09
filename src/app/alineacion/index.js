// src/app/alineacion/index.js
import { useState, useEffect } from "react";
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
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PLAYERS } from "../../data/teamData"; // Importamos los jugadores desde el archivo de datos

// Obtener dimensiones de la pantalla
const { width, height } = Dimensions.get("window");
const FIELD_RATIO = 0.65; // Proporción del campo respecto a la altura de la pantalla

// Formaciones disponibles
const FORMATIONS = [
  { id: "442", name: "4-4-2" },
  { id: "433", name: "4-3-3" },
  { id: "352", name: "3-5-2" },
  { id: "532", name: "5-3-2" },
];

// Mapeo de posiciones para mostrar abreviatura
const POSITION_MAPPING = {
  "Portero": "POR",
  "Defensa": "DEF",
  "Centrocampista": "MED",
  "Delantero": "DEL"
};

export default function LineupScreen() {
  const router = useRouter();
  const [selectedFormation, setSelectedFormation] = useState(FORMATIONS[0]);
  const [lineup, setLineup] = useState({});
  const [substitutes, setSubstitutes] = useState([]);
  const [playerSelectorVisible, setPlayerSelectorVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [matchday, setMatchday] = useState(35);
  const [availablePlayers, setAvailablePlayers] = useState(PLAYERS); // Usamos los jugadores del archivo de datos

  // Posiciones de los jugadores según la formación
  const getPositionsForFormation = (formation) => {
    switch (formation.id) {
      case "442":
        return {
          GK: { top: "85%", left: "50%" },
          DEF1: { top: "70%", left: "20%" },
          DEF2: { top: "70%", left: "40%" },
          DEF3: { top: "70%", left: "60%" },
          DEF4: { top: "70%", left: "80%" },
          MID1: { top: "50%", left: "20%" },
          MID2: { top: "50%", left: "40%" },
          MID3: { top: "50%", left: "60%" },
          MID4: { top: "50%", left: "80%" },
          FWD1: { top: "30%", left: "35%" },
          FWD2: { top: "30%", left: "65%" },
        };
      case "433":
        return {
          GK: { top: "85%", left: "50%" },
          DEF1: { top: "70%", left: "20%" },
          DEF2: { top: "70%", left: "40%" },
          DEF3: { top: "70%", left: "60%" },
          DEF4: { top: "70%", left: "80%" },
          MID1: { top: "50%", left: "30%" },
          MID2: { top: "50%", left: "50%" },
          MID3: { top: "50%", left: "70%" },
          FWD1: { top: "30%", left: "25%" },
          FWD2: { top: "25%", left: "50%" },
          FWD3: { top: "30%", left: "75%" },
        };
      case "352":
        return {
          GK: { top: "85%", left: "50%" },
          DEF1: { top: "70%", left: "30%" },
          DEF2: { top: "75%", left: "50%" },
          DEF3: { top: "70%", left: "70%" },
          MID1: { top: "55%", left: "15%" },
          MID2: { top: "50%", left: "30%" },
          MID3: { top: "45%", left: "50%" },
          MID4: { top: "50%", left: "70%" },
          MID5: { top: "55%", left: "85%" },
          FWD1: { top: "30%", left: "35%" },
          FWD2: { top: "30%", left: "65%" },
        };
      case "532":
        return {
          GK: { top: "85%", left: "50%" },
          DEF1: { top: "70%", left: "15%" },
          DEF2: { top: "75%", left: "30%" },
          DEF3: { top: "78%", left: "50%" },
          DEF4: { top: "75%", left: "70%" },
          DEF5: { top: "70%", left: "85%" },
          MID1: { top: "50%", left: "30%" },
          MID2: { top: "45%", left: "50%" },
          MID3: { top: "50%", left: "70%" },
          FWD1: { top: "30%", left: "35%" },
          FWD2: { top: "30%", left: "65%" },
        };
      default:
        return {};
    }
  };

  // Actualizar posiciones cuando cambia la formación
  useEffect(() => {
    // Reiniciar alineación al cambiar formación
    setLineup({});
  }, [selectedFormation]);

  // Función para seleccionar un jugador para una posición
  const selectPlayerForPosition = (position) => {
    setSelectedPosition(position);
    setPlayerSelectorVisible(true);
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
      ...Object.values(lineup).map(player => player.id),
      ...substitutes.map(player => player.id)
    ];
    
    return PLAYERS.filter(player => !selectedPlayerIds.includes(player.id));
  };

  // Renderizar jugador en posición
  const renderPlayerPosition = (position, positionStyle) => {
    const player = lineup[position];

    return (
      <TouchableOpacity
        style={[styles.playerPosition, positionStyle]}
        onPress={() => selectPlayerForPosition(position)}
        key={position}
      >
        {player ? (
          <View style={styles.playerAssigned}>
            <View style={styles.playerCircle}>
              <Text style={styles.playerNumber}>{player.number}</Text>
            </View>
            <Text style={styles.playerName} numberOfLines={1}>
              {player.name.split(" ")[0]}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyPosition}>
            <Ionicons name="add" size={24} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alineación jornada {matchday}</Text>
      </View>

      <View style={styles.formationSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FORMATIONS.map((formation) => (
            <TouchableOpacity
              key={formation.id}
              style={[styles.formationButton, selectedFormation.id === formation.id && styles.formationButtonSelected]}
              onPress={() => setSelectedFormation(formation)}
            >
              <Text
                style={[styles.formationText, selectedFormation.id === formation.id && styles.formationTextSelected]}
              >
                {formation.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.fieldContainer}>
        <View style={styles.field}>
          {/* Líneas del campo */}
          <View style={styles.centerLine} />
          <View style={styles.centerCircle} />
          <View style={styles.centerDot} />

          <View style={styles.penaltyBoxTop}>
            <View style={styles.goalBoxTop} />
            <View style={styles.penaltyArcTop} />
            <View style={styles.penaltyDotTop} />
          </View>

          <View style={styles.penaltyBoxBottom}>
            <View style={styles.goalBoxBottom} />
            <View style={styles.penaltyArcBottom} />
            <View style={styles.penaltyDotBottom} />
          </View>

          {/* Posiciones de jugadores */}
          {Object.entries(getPositionsForFormation(selectedFormation)).map(([position, posStyle]) =>
            renderPlayerPosition(position, posStyle),
          )}
        </View>
      </View>

      <View style={styles.substitutesContainer}>
        <Text style={styles.substitutesTitle}>Suplentes:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.substitutesList}>
          {substitutes.map((player) => (
            <View key={player.id} style={styles.substituteItem}>
              <View style={styles.substituteCircle}>
                <Text style={styles.substituteNumber}>{player.number}</Text>
              </View>
              <Text style={styles.substituteName} numberOfLines={1}>
                {player.name.split(" ")[0]}
              </Text>
              <TouchableOpacity style={styles.removeSubstituteButton} onPress={() => removeSubstitute(player.id)}>
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
            <Ionicons name="add-circle" size={24} color="#4CAF50" />
            <Text style={styles.addSubstituteText}>Añadir</Text>
          </TouchableOpacity>
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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPosition === "substitute" ? "Seleccionar suplente" : "Seleccionar jugador"}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setPlayerSelectorVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getAvailablePlayers()}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.playerItem}
                  onPress={() => {
                    if (selectedPosition === "substitute") {
                      addSubstitute(item);
                    } else {
                      assignPlayerToPosition(item);
                    }
                  }}
                >
                  <View style={styles.playerItemCircle}>
                    <Text style={styles.playerItemNumber}>{item.number}</Text>
                  </View>
                  <View style={styles.playerItemInfo}>
                    <Text style={styles.playerItemName}>{item.name}</Text>
                    <Text style={styles.playerItemPosition}>{item.position}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyListContainer}>
                  <Text style={styles.emptyListText}>No hay jugadores disponibles</Text>
                </View>
              }
            />
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
  formationSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  formationButton: {
    backgroundColor: "#333",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  formationButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  formationText: {
    color: "#ccc",
    fontWeight: "500",
  },
  formationTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  fieldContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  field: {
    width: width - 32,
    height: height * FIELD_RATIO,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#fff",
    position: "relative",
    // Patrón de rayas para el césped
    backgroundColor: "#3a9d3a",
    overflow: "hidden",
  },
  // Líneas del campo
  centerLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#fff",
    top: "50%",
  },
  centerCircle: {
    position: "absolute",
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 2,
    borderColor: "#fff",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -width * 0.15 }, { translateY: -width * 0.15 }],
  },
  centerDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  penaltyBoxTop: {
    position: "absolute",
    width: "60%",
    height: "20%",
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#fff",
    top: 0,
    left: "20%",
  },
  goalBoxTop: {
    position: "absolute",
    width: "30%",
    height: "40%",
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#fff",
    top: 0,
    left: "35%",
  },
  penaltyArcTop: {
    position: "absolute",
    width: width * 0.2,
    height: width * 0.1,
    borderBottomLeftRadius: width * 0.1,
    borderBottomRightRadius: width * 0.1,
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: "#fff",
    top: "60%",
    left: "50%",
    transform: [{ translateX: -width * 0.1 }],
  },
  penaltyDotTop: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    top: "70%",
    left: "50%",
    transform: [{ translateX: -3 }],
  },
  penaltyBoxBottom: {
    position: "absolute",
    width: "60%",
    height: "20%",
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "#fff",
    bottom: 0,
    left: "20%",
  },
  goalBoxBottom: {
    position: "absolute",
    width: "30%",
    height: "40%",
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "#fff",
    bottom: 0,
    left: "35%",
  },
  penaltyArcBottom: {
    position: "absolute",
    width: width * 0.2,
    height: width * 0.1,
    borderTopLeftRadius: width * 0.1,
    borderTopRightRadius: width * 0.1,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "#fff",
    bottom: "60%",
    left: "50%",
    transform: [{ translateX: -width * 0.1 }],
  },
  penaltyDotBottom: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    bottom: "70%",
    left: "50%",
    transform: [{ translateX: -3 }],
  },
  playerPosition: {
    position: "absolute",
    width: 40,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateX: -20 }, { translateY: -30 }],
  },
  emptyPosition: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  playerAssigned: {
    alignItems: "center",
  },
  playerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#222",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  playerNumber: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  playerName: {
    color: "#fff",
    fontSize: 10,
    marginTop: 2,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: "hidden",
    maxWidth: 60,
    textAlign: "center",
  },
  substitutesContainer: {
    backgroundColor: "#222",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  substitutesTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  substitutesList: {
    flexDirection: "row",
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
    backgroundColor: "#333",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#666",
  },
  substituteNumber: {
    color: "#fff",
    fontWeight: "bold",
  },
  substituteName: {
    color: "#ccc",
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
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
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
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  playerItemCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  playerItemNumber: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  playerItemInfo: {
    flex: 1,
  },
  playerItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  playerItemPosition: {
    fontSize: 14,
    color: "#666",
  },
  emptyListContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyListText: {
    color: "#666",
    fontSize: 16,
  },
});