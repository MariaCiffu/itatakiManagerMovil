// src/components/alineacion/FootballField.js
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get("window");

const FootballField = ({ children, style }) => {
  return (
    <View style={[styles.fieldContainer, style]}>
      {/* Usamos una imagen para el campo en lugar de dibujarlo */}
      <Image 
        source={require('../../assets/campo.png')} 
        style={styles.fieldImage}
        resizeMode="cover"
      />
      {/* Renderizamos los jugadores encima de la imagen */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    width: width - 32,
    aspectRatio: 3/4, // Proporción más adecuada para un campo de fútbol
    position: 'relative',
    alignSelf: 'center',
    marginVertical: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fieldImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});

export default FootballField;