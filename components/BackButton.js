// components/BackButton.js
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeftIcon } from './Icons';
import { COLORS } from '../constants/colors';

const BackButton = ({ style, color = COLORS.text }) => {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      style={[styles.backButton, style]} 
      onPress={() => router.back()}
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