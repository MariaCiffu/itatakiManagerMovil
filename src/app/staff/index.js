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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";
import WhatsAppButton from "../../components/WhatsAppButton";
import { useFocusEffect } from "@react-navigation/native";
import {
  getAllStaff,
  searchStaff,
  updateStaffMember,
  deleteStaffMember,
} from "../../services/staffService";

export default function StaffList() {
  const router = useRouter();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMember, setEditingMember] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});

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
          console.error("Error al cargar staff:", error);
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
    setEditFormErrors({}); // Limpiar errores previos
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setEditedData({});
    setEditFormErrors({}); // Limpiar errores
  };

  // Función para validar el formulario de edición
  const validateEditForm = () => {
    const errors = {};

    // Validar nombre (obligatorio)
    if (!editedData.name || !editedData.name.trim()) {
      errors.name = "El nombre es obligatorio";
    }

    // Validar profesión/cargo (obligatorio)
    if (!editedData.position || !editedData.position.trim()) {
      errors.position = "El cargo es obligatorio";
    }

    // Validar teléfono (opcional, pero si se introduce debe ser válido)
    if (editedData.phone && editedData.phone.trim()) {
      const phoneRegex = /^[+]?[\s\d\-\(\)]{7,}$/; // Al menos 7 dígitos, permite espacios, guiones, paréntesis y +
      if (!phoneRegex.test(editedData.phone.trim())) {
        errors.phone = "Formato de teléfono no válido";
      }
    }

    // Validar email (opcional, pero si se introduce debe ser válido)
    if (editedData.email && editedData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedData.email.trim())) {
        errors.email = "Formato de email no válido";
      }
    }

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEdit = async () => {
    // Validar el formulario
    if (!validateEditForm()) {
      const firstError = Object.values(editFormErrors)[0];
      return;
    }

    setLoading(true);
    try {
      // Limpiar datos antes de enviar
      const cleanedData = {
        ...editedData,
        name: editedData.name.trim(),
        position: editedData.position.trim(),
        phone: editedData.phone ? editedData.phone.trim() : "",
        email: editedData.email ? editedData.email.trim() : "",
      };

      // Llamar al servicio para actualizar
      await updateStaffMember(editingMember, cleanedData);

      // Actualizar la lista local
      const updatedStaff = staff.map((member) =>
        member.id === editingMember ? { ...member, ...cleanedData } : member
      );
      setStaff(updatedStaff);

      // Limpiar el estado de edición
      setEditingMember(null);
      setEditedData({});
      setEditFormErrors({});

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

    // Limpiar error cuando se modifica el campo
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: null }));
    }
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
                setStaff((prevStaff) =>
                  prevStaff.filter((member) => member.id !== memberId)
                );
                openSwipeableRef.current = null;
                Alert.alert("Éxito", "Miembro eliminado correctamente");
              } else {
                Alert.alert(
                  "Error",
                  result.message || "No se pudo eliminar el miembro"
                );
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
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMember = ({ item }) => {
    const isEditing = editingMember === item.id;

    if (isEditing) {
      return (
        <View style={styles.editCard}>
          <ScrollView
            style={styles.editCardContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.editHeader}>
              <Text style={styles.editTitle}>Editar miembro</Text>
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={styles.cancelButton}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-outline"
                  size={20}
                  color={MODERN_COLORS.textGray}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.editAvatarContainer}>
              <TouchableOpacity
                onPress={() => selectImage(item.id)}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri:
                      editedData.image ||
                      "https://via.placeholder.com/100x100/6B7280/FFFFFF?text=👤",
                  }}
                  style={styles.editAvatar}
                />
                <View style={styles.editAvatarBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.editForm}>
              <View
                style={[
                  styles.inputContainer,
                  editFormErrors.name && styles.inputError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    editFormErrors.name
                      ? MODERN_COLORS.danger
                      : MODERN_COLORS.primary
                  }
                />
                <TextInput
                  placeholder="Nombre completo *"
                  placeholderTextColor={MODERN_COLORS.textLight}
                  value={editedData.name}
                  onChangeText={(text) => handleChange("name", text)}
                  style={styles.input}
                />
              </View>
              {editFormErrors.name && (
                <Text style={styles.errorText}>{editFormErrors.name}</Text>
              )}

              <View
                style={[
                  styles.inputContainer,
                  editFormErrors.position && styles.inputError,
                ]}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={20}
                  color={
                    editFormErrors.position
                      ? MODERN_COLORS.danger
                      : MODERN_COLORS.primary
                  }
                />
                <TextInput
                  placeholder="Cargo *"
                  placeholderTextColor={MODERN_COLORS.textLight}
                  value={editedData.position}
                  onChangeText={(text) => handleChange("position", text)}
                  style={styles.input}
                />
              </View>
              {editFormErrors.position && (
                <Text style={styles.errorText}>{editFormErrors.position}</Text>
              )}

              <View
                style={[
                  styles.inputContainer,
                  editFormErrors.phone && styles.inputError,
                ]}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={
                    editFormErrors.phone
                      ? MODERN_COLORS.danger
                      : MODERN_COLORS.primary
                  }
                />
                <TextInput
                  placeholder="Teléfono"
                  placeholderTextColor={MODERN_COLORS.textLight}
                  value={editedData.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                  style={styles.input}
                  keyboardType="phone-pad"
                />
              </View>
              {editFormErrors.phone && (
                <Text style={styles.errorText}>{editFormErrors.phone}</Text>
              )}

              <View
                style={[
                  styles.inputContainer,
                  editFormErrors.email && styles.inputError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    editFormErrors.email
                      ? MODERN_COLORS.danger
                      : MODERN_COLORS.primary
                  }
                />
                <TextInput
                  placeholder="Correo electrónico"
                  placeholderTextColor={MODERN_COLORS.textLight}
                  value={editedData.email}
                  onChangeText={(text) => handleChange("email", text)}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {editFormErrors.email && (
                <Text style={styles.errorText}>{editFormErrors.email}</Text>
              )}

              <TouchableOpacity
                onPress={handleSaveEdit}
                style={styles.saveButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
                  style={styles.saveButtonGradient}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
            <View style={styles.memberContent}>
              {/* Imagen del miembro */}
              <Image
                source={{
                  uri:
                    item.image ||
                    "https://via.placeholder.com/70x70/6B7280/FFFFFF?text=👤",
                }}
                style={styles.memberImage}
              />

              {/* Información del miembro */}
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{item.name}</Text>
                <Text style={styles.memberPosition}>{item.position}</Text>

                {/* Contenedor de contacto */}
                <View style={styles.contactContainer}>
                  {/* Teléfono */}
                  {item.phone && (
                    <View style={styles.contactRow}>
                      <View style={styles.contactInfo}>
                        <Ionicons
                          name="call-outline"
                          size={18}
                          color={MODERN_COLORS.primary}
                        />
                        <Text
                          style={styles.contactText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.phone}
                        </Text>
                      </View>

                      {/* Botones de teléfono y WhatsApp alineados a la derecha */}
                      <View style={styles.rightButtonsContainer}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: "#4CAF50" },
                          ]}
                          onPress={() => Linking.openURL(`tel:${item.phone}`)}
                        >
                          <Ionicons
                            name="call-outline"
                            size={18}
                            color="#fff"
                          />
                        </TouchableOpacity>

                        <WhatsAppButton phone={item.phone} />
                      </View>
                    </View>
                  )}

                  {/* Email */}
                  {item.email && (
                    <View style={styles.contactRow}>
                      <View style={styles.contactInfo}>
                        <Ionicons
                          name="mail-outline"
                          size={18}
                          color={MODERN_COLORS.primary}
                        />
                        <Text
                          style={styles.contactText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.email}
                        </Text>
                      </View>

                      {/* Botón de email alineado a la derecha */}
                      <View style={styles.rightButtonsContainer}>
                        <TouchableOpacity
                          style={[
                            styles.actionButton,
                            { backgroundColor: "#2196F3" },
                          ]}
                          onPress={() =>
                            Linking.openURL(`mailto:${item.email}`)
                          }
                        >
                          <Ionicons
                            name="mail-outline"
                            size={18}
                            color="#fff"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Botón de editar en la esquina superior derecha */}
              <View style={styles.editButtonContainer}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditMember(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="create-outline" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Swipeable>
      </View>
    );
  };

  // Mostrar indicador de carga
  if (loading && staff.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Cargando staff...</Text>
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
                console.error("Error al cargar staff:", error);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.container}>
          {/* HEADER MODERNO */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={MODERN_COLORS.textDark}
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.title}>Staff técnico</Text>
            </View>

            <View style={{ width: 40 }} />
          </View>

          {/* BÚSQUEDA */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color={MODERN_COLORS.textGray}
              />
              <TextInput
                placeholder="Buscar miembro..."
                placeholderTextColor={MODERN_COLORS.textLight}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={handleSearch}
                onFocus={closeOpenSwipeable}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={MODERN_COLORS.textGray}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <FlatList
            data={staff}
            renderItem={renderMember}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={closeOpenSwipeable}
            onTouchStart={closeOpenSwipeable}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="people-outline"
                  size={64}
                  color={MODERN_COLORS.textLight}
                />
                <Text style={styles.emptyTitle}>No hay miembros</Text>
                <Text style={styles.emptySubtitle}>
                  {searchQuery
                    ? "No se encontraron resultados"
                    : "Añade el primer miembro del staff"}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={handleAddMember}
                  >
                    <Text style={styles.emptyButtonText}>Añadir miembro</Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />

          {/* BOTÓN FLOTANTE */}
          {!loading && (
            <TouchableOpacity
              style={styles.fab}
              onPress={handleAddMember}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },
  retryButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // HEADER MODERNO
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  // BÚSQUEDA
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  // LISTA
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Más espacio para el FAB y teclado
  },

  // MIEMBRO CARD
  memberCardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  memberCard: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  memberContent: {
    flexDirection: "row",
    padding: 16,
    position: "relative", // Para posicionar el botón de editar
  },
  memberImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
  },
  memberInfo: {
    flex: 1,
    justifyContent: "center",
  },
  memberName: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  memberPosition: {
    fontSize: 14,
    fontWeight: "500",
    color: MODERN_COLORS.primary,
    marginBottom: 12,
  },
  contactContainer: {
    gap: 6,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    minHeight: 36, // Altura mínima para dar más espacio
  },

  contactInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
    marginRight: 12, // Separación entre texto y botones
    minWidth: 0, // Permite que el texto se contraiga
  },
  contactText: {
    fontSize: 14, // Texto un poco más pequeño
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
    flex: 1, // Para que el texto ocupe el espacio disponible
    numberOfLines: 1, // Una sola línea
    flexShrink: 1, // Permite que se contraiga si es necesario
  },
  rightButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    position: "absolute",
    right: 0,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  editButtonContainer: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: MODERN_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  // MODO EDICIÓN
  editCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.surface,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 400, // Altura mínima para que se vea bien
  },
  editCardContent: {
    padding: 20,
  },
  editHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },
  cancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  editAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: MODERN_COLORS.primary,
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: MODERN_COLORS.surface,
  },
  editForm: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  inputError: {
    borderColor: MODERN_COLORS.danger,
    backgroundColor: `${MODERN_COLORS.danger}10`,
  },

  errorText: {
    fontSize: 12,
    color: MODERN_COLORS.danger,

    marginLeft: 4,
    fontWeight: "500",
  },

  saveButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
  },
  saveButtonGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // SWIPEABLE
  rightActionContainer: {
    width: 80,
    height: "100%",
  },
  deleteAction: {
    backgroundColor: MODERN_COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },

  // ESTADO VACÍO
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  // FAB
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
});
