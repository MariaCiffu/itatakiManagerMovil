// app/jugadores/edit-field.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check } from 'react-native-feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/colors';
import ToggleSwitch from '../../components/ToggleSwitch';

export default function EditField() {
  const router = useRouter();
  const { playerData, field, currentValue, title } = useLocalSearchParams();
  const [value, setValue] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (playerData) {
      const parsedData = JSON.parse(playerData);
      setPlayer(parsedData);
      setValue(currentValue || '');
    }
  }, [playerData, currentValue]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const dateStr = `${day}-${month}-${year}`;
      setValue(dateStr);
    }
  };

  const handleFootChange = (newValue) => {
    setValue(newValue);
  };

  const handleSave = () => {
    if (!value && field !== 'email' && field !== 'contactName' && field !== 'contactPhone') {
      Alert.alert('Campo vacío', 'Por favor ingresa un valor para este campo.');
      return;
    }
    
    // Aquí actualizarías el campo específico en la base de datos
    console.log('Campo actualizado:', { field, value });
    
    // Mostrar confirmación y volver
    Alert.alert(
      'Campo actualizado',
      'El campo ha sido actualizado correctamente',
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const renderFieldInput = () => {
    switch (field) {
      case 'date':
        return (
          <>
            <TouchableOpacity 
              style={styles.inputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.input}>{value || 'Seleccionar fecha'}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={new Date()}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
              />
            )}
          </>
        );
      case 'foot':
        return (
          <ToggleSwitch
            label="Pie dominante"
            options={['Derecho', 'Izquierdo']}
            selectedValue={value}
            onValueChange={handleFootChange}
            primaryColor={COLORS.primary}
          />
        );
      case 'phone':
      case 'contactPhone':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              value={value}
              onChangeText={setValue}
              style={styles.input}
              keyboardType="phone-pad"
              placeholder="Ingresa el número de teléfono"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        );
      case 'email':
        return (
          <View style={styles.inputContainer}>
            <TextInput
              value={value}
              onChangeText={setValue}
              style={styles.input}
              keyboardType="email-address"
              placeholder="Ingresa el correo electrónico"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        );
      default:
        return (
          <View style={styles.inputContainer}>
            <TextInput
              value={value}
              onChangeText={setValue}
              style={styles.input}
              placeholder={`Ingresa ${title}`}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar {title}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {renderFieldInput()}

        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.saveButton}
          >
            <Check size={24} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
  content: {
    flex: 1,
    gap: 24,
  },
  inputContainer: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  input: {
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
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});