import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../../constants/colors";
import {
  getAllJugadores,
  deleteJugador,
} from "../../services/jugadoresService";
import { useSwipeableManager } from "../../hooks/useSwipeableManager"; // Import the hook
import { Search, Plus } from "react-native-feather";
import BackButton from "../../components/BackButton";
import PlayerCard from "../../components/jugadores/PlayerCard";

export default function Jugadores() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Instantiate the hook
  const { handleSwipeableOpen, closeCurrentSwipeable } = useSwipeableManager();

  // Función optimizada para cargar jugadores
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
  }, []); // loadPlayers has no dependencies on hook functions

  // Usar useFocusEffect para recargar los datos cuando la pantalla vuelve a estar en foco
  useFocusEffect(
    useCallback(() => {
      loadPlayers();
      // Al entrar en foco, cerrar cualquier swipeable que pudiera haber quedado abierto
      // de otra pantalla o por alguna razón no controlada.
      closeCurrentSwipeable(); 
      return () => {
        // Limpieza si es necesaria, por ejemplo, cerrar al salir del foco
        closeCurrentSwipeable();
      };
    }, [loadPlayers, closeCurrentSwipeable]) // Added closeCurrentSwipeable
  );

  // Filtrado de jugadores
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

  // Función optimizada para añadir jugador
  const handleAddPlayer = useCallback(() => {
    closeCurrentSwipeable();
    router.push("/jugadores/add-player");
  }, [closeCurrentSwipeable, router]);

  // Función optimizada para manejar el press en un jugador
  const handlePlayerPress = useCallback((player) => {
    closeCurrentSwipeable();
    router.push({
      pathname: `/jugadores/${player.id}`,
      params: { id: player.id },
    });
  }, [closeCurrentSwipeable, router]);

  // Función optimizada para eliminar jugador
  const handleDeletePlayer = useCallback((playerId) => {
    Alert.alert(
      "Eliminar jugador",
      "¿Estás seguro de que quieres eliminar este jugador?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: closeCurrentSwipeable, // Use hook's function
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteJugador(playerId);
              if (result.success) {
                setPlayers((prevPlayers) =>
                  prevPlayers.filter((player) => player.id !== playerId)
                );
                closeCurrentSwipeable(); // Ensure closed if the deleted item was open
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
  }, [closeCurrentSwipeable, players]); // Updated dependency

  // Renderizado optimizado de elementos
  const renderPlayer = useCallback(({ item }) => {
    return (
      <PlayerCard
        player={item}
        onPress={() => handlePlayerPress(item)}
        onDelete={() => handleDeletePlayer(item.id)}
        // Pass the hook's function to PlayerCard
        // PlayerCard will need to call this with its swipeable ref when it opens
        onSwipeableOpenManager={handleSwipeableOpen}
      />
    );
  }, [handlePlayerPress, handleDeletePlayer, handleSwipeableOpen]); // Add handleSwipeableOpen to dependencies

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.title}>Jugadores</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
          <Search width={20} height={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar jugador..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={closeCurrentSwipeable} // Use hook's function
          />
          </View>

          <TouchableOpacity
          style={[styles.addButton, { backgroundColor: COLORS.primary }]}
          onPress={handleAddPlayer}
          activeOpacity={0.7}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
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
            onScrollBeginDrag={closeCurrentSwipeable} // Use hook's function
            onTouchStart={closeCurrentSwipeable} // Use hook's function
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay jugadores</Text>
              </View>
            }
          />
        )}
      </View>
    </GestureHandlerRootView>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
  },
  searchContainer: {
     flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 10,
    marginLeft: 8,
  },
  playersList: {
    paddingBottom: 20,
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});