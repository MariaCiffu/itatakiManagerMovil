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
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../../constants/colors";
import {
  getAllJugadores,
  deleteJugador,
} from "../../services/jugadoresService";
import { Search, Plus, Trash2 } from "react-native-feather";
import BackButton from "../../components/BackButton";

export default function Jugadores() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Referencia para el swipeable actualmente abierto
  const openSwipeableRef = useRef(null);
  
  // Mapa de referencias para todos los swipeables
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
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
    router.push("/jugadores/add-player");
  };

  const handlePlayerPress = (player) => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
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
            if (openSwipeableRef.current) {
              openSwipeableRef.current.close();
              openSwipeableRef.current = null;
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
                setPlayers((prevPlayers) =>
                  prevPlayers.filter((player) => player.id !== playerId)
                );
                openSwipeableRef.current = null;
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

  // Función para cerrar todos los swipeables excepto el actual
  const closeOtherSwipeables = useCallback((currentRef) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== currentRef) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = currentRef;
  }, []);

  const renderRightActions = (playerId) => {
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeletePlayer(playerId)}
        >
          <Trash2 width={24} height={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderPlayer = ({ item }) => {
    return (
      <View style={styles.playerCardContainer}>
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current[item.id] = ref;
            } else {
              delete swipeableRefs.current[item.id];
            }
          }}
          renderRightActions={() => renderRightActions(item.id)}
          onSwipeableOpen={() => {
            closeOtherSwipeables(swipeableRefs.current[item.id]);
          }}
          friction={0.8}
          overshootFriction={8}
          rightThreshold={40}
          useNativeAnimations={true}
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
      </View>
    );
  };

  // Función para cerrar el swipeable abierto
  const closeOpenSwipeable = useCallback(() => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
  }, []);

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
            onFocus={closeOpenSwipeable}
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
            onScrollBeginDrag={closeOpenSwipeable}
            onTouchStart={closeOpenSwipeable}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
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
  playerCardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  playerCard: {
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
    backgroundColor: COLORS.card,
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
  rightActionContainer: {
    width: 80,
    height: "100%",
  },
  deleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
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
  addButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
});