// Componente para el botón de WhatsApp
// components/WhatsAppButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet, Linking, Alert } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { COLORS } from '../constants/colors';

const WhatsAppButton = ({ phone, size = 24, color = '#25D366' }) => {
  const openWhatsApp = async () => {
    try {
      // Formatear número de teléfono (eliminar espacios y añadir prefijo si es necesario)
      let phoneNumber = phone.replace(/\s+/g, '');
      if (!phoneNumber.startsWith('+')) {
        phoneNumber = `+34${phoneNumber}`; // Añadir prefijo de España por defecto
      }
      
      const url = `whatsapp://send?phone=${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'WhatsApp no está instalado en este dispositivo.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir WhatsApp.');
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.button, { width: size + 16, height: size + 16 }]}
      onPress={openWhatsApp}
      activeOpacity={0.7}
    >
      <FontAwesome5 name="whatsapp" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WhatsAppButton;