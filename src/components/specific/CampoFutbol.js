// src/components/specific/CampoFutbol.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CampoFutbol = ({ 
  formacion, 
  jugadoresSeleccionados, 
  onPosicionPress 
}) => {
  return (
    <View style={styles.campo}>
      {/* Líneas del campo */}
      <View style={styles.lineaMediaCampo} />
      <View style={styles.circuloCentral} />
      <View style={styles.areaGrande} />
      <View style={styles.areaChica} />
      <View style={styles.puntoMedioCampo} />
      
      {/* Posiciones de jugadores */}
      {formacion.posiciones.map(posicion => (
        <TouchableOpacity
          key={posicion.id}
          style={[
            styles.posicionJugador,
            {
              left: `${posicion.x * 100}%`,
              top: `${posicion.y * 100}%`,
              backgroundColor: jugadoresSeleccionados[posicion.id] ? '#4CAF50' : 'rgba(0,0,0,0.5)'
            }
          ]}
          onPress={() => onPosicionPress(posicion)}
        >
          {jugadoresSeleccionados[posicion.id] ? (
            <View style={styles.jugadorSeleccionado}>
              <Text style={styles.numeroJugador}>
                {jugadoresSeleccionados[posicion.id].numero}
              </Text>
              <Text style={styles.nombreJugador} numberOfLines={1}>
                {jugadoresSeleccionados[posicion.id].nombre.split(' ')[0]}
              </Text>
            </View>
          ) : (
            <Ionicons name="add" size={24} color="white" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  campo: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
  },
  lineaMediaCampo: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: 'white',
    top: '50%',
  },
  circuloCentral: {
    position: 'absolute',
    width: '30%',
    height: '15%',
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    top: '42.5%',
    left: '35%',
  },
  areaGrande: {
    position: 'absolute',
    width: '60%',
    height: '20%',
    borderWidth: 2,
    borderColor: 'white',
    top: 0,
    left: '20%',
  },
  areaChica: {
    position: 'absolute',
    width: '30%',
    height: '10%',
    borderWidth: 2,
    borderColor: 'white',
    top: 0,
    left: '35%',
  },
  puntoMedioCampo: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    top: '50%',
    left: '50%',
    marginLeft: -4,
    marginTop: -4,
  },
  posicionJugador: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -30,
    marginTop: -30,
    borderWidth: 2,
    borderColor: 'white',
  },
  jugadorSeleccionado: {
    alignItems: 'center',
  },
  numeroJugador: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  nombreJugador: {
    color: 'white',
    fontSize: 12,
    maxWidth: 56,
    textAlign: 'center',
  },
});

export default CampoFutbol;