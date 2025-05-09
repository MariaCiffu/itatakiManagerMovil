// src/components/SubstitutesList.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const SubstitutesList = ({ substitutes, removeSubstitute, onAddSubstitute }) => {
  return (
    <View style={styles.substitutesContainer}>
      <Text style={styles.substitutesTitle}>Suplentes:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.substitutesList}
        contentContainerStyle={styles.substitutesContent}
      >
        {substitutes.map((player) => (
          <View key={player.id} style={styles.substituteItem}>
            <View style={styles.substituteCircle}>
              <Text style={styles.substituteNumber}>{player.number}</Text>
            </View>
            <Text style={styles.substituteName} numberOfLines={1}>
              {player.name.split(" ")[0]}
            </Text>
            <TouchableOpacity 
              style={styles.removeSubstituteButton} 
              onPress={() => removeSubstitute(player.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={16} color="#ff4d4d" />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity
          style={styles.addSubstituteButton}
          onPress={onAddSubstitute}
        >
          <Ionicons name="add-circle" size={24} color="#4CAF50" />
          <Text style={styles.addSubstituteText}>Añadir</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  substitutesContainer: {
    backgroundColor: "#222",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#333",
    // Aseguramos que tenga una altura fija para evitar que se corte
    height: 120,
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
  substitutesContent: {
    paddingRight: 20, // Añadimos padding para evitar que se corte el último elemento
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
    padding: 5, // Aumentamos el área táctil
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
});

export default SubstitutesList;