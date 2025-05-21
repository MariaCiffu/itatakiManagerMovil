// components/alineacion/ErrorMessage.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const ErrorMessage = ({ message, onDismiss, style }) => {
  return (
    <Animated.View style={[styles.errorContainer, style]}>
      <Text style={styles.errorText}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity 
          onPress={onDismiss}
          accessible={true}
          accessibilityLabel="Cerrar mensaje de error"
          accessibilityRole="button"
        >
          <Ionicons name="close-circle" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
  errorText: {
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
});

export default React.memo(ErrorMessage);