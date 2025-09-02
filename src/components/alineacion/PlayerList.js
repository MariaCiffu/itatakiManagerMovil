import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";

const PlayerList = ({ players, onSelectPlayer, onAddNewPlayer }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Botón para añadir nuevo jugador */}
      <TouchableOpacity
        style={styles.addNewPlayerButton}
        onPress={onAddNewPlayer}
        accessible={true}
        accessibilityLabel="Crear jugador temporal"
        accessibilityRole="button"
      >
        <View style={styles.addPlayerCircle}>
          <Ionicons name="add" size={20} color={MODERN_COLORS.primary} />
        </View>
        <View style={styles.playerInfo}>
          <Text style={styles.addPlayerText}>Crear jugador temporal</Text>
          <Text style={styles.addPlayerSubtext}>
            Para este partido únicamente
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={MODERN_COLORS.textLight}
        />
      </TouchableOpacity>

      {/* Lista de jugadores */}
      {players.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="people-outline"
            size={48}
            color={MODERN_COLORS.textLight}
          />
          <Text style={styles.emptyTitle}>No hay jugadores disponibles</Text>
          <Text style={styles.emptyText}>
            Todos los jugadores están asignados o puedes crear uno temporal
          </Text>
        </View>
      ) : (
        players.map((player) => (
          <TouchableOpacity
            key={player.id}
            style={styles.playerItem}
            onPress={() => onSelectPlayer(player)}
            accessible={true}
            accessibilityLabel={`Seleccionar ${player.name}`}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.playerCircle,
                player.isTemporary && styles.temporaryPlayerCircle,
              ]}
            >
              <Text style={styles.playerNumber}>{player.number}</Text>
            </View>
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerPosition}>
                {player.position}
                {player.isTemporary && " • Temporal"}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={MODERN_COLORS.textLight}
            />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 400,
  },

  // Botón añadir jugador
  addNewPlayerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
    backgroundColor: `${MODERN_COLORS.accent}05`,
  },

  addPlayerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${MODERN_COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: `${MODERN_COLORS.primary}30`,
    borderStyle: "dashed",
  },

  playerInfo: {
    flex: 1,
    marginLeft: 16,
  },

  addPlayerText: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    letterSpacing: 0.1,
  },

  addPlayerSubtext: {
    fontSize: 13,
    color: MODERN_COLORS.textGray,
    marginTop: 2,
    fontWeight: "500",
  },

  // Items de jugadores
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
    backgroundColor: MODERN_COLORS.surface,
  },

  playerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: MODERN_COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  temporaryPlayerCircle: {
    borderColor: MODERN_COLORS.accent,
    backgroundColor: `${MODERN_COLORS.accent}10`,
  },

  playerNumber: {
    fontWeight: "700",
    fontSize: 16,
    color: MODERN_COLORS.textDark,
  },

  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    letterSpacing: 0.1,
  },

  playerPosition: {
    fontSize: 13,
    color: MODERN_COLORS.textGray,
    marginTop: 2,
    fontWeight: "500",
  },

  // Estado vacío
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginTop: 16,
    textAlign: "center",
    letterSpacing: -0.2,
  },

  emptyText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
});

export default PlayerList;
