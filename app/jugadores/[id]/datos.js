import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PlayerContext } from '../../../context/PlayerContext';

import Icon from 'react-native-vector-icons/Foundation';

export default function DatosPersonales() {
  const player = useContext(PlayerContext);

  const renderDataCard = (icon, title, value, color) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={25} color={color} />
      </View>
      <View style={styles.dataContent}>
        <Text style={styles.dataLabel}>{title}</Text>
        <Text style={styles.dataValue}>{value || '-'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <View style={styles.headerIndicator} />
        <Text style={styles.title}>Datos personales</Text>
      </View>

      <View style={styles.cardsContainer}>
        {renderDataCard('calendar', 'Fecha de nacimiento', player.date, '#FF5A5F')}
        {renderDataCard('foot', 'Pie dominante', player.foot, '#FFB400')}
        {renderDataCard('telephone', 'Móvil', player.phone, '#0084FF')}
        {renderDataCard('mail', 'Correo', null, '#A463F2')}
        {renderDataCard('torsos', 'Datos contacto', null, '#00C781')}
        {renderDataCard('telephone', 'Móvil contacto', '72kg', '#0084FF')} 
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerIndicator: {
    width: 4,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#A463F2',
    marginRight: 12,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dataContent: {
    flex: 1,
  },
  dataLabel: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 4,
  },
  dataValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});