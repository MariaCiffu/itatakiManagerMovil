// components/PlayerList.jsx
import React from 'react';
import { FlatList, TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const PlayerList = ({ 
  players, 
  onSelectPlayer, 
  onAddNewPlayer, 
  colors,
  styles 
}) => {
  return (
    <FlatList
      data={players}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.playerItem, 
            { borderBottomColor: colors.modalBorder },
            item.isTemporary && { backgroundColor: `rgba(255, 165, 0, 0.1)` }
          ]}
          onPress={() => onSelectPlayer(item)}
        >
          <View style={[
            styles.playerItemCircle,
            item.isTemporary && { borderColor: colors.temporaryPlayer }
          ]}>
            <Text style={[styles.playerItemNumber, { color: colors.text }]}>{item.number}</Text>
          </View>
          <View style={styles.playerItemInfo}>
            <Text style={[styles.playerItemName, { color: colors.modalText }]}>
              {item.name}
              {item.isTemporary && " (Temporal)"}
            </Text>
            <Text style={[styles.playerItemPosition, { color: colors.textSecondary }]}>{item.position}</Text>
          </View>
        </TouchableOpacity>
      )}
      ListHeaderComponent={
        <TouchableOpacity
          style={[styles.addNewPlayerButton, { borderBottomColor: colors.modalBorder }]}
          onPress={onAddNewPlayer}
        >
          <Ionicons name="add-circle" size={24} color={colors.temporaryPlayer} />
          <Text style={[styles.addNewPlayerText, { color: colors.temporaryPlayer }]}>Añadir jugador nuevo</Text>
        </TouchableOpacity>
      }
      ListEmptyComponent={
        <View style={styles.emptyListContainer}>
          <Text style={[styles.emptyListText, { color: colors.textSecondary }]}>
            No hay jugadores disponibles
          </Text>
        </View>
      }
    />
  );
};

export default React.memo(PlayerList);