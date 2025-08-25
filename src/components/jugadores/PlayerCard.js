import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";

export default function PlayerCard({
  player,
  onPress,
  onDelete,
  onSwipeableOpenManager,
}) {
  const swipeableRef = useRef(null);

  // Función para renderizar acciones de swipe
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 25, 100],
      extrapolate: "clamp",
    });

    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <View style={styles.deleteActionContainer}>
        <Animated.View
          style={[
            styles.deleteAction,
            { transform: [{ translateX: trans }, { scale }] },
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trash-outline"
              size={24}
              color={MODERN_COLORS.textWhite}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  // Manejar apertura del swipeable
  const handleSwipeableOpen = () => {
    if (onSwipeableOpenManager) {
      onSwipeableOpenManager(swipeableRef);
    }
  };

  // 🆕 Usar los nuevos datos que vienen del index.js modificado
  const pendingCount = player.multasPendientes || 0;
  const totalPendingAmount = player.totalDeuda || 0;
  const totalMultas = player.totalMultas || 0;

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      onSwipeableOpen={handleSwipeableOpen}
      rightThreshold={30}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.95}
      >
        {/* Avatar y número */}
        <View style={styles.avatarContainer}>
          {player.image ? (
            <Image source={{ uri: player.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {player.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          {/* Número del jugador */}
          <View style={styles.playerNumber}>
            <Text style={styles.playerNumberText}>{player.number}</Text>
          </View>
        </View>

        {/* Información principal */}
        <View style={styles.playerInfo}>
          <Text style={styles.playerName} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.playerPosition}>{player.position}</Text>
        </View>

        {/* Estado y estadísticas */}
        <View style={styles.playerStats}>
          {/* 🎯 Solo mostrar warning si tiene multas pendientes */}
          {pendingCount > 0 && (
            <View style={styles.finesContainer}>
              <View style={styles.finesBadge}>
                <Ionicons
                  name="warning"
                  size={14}
                  color={MODERN_COLORS.danger}
                />
                <Text
                  style={[styles.finesText, { color: MODERN_COLORS.danger }]}
                >
                  {totalPendingAmount}€
                </Text>
              </View>
              <Text style={styles.pendingText}>
                {pendingCount} pendiente{pendingCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {/* Chevron */}
          <Ionicons
            name="chevron-forward"
            size={20}
            color={MODERN_COLORS.textLight}
          />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // AVATAR
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
  },

  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 20,
    fontWeight: "700",
  },

  playerNumber: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: MODERN_COLORS.accent,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: MODERN_COLORS.surface,
  },

  playerNumberText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 11,
    fontWeight: "700",
  },

  // INFORMACIÓN
  playerInfo: {
    flex: 1,
  },

  playerName: {
    fontSize: 17,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 4,
  },

  playerPosition: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  // ESTADÍSTICAS
  playerStats: {
    alignItems: "flex-end",
    gap: 8,
  },

  finesContainer: {
    alignItems: "flex-end",
  },

  finesBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },

  finesText: {
    fontSize: 13,
    fontWeight: "600",
  },

  pendingText: {
    fontSize: 11,
    color: MODERN_COLORS.textGray,
    marginTop: 2,
  },

  statusOk: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // ACCIONES DE SWIPE MEJORADAS
  deleteActionContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
  },

  deleteAction: {
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },

  deleteButton: {
    backgroundColor: MODERN_COLORS.danger,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
