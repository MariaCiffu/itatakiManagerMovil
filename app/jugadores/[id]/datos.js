// app/jugadores/[id]/datos.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PlayerContext } from '../../../context/PlayerContext';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  CalendarIcon, 
  FootIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  UserFriendsIcon 
} from '../../../components/Icons';
import { COLORS } from '../../../constants/colors';

export default function DatosPersonales() {
  const player = useContext(PlayerContext);

  const renderDataCard = (Icon, title, value, color) => (
    <View style={styles.card}>
      <LinearGradient
        colors={[COLORS.card, '#252525']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <Icon size={20} color={color} />
          </View>
          <View style={styles.dataContent}>
            <Text style={styles.dataLabel}>{title}</Text>
            <Text style={styles.dataValue}>{value || '-'}</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerContainer}>
        <View style={[styles.headerIndicator, { backgroundColor: COLORS.primary }]} />
        <Text style={styles.title}>Datos personales</Text>
      </View>

      <View style={styles.cardsContainer}>
        {renderDataCard(CalendarIcon, 'Fecha de nacimiento', player.date, COLORS.danger)}
        {renderDataCard(FootIcon, 'Pie dominante', player.foot, COLORS.warning)}
        {renderDataCard(PhoneIcon, 'Móvil', player.phone, COLORS.info)}
        {renderDataCard(EnvelopeIcon, 'Correo', player.email || null, COLORS.primary)}
        {renderDataCard(UserFriendsIcon, 'Nombre contacto', player.contactName || null, COLORS.success)}
        {renderDataCard(PhoneIcon, 'Móvil contacto', player.contactPhone || null, COLORS.info)} 
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    marginRight: 12,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: 'bold',
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 16,
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
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  dataValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '500',
  },
});