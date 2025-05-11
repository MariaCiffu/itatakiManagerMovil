// app/staff/index.js
import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import {
  ArrowLeftIcon,
  SearchIcon,
  PlusUserIcon,
  PhoneIcon,
  EnvelopeIcon,
  EditIcon,
  UserFriendsIcon,
  CheckIcon,
} from "../../components/Icons";
import { COLORS } from "../../constants/colors";
import WhatsAppButton from "../../components/WhatsAppButton";
import BackButton from "../../components/BackButton";
import { useFocusEffect } from '@react-navigation/native';
import { getAllStaff, searchStaff, updateStaffMember, deleteStaffMember } from "../../services/staffService";
import { Trash2 } from "react-native-feather";

export default function StaffList() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [editedData, setEditedData] = useState({});
  
  // Referencia para el swipeable actualmente abierto
  const openSwipeableRef = useRef(null);
  
  // Mapa de referencias para todos los swipeables
  const swipeableRefs = useRef({});

  // Cargar staff cuando la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      const loadStaff = async () => {
        try {
          setLoading(true);
          const data = await getAllStaff();
          setStaff(data);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar staff:', error);
          setLoading(false);
          setError("No se pudo cargar el staff");
        }
      };
      
      loadStaff();
      
      return () => {
        // Limpieza si es necesaria
      };
    }, [])
  );
  
  // Función para buscar miembros del staff
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      const data = await getAllStaff();
      setStaff(data);
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchStaff(query);
      setStaff(results);
    } catch (err) {
      console.error("Error al buscar:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    closeOpenSwipeable();
    router.push("/staff/add-member");
  };

  const handleEditMember = (member) => {
    closeOpenSwipeable();
    setEditingMember(member.id);
    setEditedData({ ...member });
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditedData({});
  };

  const handleSaveEdit = async () => {
    // Validar campos obligatorios
    if (!editedData.name || !editedData.position) {
      Alert.alert(
        "Campos incompletos",
        "El nombre y el cargo son obligatorios"
      );
      return;
    }

    setLoading(true);
    try {
      // Llamar al servicio para actualizar
      await updateStaffMember(editingMember, editedData);
      
      // Actualizar la lista local
      const updatedStaff = staff.map((member) =>
        member.id === editingMember ? { ...member, ...editedData } : member
      );
      setStaff(updatedStaff);
      
      // Limpiar el estado de edición
      setEditingMember(null);
      setEditedData({});
      
      // Mostrar confirmación
      Alert.alert(
        "Miembro actualizado",
        "Los datos han sido actualizados correctamente"
      );
    } catch (err) {
      Alert.alert(
        "Error",
        "No se pudo actualizar el miembro. Inténtalo de nuevo."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const selectImage = async (memberId) => {
    Alert.alert("Seleccionar imagen", "¿Cómo quieres subir la imagen?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Galería",
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            handleChange("image", result.assets[0].uri);
          }
        },
      },
      {
        text: "Cámara",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.granted === false) {
            Alert.alert("Permiso denegado", "No se puede acceder a la cámara");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) {
            handleChange("image", result.assets[0].uri);
          }
        },
      },
    ]);
  };
  
  // Función para eliminar un miembro del staff
  const handleDeleteMember = (memberId) => {
    Alert.alert(
      "Eliminar miembro",
      "¿Estás seguro de que quieres eliminar este miembro del staff?",
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => {
            if (openSwipeableRef.current) {
              openSwipeableRef.current.close();
              openSwipeableRef.current = null;
            }
          },
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await deleteStaffMember(memberId);
              if (result.success) {
                // Actualizar la lista local
                setStaff((prevStaff) => prevStaff.filter((member) => member.id !== memberId));
                openSwipeableRef.current = null;
                Alert.alert("Éxito", "Miembro eliminado correctamente");
              } else {
                Alert.alert("Error", result.message || "No se pudo eliminar el miembro");
              }
            } catch (error) {
              console.error("Error al eliminar miembro:", error);
              Alert.alert("Error", "Ocurrió un error al eliminar el miembro");
            }
          },
        },
      ]
    );
  };
  
  // Función para cerrar todos los swipeables excepto el actual
  const closeOtherSwipeables = useCallback((currentRef) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== currentRef) {
      openSwipeableRef.current.close();
    }
    openSwipeableRef.current = currentRef;
  }, []);
  
  // Función para cerrar el swipeable abierto
  const closeOpenSwipeable = useCallback(() => {
    if (openSwipeableRef.current) {
      openSwipeableRef.current.close();
      openSwipeableRef.current = null;
    }
  }, []);
  
  // Renderizar las acciones de deslizamiento (botón de eliminar)
  const renderRightActions = (memberId) => {
    return (
      <View style={styles.rightActionContainer}>
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteMember(memberId)}
        >
          <Trash2 width={24} height={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
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
                    onChangeText={(text) => handleChange("name", text)}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <UserFriendsIcon size={20} color={COLORS.primary} />
                  <TextInput
                    placeholder="Cargo *"
                    placeholderTextColor={COLORS.textSecondary}
                    value={editedData.position}
                    onChangeText={(text) => handleChange("position", text)}
                    style={styles.input}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <PhoneIcon size={20} color={COLORS.primary} />
                  <TextInput
                    placeholder="Teléfono"
                    placeholderTextColor={COLORS.textSecondary}
                    value={editedData.phone}
                    onChangeText={(text) => handleChange("phone", text)}
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
                    onChangeText={(text) => handleChange("email", text)}
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
      <View style={styles.memberCardContainer}>
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current[item.id] = ref;
            } else {
              delete swipeableRefs.current[item.id];
            }
          }}
          renderRightActions={() => renderRightActions(item.id)}
          onSwipeableOpen={() => {
            closeOtherSwipeables(swipeableRefs.current[item.id]);
          }}
          friction={0.8}
          overshootFriction={8}
          rightThreshold={40}
          useNativeAnimations={true}
        >
          <View style={styles.memberCard}>
            <LinearGradient
              colors={[COLORS.card, "#252525"]}
              style={styles.cardGradient}
            >
              <View style={styles.memberContent}>
                {/* Imagen del miembro */}
                <Image source={{ uri: item.image }} style={styles.memberImage} />

                {/* Información del miembro */}
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{item.name}</Text>
                  <Text style={styles.memberPosition}>{item.position}</Text>

                  {/* Contenedor de contacto */}
                  <View style={styles.contactContainer}>
                    {/* Teléfono */}
                    <View style={styles.contactItem}>
                      <PhoneIcon size={16} color={COLORS.primary} />
                      <Text style={styles.contactText}>
                        {item.phone || ""}
                      </Text>

                      {/* Botones de acción (ahora en la misma línea) */}
                      {item.phone && (
                        <View style={styles.actionButtonsContainer}>
                          <TouchableOpacity
                            style={[
                              styles.actionButton,
                              { backgroundColor: "#4CAF50" },
                            ]}
                            onPress={() => Linking.openURL(`tel:${item.phone}`)}
                          >
                            <PhoneIcon size={14} color="#fff" />
                          </TouchableOpacity>

                          {/* Botón de WhatsApp */}
                          <WhatsAppButton phone={item.phone} />
                        </View>
                      )}
                    </View>

                    {/* Email */}
                    <View style={styles.contactItem}>
                      <EnvelopeIcon size={16} color={COLORS.primary} />
                      <Text style={styles.contactText}>{item.email || ""}</Text>
                      {item.email && (
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: "#4CAF50" },
                          ]}
                          onPress={() => Linking.openURL(`mailto:${item.email}`)}
                        >
                          <EnvelopeIcon size={16} color="#fff" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Botones de acción en columna a la derecha */}
                <View style={styles.actionsColumn}>
                  {/* Botón de editar arriba */}
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditMember(item)}
                    activeOpacity={0.7}
                  >
                    <EditIcon size={16} color="#fff" />
                  </TouchableOpacity>

                  {/* Espacio entre botones */}
                  <View style={{ height: 8 }} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </Swipeable>
      </View>
    );
  };

  // Mostrar indicador de carga
  if (loading && staff.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Mostrar mensaje de error
  if (error && staff.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setError(null);
            const loadStaff = async () => {
              try {
                setLoading(true);
                const data = await getAllStaff();
                setStaff(data);
                setLoading(false);
              } catch (error) {
                console.error('Error al cargar staff:', error);
                setLoading(false);
                setError("No se pudo cargar el staff");
              }
            };
            loadStaff();
          }}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container} onTouchStart={closeOpenSwipeable}>
        <View style={styles.header}>
          <BackButton />
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
              onChangeText={handleSearch}
              onFocus={closeOpenSwipeable}
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
          data={staff}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={closeOpenSwipeable}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron miembros</Text>
            </View>
          }
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    color: COLORS.text,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  listContainer: {
    paddingBottom: 16,
  },
  // Nuevo contenedor para la tarjeta con Swipeable
  memberCardContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  memberCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 12,
    padding: 1, // Borde gradiente
  },
  memberContent: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 11,
    padding: 16,
  },
  memberImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  memberInfo: {
    flex: 1,
    justifyContent: "center",
  },
  memberName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  memberPosition: {
    color: COLORS.primary,
    fontSize: 14,
    marginBottom: 12,
  },
  contactContainer: {
    gap: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  contactText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  // Estilos para la columna de acciones
  actionsColumn: {
    justifyContent: "flex-start",
    alignItems: "center",
    marginLeft: 12,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtons: {
    alignItems: "center",
    gap: 8,
  },
  phoneButton: {
    backgroundColor: "#2196F3",
  },
  // Estilos para el modo de edición
  editCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  editTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 14,
  },
  editAvatarContainer: {
    alignItems: "center",
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
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  editAvatarBadgeText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  editForm: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
  },
  actionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  // Estilos para el swipeable y el botón de eliminar
  rightActionContainer: {
    width: 80,
    height: "100%",
  },
  deleteAction: {
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
});