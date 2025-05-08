// app/jugadores/add-multa.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors';

export default function AddMulta() {
  const router = useRouter();
  const [multa, setMulta] = useState({
    motivo: '',
    importe: '',
    fecha: '',
    pagado: false
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (field, value) => {
    setMulta({ ...multa, [field]: value });
    // Limpiar error cuando se modifica el campo
    if (formErrors[field]) {
      setFormErrors({...formErrors, [field]: null});
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const dateStr = `${day}/${month}/${year}`;
      handleChange('fecha', dateStr);
    }
  };

  const togglePagado = () => {
    setMulta({ ...multa, pagado: !multa.pagado });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!multa.motivo.trim()) {
      errors.motivo = 'El motivo es obligatorio';
    }
    
    if (!multa.importe.trim()) {
      errors.importe = 'El importe es obligatorio';
    } else if (isNaN(Number(multa.importe))) {
      errors.importe = 'El importe debe ser un número';
    }
    
    if (!multa.fecha.trim()) {
      errors.fecha = 'La fecha es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      // Mostrar alerta con el primer error
      const firstError = Object.values(formErrors)[0];
      Alert.alert('Campos incompletos', firstError || 'Por favor completa todos los campos obligatorios.');
      return;
    }
    
    console.log('Multa guardada:', multa);
    
    // Aquí iría la lógica para guardar la multa en la base de datos
    
    // Mostrar confirmación y volver a la pantalla anterior
    Alert.alert(
      'Multa registrada',
      'La multa ha sido registrada correctamente',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nueva multa</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        {/* Motivo */}
        <View style={[styles.inputContainer, formErrors.motivo ? styles.inputError : null]}>
          <FontAwesome5 name="file-alt" size={20} color={formErrors.motivo ? COLORS.danger : COLORS.primary} />
          <TextInput
            placeholder="Motivo de la multa *"
            placeholderTextColor={COLORS.textSecondary}
            value={multa.motivo}
            onChangeText={(text) => handleChange('motivo', text)}
            style={styles.input}
            multiline={true}
            numberOfLines={2}
          />
        </View>

        {/* Importe */}
        <View style={[styles.inputContainer, formErrors.importe ? styles.inputError : null]}>
          <FontAwesome5 name="euro-sign" size={20} color={formErrors.importe ? COLORS.danger : COLORS.primary} />
          <TextInput
            placeholder="Importe (€) *"
            placeholderTextColor={COLORS.textSecondary}
            value={multa.importe}
            onChangeText={(text) => handleChange('importe', text)}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        {/* Fecha */}
        <TouchableOpacity 
          style={[styles.inputContainer, formErrors.fecha ? styles.inputError : null]}
          onPress={() => setShowDatePicker(true)}
        >
          <FontAwesome5 name="calendar-alt" size={20} color={formErrors.fecha ? COLORS.danger : COLORS.primary} />
          <Text style={multa.fecha ? styles.input : styles.inputPlaceholder}>
            {multa.fecha || 'Fecha *'}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}

        {/* Estado de pago */}
        <TouchableOpacity 
          style={styles.switchContainer}
          onPress={togglePagado}
        >
          <View style={[
            styles.switchTrack, 
            { backgroundColor: multa.pagado ? `${COLORS.success}40` : `${COLORS.textSecondary}40` }
          ]}>
            <View style={[
              styles.switchThumb, 
              { 
                backgroundColor: multa.pagado ? COLORS.success : COLORS.textSecondary,
                transform: [{ translateX: multa.pagado ? 24 : 0 }]
              }
            ]}>
              {multa.pagado && <FontAwesome5 name="check" size={12} color="#fff" />}
            </View>
          </View>
          <Text style={styles.switchLabel}>
            {multa.pagado ? 'Pagada' : 'Pendiente de pago'}
          </Text>
        </TouchableOpacity>

        {/* Botón guardar */}
        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.saveButton}
          >
            <FontAwesome5 name="check" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar multa</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  form: {
    gap: 16,
    paddingBottom: 24
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  inputPlaceholder: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 8,
  },
  switchTrack: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 3,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchLabel: {
    color: COLORS.text,
    fontSize: 16,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});