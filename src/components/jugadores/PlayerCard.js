// components/PlayerCard.js
import React, { memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { Trash2 } from "react-native-feather";
import { COLORS } from "../../constants/colors";

const PlayerCard = memo(function PlayerCard({ player, onPress, onDelete, swipeableRef }) {
  return (
    <View style={styles.playerCardContainer}>
      <Swipeable
        ref={ref => {
          if (swipeableRef) {
            swipeableRef(ref, player.id);
          }
        }}
        renderRightActions={() => (
          <View style={styles.rightActionContainer}>
            <TouchableOpacity
              style={styles.deleteAction}
              onPress={onDelete}
            >
              <Trash2 width={24} height={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      >
        <TouchableOpacity
          style={styles.playerCard}
          activeOpacity={0.8}
          onPress={onPress}
          accessibilityLabel={`Jugador ${player.name}, dorsal ${player.number}`}
        >
          <LinearGradient
            colors={[COLORS.card, "#252525"]}
            style={styles.cardGradient}
          >
            <View style={styles.playerInfo}>
              <Image
                source={{
                  uri: player.image || "https://randomuser.me/api/portraits/lego/1.jpg",
                }}
                style={styles.playerImage}
              />
              <View style={styles.playerDetails}>
                <Text style={styles.playerName}>{player.name}</Text>
                <Text style={styles.playerPosition}>
                  {player.position || "Sin posición"}
                </Text>
              </View>
              {player.number && (
                <View style={styles.numberContainer}>
                  <Text style={styles.playerNumber}>{player.number}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Swipeable>
    </View>
  );
});

const styles = StyleSheet.create({
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
});

export default PlayerCard;