"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Swipeable } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native"; // Importar useFocusEffect
import { COLORS } from "../../constants/colors";
import {
  getAllJugadores,
  deleteJugador,
} from "../../services/jugadoresService";
import { Search, Plus, Trash2, ArrowLeft } from "react-native-feather";

export default function Jugadores() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Usar un objeto para almacenar las referencias
  const swipeableRefs = useRef({});

  const loadPlayers = useCallback(async () => {
    try {
      const data = await getAllJugadores();
      setPlayers(data);
      setFilteredPlayers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar jugadores:", error);
      setIsLoading(false);
      Alert.alert("Error", "No se pudieron cargar los jugadores");
    }
  }, []);

  // Usar useFocusEffect para recargar los datos cuando la pantalla vuelve a estar en foco
  useFocusEffect(
    useCallback(() => {
      loadPlayers();
      return () => {
        // Limpieza si es necesaria
      };
    }, [loadPlayers])
  );

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(
        (player) =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (player.number && player.number.toString().includes(searchQuery))
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

  const handleAddPlayer = () => {
    router.push("/jugadores/add-player");
  };

  const handlePlayerPress = (player) => {
    router.push({
      pathname: `/jugadores/${player.id}`,
      params: { id: player.id },
    });
  };

  const handleDeletePlayer = (playerId) => {
    Alert.alert(
      "Eliminar jugador",
      "¿Estás seguro de que quieres eliminar este jugador?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => {
            // Verificar si la referencia existe y tiene el método close
            const swipeableRef = swipeableRefs.current[playerId];
            if (swipeableRef && typeof swipeableRef.close === "function") {
              swipeableRef.close();
            }
          },
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteJugador(playerId);
              if (result.success) {
                // Actualizar la lista de jugadores
                setPlayers((prevPlayers) =>
                  prevPlayers.filter((player) => player.id !== playerId)
                );
                Alert.alert("Éxito", "Jugador eliminado correctamente");
              } else {
                Alert.alert(
                  "Error",
                  result.message || "No se pudo eliminar el jugador"
                );
              }
            } catch (error) {
              console.error("Error al eliminar jugador:", error);
              Alert.alert("Error", "Ocurrió un error al eliminar el jugador");
            }
          },
        },
      ]
    );
  };

  const renderRightActions = (playerId) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDeletePlayer(playerId)}
      >
        <Trash2 width={24} height={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  const renderPlayer = ({ item }) => {
    return (
      <Swipeable
        ref={(ref) => {
          // Solo guardar la referencia si no es null
          if (ref) {
            swipeableRefs.current[item.id] = ref;
          }
        }}
        renderRightActions={() => renderRightActions(item.id)}
        overshootRight={false}
        friction={2}
        rightThreshold={40}
      >
        <TouchableOpacity
          style={styles.playerCard}
          activeOpacity={0.8}
          onPress={() => handlePlayerPress(item)}
        >
          <LinearGradient
            colors={[COLORS.card, "#252525"]}
            style={styles.cardGradient}
          >
            <View style={styles.playerInfo}>
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://randomuser.me/api/portraits/lego/1.jpg",
                }}
                style={styles.playerImage}
              />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{item.name}</Text>
                <Text style={styles.playerPosition}>
                  {item.position || "Sin posición"}
                </Text>
              </View>
              {item.number && (
                <View style={styles.numberContainer}>
                  <Text style={styles.playerNumber}>{item.number}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Botón de volver atrás */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft width={24} height={24} color={COLORS.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Jugadores</Text>

        {/* Espacio vacío para mantener el título centrado */}
        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <Search width={20} height={20} color={COLORS.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar jugador..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayer}
          contentContainerStyle={styles.playersList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay jugadores</Text>
            </View>
          }
        />
      )}

      {/* Botón flotante para añadir jugador */}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        onPress={handleAddPlayer}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          style={styles.addButtonGradient}
        >
          <Plus width={24} height={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: COLORS.text,
    marginLeft: 8,
  },
  playersList: {
    paddingBottom: 20,
  },
  playerCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.background,
  },
  cardGradient: {
    borderRadius: 12,
    padding: 1, // Borde gradiente
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 11,
    padding: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.card, // Color de fondo para cuando no hay imagen
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  playerPosition: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  numberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  deleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  // Estilos para el botón flotante
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  addButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});
