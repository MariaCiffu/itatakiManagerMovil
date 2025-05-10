// app/staff/add-member.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeftIcon, 
  UserFriendsIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  CameraIcon, 
  CheckIcon 
} from '../../components/Icons';
import { COLORS } from '../../constants/colors';
import { addStaffMember } from '../../services/staffService'; // Importar el servicio

export default function AddMember() {
  const router = useRouter();
  const [member, setMember] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    image: 'https://randomuser.me/api/portraits/lego/1.jpg', // Imagen por defecto
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const handleChange = (field, value) => {
    setMember({ ...member, [field]: value });
    // Limpiar error cuando se modifica el campo
    if (formErrors[field]) {
      setFormErrors({...formErrors, [field]: null});
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!member.name.trim()) {
      errors.name = 'El nombre es obligatorio';
    }
    
    if (!member.position.trim()) {
      errors.position = 'El cargo es obligatorio';
    }
    
    if (member.email && !member.email.includes('@')) {
      errors.email = 'El correo electrónico no es válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSave = async () => {
    if (!validateForm()) {
      // Mostrar alerta con el primer error
      const firstError = Object.values(formErrors)[0];
      Alert.alert('Campos incompletos', firstError || 'Por favor completa los campos obligatorios');
      return;
    }
    
    setLoading(true);
    try {
      // No necesitamos generar un ID aquí, el servicio lo hará
      const result = await addStaffMember(member);
      
      if (result.success) {
        // Mostrar confirmación y volver a la lista
        Alert.alert(
          'Miembro guardado',
          'El miembro ha sido añadido correctamente',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo guardar el miembro');
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un error al guardar el miembro');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const selectImage = async () => {
    Alert.alert('Seleccionar imagen', '¿Cómo quieres subir la imagen?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Galería',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            handleChange('image', result.assets[0].uri);
          }
        },
      },
      {
        text: 'Cámara',
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.granted === false) {
            Alert.alert('Permiso denegado', 'No se puede acceder a la cámara');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            handleChange('image', result.assets[0].uri);
          }
        },
      },
    ]);
  };
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo miembro</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.avatarContainer}>
        <TouchableOpacity 
          onPress={selectImage}
          activeOpacity={0.8}
        >
          {member.image ? (
            <Image source={{ uri: member.image }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderColor: COLORS.primary }]}>
              <CameraIcon size={40} color={COLORS.primary} />
            </View>
          )}
          <View style={[styles.editBadge, { backgroundColor: COLORS.primary }]}>
            <Text style={styles.editBadgeText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Información básica</Text>
        
        {/* Nombre */}
        <View style={[styles.inputContainer, formErrors.name ? styles.inputError : null]}>
          <UserFriendsIcon size={20} color={formErrors.name ? COLORS.danger : COLORS.primary} />
          <TextInput
            placeholder="Nombre completo *"
            placeholderTextColor={COLORS.textSecondary}
            value={member.name}
            onChangeText={(text) => handleChange('name', text)}
            style={styles.input}
          />
        </View>
        
        {/* Cargo */}
        <View style={[styles.inputContainer, formErrors.position ? styles.inputError : null]}>
          <UserFriendsIcon size={20} color={formErrors.position ? COLORS.danger : COLORS.primary} />
          <TextInput
            placeholder="Cargo *"
            placeholderTextColor={COLORS.textSecondary}
            value={member.position}
            onChangeText={(text) => handleChange('position', text)}
            style={styles.input}
          />
        </View>
        
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Contacto</Text>
        
        {/* Teléfono */}
        <View style={styles.inputContainer}>
          <PhoneIcon size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Teléfono"
            placeholderTextColor={COLORS.textSecondary}
            value={member.phone}
            onChangeText={(text) => handleChange('phone', text)}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>
        
        {/* Email */}
        <View style={[styles.inputContainer, formErrors.email ? styles.inputError : null]}>
          <EnvelopeIcon size={20} color={formErrors.email ? COLORS.danger : COLORS.primary} />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.textSecondary}
            value={member.email}
            onChangeText={(text) => handleChange('email', text)}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>
        
        {/* Botón guardar */}
        <TouchableOpacity 
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={loading}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.saveButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <CheckIcon size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar miembro</Text>
              </>
            )}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  editBadgeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  form: {
    gap: 12,
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
    marginBottom: 12,
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