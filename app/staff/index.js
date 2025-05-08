// app/staff/index.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeftIcon, 
  SearchIcon, 
  PlusUserIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  EditIcon,
  UserFriendsIcon,
  CheckIcon
} from '../../components/Icons';
import { COLORS } from '../../constants/colors';

// Datos de ejemplo para miembros del staff
const STAFF_INICIAL = [
  {
    id: '1',
    name: 'Carlos Ancelotti',
    position: 'Entrenador principal',
    phone: '666123456',
    email: 'carlos@equipo.com',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Laura Martínez',
    position: 'Fisioterapeuta',
    phone: '666789012',
    email: 'laura@equipo.com',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '3',
    name: 'Miguel Sánchez',
    position: 'Preparador físico',
    phone: '666345678',
    email: 'miguel@equipo.com',
    image: 'https://randomuser.me/api/portraits/men/67.jpg',
  },
  {
    id: '4',
    name: 'Ana García',
    position: 'Nutricionista',
    phone: '666901234',
    email: 'ana@equipo.com',
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
  },
];

export default function StaffList() {
  const router = useRouter();
  const [staff, setStaff] = useState(STAFF_INICIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  const filteredStaff = staff.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddMember = () => {
    router.push('/staff/add-member');
  };
  
  const handleEditMember = (member) => {
    setEditingMember(member.id);
    setEditedData({ ...member });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditedData({});
  };

  const handleSaveEdit = () => {
    // Validar campos obligatorios
    if (!editedData.name || !editedData.position) {
      Alert.alert('Campos incompletos', 'El nombre y el cargo son obligatorios');
      return;
    }

    // Actualizar el miembro en la lista
    const updatedStaff = staff.map(member => 
      member.id === editingMember ? { ...member, ...editedData } : member
    );
    
    setStaff(updatedStaff);
    setEditingMember(null);
    setEditedData({});
    
    // Mostrar confirmación
    Alert.alert('Miembro actualizado', 'Los datos han sido actualizados correctamente');
  };

  const handleChange = (field, value) => {
    setEditedData(prev => ({ ...prev, [field]: value }));
  };

  const selectImage = async (memberId) => {
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
  
  const renderMember = ({ item }) => {
    const isEditing = editingMember === item.id;
    
    if (isEditing) {
      return (
        <View style={styles.editCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.editCardGradient}
          >
            <View style={styles.editCardContent}>
              <View style={styles.editHeader}>
                <Text style={styles.editTitle}>Editar miembro</Text>
                <TouchableOpacity 
                  onPress={handleCancelEdit}
                  style={styles.cancelButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.editAvatarContainer}>
                <TouchableOpacity onPress={() => selectImage(item.id)}>
                  <Image 
                    source={{ uri: editedData.image }} 
                    style={styles.editAvatar} 
                  />
                  <View style={styles.editAvatarBadge}>
                    <Text style={styles.editAvatarBadgeText}>+</Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={styles.editForm}>
                <View style={styles.inputContainer}>
                  <UserFriendsIcon size={20} color={COLORS.primary} />
                  <TextInput
                    placeholder="Nombre completo *"
                    placeholderTextColor={COLORS.textSecondary}
                    value={editedData.name}
                    onChangeText={(text) => handleChange('name', text)}
                    style={styles.input}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <UserFriendsIcon size={20} color={COLORS.primary} />
                  <TextInput
                    placeholder="Cargo *"
                    placeholderTextColor={COLORS.textSecondary}
                    value={editedData.position}
                    onChangeText={(text) => handleChange('position', text)}
                    style={styles.input}
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <PhoneIcon size={20} color={COLORS.primary} />
                  <TextInput
                    placeholder="Teléfono"
                    placeholderTextColor={COLORS.textSecondary}
                    value={editedData.phone}
                    onChangeText={(text) => handleChange('phone', text)}
                    style={styles.input}
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.inputContainer}>
                  <EnvelopeIcon size={20} color={COLORS.primary} />
                  <TextInput
                    placeholder="Correo electrónico"
                    placeholderTextColor={COLORS.textSecondary}
                    value={editedData.email}
                    onChangeText={(text) => handleChange('email', text)}
                    style={styles.input}
                    keyboardType="email-address"
                  />
                </View>
                
                <TouchableOpacity 
                  onPress={handleSaveEdit}
                  style={styles.saveButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.primaryDark]}
                    style={styles.saveButtonGradient}
                  >
                    <CheckIcon size={20} color="#fff" />
                    <Text style={styles.saveButtonText}>Guardar cambios</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      );
    }
    
    return (
      <View style={styles.memberCard}>
        <LinearGradient
          colors={[COLORS.card, '#252525']}
          style={styles.cardGradient}
        >
          <View style={styles.memberContent}>
            <Image 
              source={{ uri: item.image }} 
              style={styles.memberImage} 
            />
            
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{item.name}</Text>
              <Text style={styles.memberPosition}>{item.position}</Text>
              
              <View style={styles.contactContainer}>
                <View style={styles.contactItem}>
                  <PhoneIcon size={14} color={COLORS.primary} />
                  <Text style={styles.contactText}>{item.phone}</Text>
                </View>
                
                <View style={styles.contactItem}>
                  <EnvelopeIcon size={14} color={COLORS.primary} />
                  <Text style={styles.contactText}>{item.email}</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.editButton, { backgroundColor: COLORS.primary }]}
              onPress={() => handleEditMember(item)}
              activeOpacity={0.7}
            >
              <EditIcon size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Staff técnico</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <SearchIcon size={20} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Buscar miembro..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: COLORS.primary }]}
          onPress={handleAddMember}
          activeOpacity={0.7}
        >
          <PlusUserIcon size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredStaff}
        renderItem={renderMember}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    paddingVertical: 10,
    marginLeft: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingBottom: 16,
  },
  memberCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 12,
    padding: 1, // Borde gradiente
  },
  memberContent: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 11,
    padding: 12,
  },
  memberImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  memberName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberPosition: {
    color: COLORS.primary,
    fontSize: 14,
    marginBottom: 8,
  },
  contactContainer: {
    gap: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  // Estilos para el modo de edición
  editCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  editCardGradient: {
    borderRadius: 12,
    padding: 1, // Borde gradiente
  },
  editCardContent: {
    backgroundColor: COLORS.card,
    borderRadius: 11,
    padding: 16,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 14,
  },
  editAvatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  editAvatarBadgeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  editForm: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 8,
  },
  saveButtonGradient: {
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