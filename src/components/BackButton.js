// components/BackButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { ArrowLeftIcon } from './Icons';
import { COLORS } from '../constants/colors';

const BackButton = ({ style, color = COLORS.text }) => {
  const router = useRouter();
  const pathname = usePathname();
  
  const handlePress = () => {
    // Si estamos en la vista detallada de un jugador (jugadores/[id]/*)
    if (pathname.match(/^\/jugadores\/[^\/]+\/.+/)) {
      // Navegar a la lista de jugadores
      router.push('/jugadores');
    } 
    // Si estamos en la lista de jugadores (jugadores/index)
    else if (pathname === '/jugadores' || pathname === '/jugadores/index') {
      // Navegar a la página principal
      router.push('/');
    } 
    // Para cualquier otra ruta
    else {
      router.back();
    }
  };
  
  return (
    <TouchableOpacity 
      style={[styles.backButton, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <ArrowLeftIcon size={24} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackButton;