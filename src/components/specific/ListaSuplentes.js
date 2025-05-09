// src/components/specific/ListaSuplentes.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ListaSuplentes = ({ 
  suplentes, 
  onAgregarSuplente, 
  onEliminarSuplente 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Suplentes:</Text>
        <TouchableOpacity 
          style={styles.agregarButton}
          onPress={onAgregarSuplente}
        >
          <Ionicons name="add-circle" size={24} color="#4CAF50" />
          <Text style={styles.agregarText}>Añadir</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.lista}>
        {suplentes.length === 0 ? (
          <Text style={styles.noSuplentesText}>No hay suplentes seleccionados</Text>
        ) : (
          suplentes.map(suplente => (
            <View key={suplente.id} style={styles.suplenteItem}>
              <View style={styles.suplenteInfo}>
                <View style={styles.suplenteNumero}>
                  <Text style={styles.suplenteNumeroText}>{suplente.numero}</Text>
                </View>
                <Text style={styles.suplenteNombre}>{suplente.nombre}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => onEliminarSuplente(suplente.id)}
                style={styles.eliminarButton}
              >
                <Ionicons name="close-circle" size={24} color="#FF5252" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  agregarButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agregarText: {
    color: '#4CAF50',
    marginLeft: 4,
  },
  lista: {
    marginTop: 8,
  },
  noSuplentesText: {
    color: '#888',
    textAlign: 'center',
    padding: 16,
  },
  suplenteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  suplenteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suplenteNumero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  suplenteNumeroText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suplenteNombre: {
    color: 'white',
    fontSize: 16,
  },
  eliminarButton: {
    padding: 4,
  },
});

export default ListaSuplentes;