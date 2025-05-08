// app/jugadores/[id]/multas.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Calendar, 
  Check, 
  Clock,
  Plus
} from 'react-native-feather';

export default function Multas() {
  // Datos de ejemplo con estado de pago
  const multas = [
    { 
      id: 1, 
      fecha: '04/03/2024', 
      motivo: 'Llegó tarde al entrenamiento', 
      importe: 10, 
      pagado: true 
    },
    { 
      id: 2, 
      fecha: '18/04/2024', 
      motivo: 'Falta sin avisar', 
      importe: 20, 
      pagado: false 
    },
    { 
      id: 3, 
      fecha: '25/04/2024', 
      motivo: 'Tarjeta amarilla evitable', 
      importe: 15, 
      pagado: true 
    },
    { 
      id: 4, 
      fecha: '02/05/2024', 
      motivo: 'No devolver material de entrenamiento', 
      importe: 5, 
      pagado: false 
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerIndicator} />
        <Text style={styles.title}>Multas</Text>
      </View>

      <ScrollView 
        style={styles.multasList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.multasListContent}
      >
        {multas.map((multa) => (
          <MultaCard key={multa.id} multa={multa} />
        ))}
      </ScrollView>

      {/* Botón flotante para añadir nueva multa */}
      <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
        <LinearGradient
          colors={['#A463F2', '#8B5CF6']}
          style={styles.addButtonGradient}
        >
          <Plus width={24} height={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Resumen de multas */}
      <View style={styles.summaryContainer}>
        <LinearGradient
          colors={['#1E1E1E', '#252525']}
          style={styles.summaryGradient}
        >
          <View style={styles.summaryContent}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total multas</Text>
              <Text style={styles.summaryValue}>4</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Importe total</Text>
              <Text style={styles.summaryValue}>50€</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Pendiente</Text>
              <Text style={[styles.summaryValue, { color: '#FF5A5F' }]}>25€</Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

function MultaCard({ multa }) {
  return (
    <View style={styles.cardContainer}>
      <LinearGradient
        colors={['#1E1E1E', '#252525']}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          {/* Indicador de estado de pago */}
          <View style={[
            styles.statusIndicator, 
            { backgroundColor: multa.pagado ? '#00C78120' : '#FF5A5F20' }
          ]}>
            {multa.pagado ? (
              <Check width={16} height={16} color="#00C781" />
            ) : (
              <Clock width={16} height={16} color="#FF5A5F" />
            )}
          </View>

          {/* Contenido principal */}
          <View style={styles.cardMain}>
            {/* Fecha y motivo */}
            <View style={styles.cardHeader}>
              <View style={styles.fechaContainer}>
                <Calendar width={14} height={14} color="#999" style={styles.fechaIcon} />
                <Text style={styles.fechaText}>{multa.fecha}</Text>
              </View>
              <Text style={styles.motivoText}>{multa.motivo}</Text>
            </View>

            {/* Importe y estado */}
            <View style={styles.cardFooter}>
              <View style={styles.importeContainer}>
                <Text style={styles.importeText}>{multa.importe}€</Text>
              </View>
              <Text style={[
                styles.estadoText, 
                { color: multa.pagado ? '#00C781' : '#FF5A5F' }
              ]}>
                {multa.pagado ? 'Pagado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIndicator: {
    width: 4,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#A463F2',
    marginRight: 12,
  },
  title: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  
  // Lista de multas
  multasList: {
    flex: 1,
  },
  multasListContent: {
    paddingBottom: 16,
  },
  
  // Tarjeta de multa
  cardContainer: {
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
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 16,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardMain: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginBottom: 8,
  },
  fechaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fechaIcon: {
    marginRight: 4,
  },
  fechaText: {
    color: '#999',
    fontSize: 12,
  },
  motivoText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  importeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  importeText: {
    color: '#FFB400',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  estadoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Botón para añadir
  addButton: {
    position: 'absolute',
    bottom: 90, // Ajustado para dejar espacio para el resumen
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Resumen de multas
  summaryContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  summaryGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
  },
  summaryContent: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 16,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  summaryLabel: {
    color: '#999',
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});