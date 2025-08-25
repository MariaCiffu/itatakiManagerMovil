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
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";
import {
  getAllJugadoresWithMultas,
  deleteJugador,
} from "../../services/playersService";
import { useSwipeableManager } from "../../hooks/useSwipeableManager";
import PlayerCard from "../../components/jugadores/PlayerCard";

export default function Jugadores() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 🔧 Hook corregido para gestión de swipeables
  const { handleSwipeableOpen, closeCurrentSwipeable } = useSwipeableManager();

  // 🔥 FUNCIÓN OPTIMIZADA PARA CARGAR JUGADORES
  const loadPlayers = useCallback(async () => {
    try {
      const data = await getAllJugadoresWithMultas();
      setPlayers(data);
      setFilteredPlayers(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error al cargar jugadores:", error);
      setIsLoading(false);
      Alert.alert("Error", "No se pudieron cargar los jugadores");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlayers();
      closeCurrentSwipeable();
      return () => {
        closeCurrentSwipeable();
      };
    }, [loadPlayers, closeCurrentSwipeable])
  );

  // 🔥 FILTRADO MEJORADO
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPlayers(players);
    } else {
      const filtered = players.filter(
        (player) =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (player.number && player.number.toString().includes(searchQuery)) ||
          (player.position &&
            player.position.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, players]);

  const handleAddPlayer = useCallback(() => {
    closeCurrentSwipeable();
    router.push("/jugadores/add-player");
  }, [closeCurrentSwipeable, router]);

  const handlePlayerPress = useCallback(
    (player) => {
      closeCurrentSwipeable();
      router.push({
        pathname: `/jugadores/${player.id}`,
        params: { id: player.id },
      });
    },
    [closeCurrentSwipeable, router]
  );

  const handleDeletePlayer = useCallback(
    (playerId) => {
      Alert.alert(
        "Eliminar jugador",
        "¿Estás seguro de que quieres eliminar este jugador?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: closeCurrentSwipeable,
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
                  closeCurrentSwipeable();
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
    },
    [closeCurrentSwipeable]
  );

  const renderPlayer = useCallback(
    ({ item }) => {
      return (
        <PlayerCard
          player={item}
          onPress={() => handlePlayerPress(item)}
          onDelete={() => handleDeletePlayer(item.id)}
          onSwipeableOpenManager={handleSwipeableOpen}
        />
      );
    },
    [handlePlayerPress, handleDeletePlayer, handleSwipeableOpen]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* 🎨 HEADER MODERNO */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.push("/")}
            style={styles.backButton}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={MODERN_COLORS.textDark}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>Jugadores</Text>
          </View>

          {/* Espacio vacío para centrar el título */}
          <View style={{ width: 40 }} />
        </View>

        {/* 🎨 BÚSQUEDA MEJORADA */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={MODERN_COLORS.textGray}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre, dorsal o posición"
              placeholderTextColor={MODERN_COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={closeCurrentSwipeable}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={MODERN_COLORS.textGray}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 🎨 LISTA DE JUGADORES */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
            <Text style={styles.loadingText}>Cargando jugadores...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.id}
            renderItem={renderPlayer}
            contentContainerStyle={styles.playersList}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={closeCurrentSwipeable}
            onTouchStart={closeCurrentSwipeable}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="people-outline"
                  size={64}
                  color={MODERN_COLORS.textLight}
                />
                <Text style={styles.emptyTitle}>No hay jugadores</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? "No se encontraron resultados"
                    : "Añade tu primer jugador"}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleAddPlayer}
                  >
                    <Text style={styles.emptyButtonText}>Añadir jugador</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        )}

        {/* 🎨 BOTÓN FLOTANTE MEJORADO */}
        {!isLoading && players.length > 0 && (
          <TouchableOpacity
            style={styles.fab}
            onPress={handleAddPlayer}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color={MODERN_COLORS.textWhite} />
          </TouchableOpacity>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // 🎨 HEADER MODERNO
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
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

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  // 🎨 BÚSQUEDA
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  // LISTA
  playersList: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Espacio para el FAB
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  // ESTADO VACÍO MEJORADO
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginTop: 16,
  },

  emptySubtitle: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    textAlign: "center",
    marginBottom: 24,
  },

  emptyButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  emptyButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },

  // 🎨 FAB MEJORADO
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
