// components/ToggleSwitch.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const ToggleSwitch = ({ options, selectedValue, onValueChange, label, primaryColor }) => {
  return (
    <View style={styles.container}>
      {/* Mostrar el label si es necesario */}
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.toggleContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.toggleButton,
              selectedValue === option && [styles.toggleSelected, { backgroundColor: primaryColor || COLORS.primary }],
            ]}
            onPress={() => onValueChange(option)}
          >
            <Text style={styles.toggleText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  toggleSelected: {
    // El color se pasa como prop o se usa el color primario por defecto
  },
  toggleText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ToggleSwitch;