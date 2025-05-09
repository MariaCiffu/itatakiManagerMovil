// src/components/FootballField.js
import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get("window");
const FIELD_RATIO = 0.65; // Proporción del campo respecto a la altura de la pantalla

const FootballField = ({ children }) => {
  return (
    <View style={styles.fieldContainer}>
      {/* Usamos una imagen para el campo en lugar de dibujarlo */}
      <Image 
        source={require('../assets/campo.png')} 
        style={styles.fieldImage}
        resizeMode="stretch"
      />
      {/* Renderizamos los jugadores encima de la imagen */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    width: width - 32,
    height: height * FIELD_RATIO,
    position: 'relative',
    alignSelf: 'center',
  },
  fieldImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
});

export default FootballField;