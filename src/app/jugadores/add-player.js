import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { MODERN_COLORS } from "../../constants/modernColors";
import { POSICIONES } from "../../constants/positions";
import { addJugador } from "../../services/jugadoresService";

export default function AddPlayer() {
  const router = useRouter();
  const [player, setPlayer] = useState({
    name: "",
    number: "",
    position: "",
    birthdate: "",
    foot: "Derecho",
    phone: "",
    image: "",
    email: "",
    emergencyContact: "",
    emergencyPhone: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setPlayer({ ...player, [field]: value });
    // Limpiar error cuando se modifica el campo
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const year = selectedDate.getFullYear();
      const dateStr = `${day}-${month}-${year}`;
      handleChange("birthdate", dateStr);
    }
  };

  const handleFootChange = (newValue) => {
    handleChange("foot", newValue);
  };

  const selectPosition = (position) => {
    handleChange("position", position);
    setShowPositionModal(false);
  };

  const validateForm = () => {
    const errors = {};

    if (!player.name.trim()) {
      errors.name = "El nombre es obligatorio";
    }

    if (!player.number.trim()) {
      errors.number = "El dorsal es obligatorio";
    } else if (isNaN(Number(player.number))) {
      errors.number = "El dorsal debe ser un número";
    }

    if (!player.position.trim()) {
      errors.position = "La posición es obligatoria";
    }

    if (!player.birthdate.trim()) {
      errors.birthdate = "La fecha de nacimiento es obligatoria";
    }

    if (!player.foot) {
      errors.foot = "El pie dominante es obligatorio";
    }

    if (!player.phone.trim()) {
      errors.phone = "El teléfono es obligatorio";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      Alert.alert(
        "Campos incompletos",
        firstError || "Por favor completa los campos obligatorios"
      );
      return;
    }

    setIsLoading(true);
    try {
      const playerData = {
        ...player,
        number: parseInt(player.number, 10),
        multas: [],
        image: player.image,
      };

      const result = await addJugador(playerData);

      if (result.success) {
        Alert.alert(
          "¡Jugador añadido!",
          "El jugador ha sido añadido correctamente",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message || "No se pudo guardar el jugador");
      }
    } catch (error) {
      console.error("Error al guardar jugador:", error);
      Alert.alert("Error", "Ocurrió un error al guardar el jugador");
    } finally {
      setIsLoading(false);
    }
  };

  const selectImage = async () => {
    Alert.alert("Seleccionar imagen", "¿Cómo quieres subir la imagen?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Galería",
        onPress: async () => {
          const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

          if (status !== "granted") {
            Alert.alert(
              "Permisos requeridos",
              "Necesitamos acceso a tu galería."
            );
            return;
          }

          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

          if (!result.canceled) {
            handleChange("image", result.assets[0].uri);
          }
        },
      },
      {
        text: "Cámara",
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();

          if (status !== "granted") {
            Alert.alert(
              "Permisos requeridos",
              "Necesitamos acceso a tu cámara."
            );
            return;
          }

          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

          if (!result.canceled) {
            handleChange("image", result.assets[0].uri);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* 🎨 HEADER MODERNO */}
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

        <Text style={styles.title}>Nuevo jugador</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 🎨 AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={selectImage}
          >
            {player.image ? (
              <Image source={{ uri: player.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons
                  name="camera"
                  size={40}
                  color={MODERN_COLORS.primary}
                />
              </View>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="add" size={16} color={MODERN_COLORS.textWhite} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>Toca para añadir foto</Text>
        </View>

        {/* 🎨 FORM SECTIONS */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información básica</Text>

          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre completo *</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.name && styles.inputError,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={
                  formErrors.name
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={player.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Nombre del jugador"
                placeholderTextColor={MODERN_COLORS.textLight}
              />
            </View>
            {formErrors.name && (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            )}
          </View>

          {/* Dorsal */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Dorsal *</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.number && styles.inputError,
              ]}
            >
              <Ionicons
                name="shirt-outline"
                size={20}
                color={
                  formErrors.number
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={player.number}
                onChangeText={(text) => handleChange("number", text)}
                placeholder="Número del dorsal"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="numeric"
              />
            </View>
            {formErrors.number && (
              <Text style={styles.errorText}>{formErrors.number}</Text>
            )}
          </View>

          {/* Posición */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Posición *</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                formErrors.position && styles.inputError,
              ]}
              onPress={() => setShowPositionModal(true)}
            >
              <Ionicons
                name="football-outline"
                size={20}
                color={
                  formErrors.position
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.textInput,
                  !player.position && styles.placeholderText,
                ]}
              >
                {player.position || "Seleccionar posición"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={MODERN_COLORS.textGray}
              />
            </TouchableOpacity>
            {formErrors.position && (
              <Text style={styles.errorText}>{formErrors.position}</Text>
            )}
          </View>

          {/* Fecha de nacimiento */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha de nacimiento *</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                formErrors.birthdate && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={
                  formErrors.birthdate
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <Text
                style={[
                  styles.textInput,
                  !player.birthdate && styles.placeholderText,
                ]}
              >
                {player.birthdate || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>
            {formErrors.birthdate && (
              <Text style={styles.errorText}>{formErrors.birthdate}</Text>
            )}
          </View>

          {/* Pie dominante */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Pie dominante *</Text>
            <View style={styles.footContainer}>
              {["Derecho", "Izquierdo"].map((foot) => (
                <TouchableOpacity
                  key={foot}
                  style={[
                    styles.footOption,
                    player.foot === foot && styles.footOptionActive,
                    formErrors.foot && styles.inputError,
                  ]}
                  onPress={() => handleFootChange(foot)}
                >
                  <View
                    style={[
                      styles.radio,
                      player.foot === foot && styles.radioActive,
                    ]}
                  >
                    {player.foot === foot && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.footText,
                      player.foot === foot && styles.footTextActive,
                    ]}
                  >
                    {foot}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {formErrors.foot && (
              <Text style={styles.errorText}>{formErrors.foot}</Text>
            )}
          </View>
        </View>

        {/* Sección de contacto */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contacto</Text>

          {/* Teléfono */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono *</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.phone && styles.inputError,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={20}
                color={
                  formErrors.phone
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={player.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="Número de teléfono"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>
            {formErrors.phone && (
              <Text style={styles.errorText}>{formErrors.phone}</Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={player.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Contacto de emergencia */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contacto de emergencia</Text>

          {/* Nombre de contacto */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de contacto</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={player.emergencyContact}
                onChangeText={(text) => handleChange("emergencyContact", text)}
                placeholder="Nombre del contacto"
                placeholderTextColor={MODERN_COLORS.textLight}
              />
            </View>
          </View>

          {/* Teléfono de contacto */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono de contacto</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={player.emergencyPhone}
                onChangeText={(text) => handleChange("emergencyPhone", text)}
                placeholder="Teléfono de emergencia"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* 🎨 BOTÓN GUARDAR INTEGRADO */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Ionicons
                name="hourglass"
                size={20}
                color={MODERN_COLORS.textWhite}
              />
            ) : (
              <Ionicons
                name="checkmark"
                size={20}
                color={MODERN_COLORS.textWhite}
              />
            )}
            <Text style={styles.saveButtonText}>
              {isLoading ? "Guardando..." : "Guardar jugador"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="spinner"
          onChange={handleDateChange}
        />
      )}

      {/* Modal de posiciones */}
      <Modal
        visible={showPositionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPositionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar posición</Text>
              <TouchableOpacity
                onPress={() => setShowPositionModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={MODERN_COLORS.textDark}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.positionList}>
              {POSICIONES.map((posicion) => (
                <TouchableOpacity
                  key={posicion}
                  style={styles.positionItem}
                  onPress={() => selectPosition(posicion)}
                >
                  <Text
                    style={[
                      styles.positionText,
                      posicion === player.position && styles.positionTextActive,
                    ]}
                  >
                    {posicion}
                  </Text>
                  {posicion === player.position && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={MODERN_COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
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

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  // CONTENT
  content: {
    flex: 1,
  },

  // AVATAR
  avatarSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: MODERN_COLORS.surface,
    marginBottom: 8,
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },

  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderWidth: 2,
    borderColor: MODERN_COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  editBadge: {
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

  avatarLabel: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  // FORM
  formSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 20,
    letterSpacing: -0.2,
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
    marginBottom: 8,
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
  },

  inputError: {
    borderColor: MODERN_COLORS.danger,
    backgroundColor: "#fef2f2",
  },

  inputIcon: {
    marginRight: 12,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  placeholderText: {
    color: MODERN_COLORS.textLight,
  },

  errorText: {
    fontSize: 12,
    color: MODERN_COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },

  // PIE DOMINANTE
  footContainer: {
    flexDirection: "row",
    gap: 16,
  },

  footOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    padding: 16,
    gap: 12,
  },

  footOptionActive: {
    borderColor: MODERN_COLORS.primary,
    backgroundColor: `${MODERN_COLORS.primary}10`,
  },

  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: MODERN_COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  radioActive: {
    borderColor: MODERN_COLORS.primary,
  },

  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: MODERN_COLORS.primary,
  },

  footText: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
  },

  footTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },

  // SECCIÓN DE GUARDAR
  saveSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
  },

  saveButton: {
    backgroundColor: MODERN_COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },

  saveButtonDisabled: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
  },

  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  positionList: {
    maxHeight: 400,
  },

  positionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  positionText: {
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  positionTextActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
  },
});
