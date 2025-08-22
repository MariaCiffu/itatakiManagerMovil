// app/jugadores/edit-player.js - CON CONTEXT
import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import ToggleSwitch from "../../components/ToggleSwitch";
import {
  ArrowLeftIcon,
  UserFriendsIcon,
  ShirtIcon,
  RunningIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CameraIcon,
  CheckIcon,
  TimesIcon,
  ChevronDownIcon,
} from "../../components/Icons";
import { MODERN_COLORS } from "../../constants/modernColors";
import { POSICIONES } from "../../constants/positions";
import { updateJugador } from "../../services/playersService";

export default function EditPlayer() {
  const router = useRouter();
  const { playerData } = useLocalSearchParams(); // 🔄 VOLVER A playerData

  const [player, setPlayer] = useState({
    id: "",
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
  const [isLoading, setIsLoading] = useState(true);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (playerData) {
      try {
        const parsedData = JSON.parse(playerData);
        console.log("🔍 Datos del jugador desde URL PARAMS:", parsedData);
        console.log("🖼️ Imagen recibida:", parsedData.image);

        // 🆕 CORREGIR CODIFICACIÓN DE URL SI ES NECESARIO
        let imageUrl = parsedData.image || "";
        if (imageUrl && imageUrl.startsWith("file://")) {
          // Verificar si necesita recodificación
          if (
            imageUrl.includes("%40anonymous%2F") &&
            !imageUrl.includes("%2540anonymous%252F")
          ) {
            console.log("🔧 Corrigiendo codificación de URL...");
            console.log("🔧 URL original:", imageUrl);

            // Recodificar correctamente
            imageUrl = imageUrl.replace(
              "%40anonymous%2F",
              "%2540anonymous%252F"
            );

            console.log("🔧 URL corregida:", imageUrl);
          }
        }

        setPlayer({
          id: parsedData.id || parsedData.playerId || "",
          name: parsedData.name || "",
          number: parsedData.number || "",
          position: parsedData.position || "",
          birthdate: parsedData.birthdate || "",
          foot: parsedData.foot || "Derecho",
          phone: parsedData.phone || "",
          image: imageUrl, // ← Usar imagen corregida
          email: parsedData.email || "",
          emergencyContact: parsedData.emergencyContact || "",
          emergencyPhone: parsedData.emergencyPhone || "",
        });

        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error parseando playerData:", error);
        Alert.alert("Error", "No se pudieron cargar los datos del jugador");
        setIsLoading(false);
      }
    } else {
      console.log("❌ No se recibieron datos del jugador");
      setIsLoading(false);
    }
  }, [playerData]);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: MODERN_COLORS.textGray, fontSize: 16 }}>
          Cargando datos del jugador...
        </Text>
      </View>
    );
  }

  const handleChange = (field, value) => {
    if (field === "number") {
      const numValue = parseInt(value, 10);
      setPlayer({ ...player, [field]: isNaN(numValue) ? "" : numValue });
    } else {
      setPlayer({ ...player, [field]: value });
    }

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

    if (
      player.number === undefined ||
      player.number === "" ||
      isNaN(player.number)
    ) {
      errors.number = "El número es obligatorio y debe ser un valor numérico";
    }

    if (!player.position.trim()) {
      errors.position = "La posición es obligatoria";
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

    if (!player.id) {
      Alert.alert("Error", "No se encontró el ID del jugador");
      return;
    }

    try {
      console.log("📄 Actualizando jugador:", player.id);

      const result = await updateJugador(player.id, {
        name: player.name,
        number: parseInt(player.number, 10),
        position: player.position,
        birthdate: player.birthdate,
        foot: player.foot,
        phone: player.phone,
        image: player.image,
        email: player.email,
        emergencyContact: player.emergencyContact,
        emergencyPhone: player.emergencyPhone,
      });

      console.log("📱 Resultado actualización:", result);

      if (result.success) {
        Alert.alert(
          "Jugador actualizado",
          "Los datos del jugador han sido actualizados correctamente",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          result.message || "No se pudo actualizar el jugador"
        );
      }
    } catch (error) {
      console.error("❌ Error al actualizar jugador:", error);
      Alert.alert("Error", "Ocurrió un error al guardar los cambios");
    }
  };

  const selectImage = async () => {
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
            console.log("🖼️ Nueva imagen seleccionada:", result.assets[0].uri);
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
            console.log("📷 Nueva imagen desde cámara:", result.assets[0].uri);
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ArrowLeftIcon size={24} color={MODERN_COLORS.textDark} />
          </TouchableOpacity>

          <Text style={styles.title}>Editar jugador</Text>

          <View style={{ width: 40 }} />
        </View>

        {/* AVATAR SECTION - IGUAL QUE ADD-PLAYER */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={selectImage}
            activeOpacity={0.8}
          >
            {player.image ? (
              <Image source={{ uri: player.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <CameraIcon size={40} color={MODERN_COLORS.primary} />
              </View>
            )}
            <View
              style={[
                styles.editBadge,
                { backgroundColor: MODERN_COLORS.primary },
              ]}
            >
              <CameraIcon size={16} color={MODERN_COLORS.textWhite} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarLabel}>
            {player.image ? "Toca para cambiar foto" : "Toca para añadir foto"}
          </Text>
        </View>

        {/* FORM SECTIONS */}
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
              <UserFriendsIcon
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
              <ShirtIcon
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
                value={player.number?.toString()}
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
              activeOpacity={0.7}
            >
              <RunningIcon
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
                  player.position ? styles.textInput : styles.placeholderText,
                  styles.fullWidthInput,
                ]}
              >
                {player.position || "Seleccionar posición"}
              </Text>
              <ChevronDownIcon size={16} color={MODERN_COLORS.textGray} />
            </TouchableOpacity>
            {formErrors.position && (
              <Text style={styles.errorText}>{formErrors.position}</Text>
            )}
          </View>

          {/* Fecha de nacimiento */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha de nacimiento</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.inputContainer}
              activeOpacity={0.7}
            >
              <CalendarIcon
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <Text
                style={[
                  player.birthdate ? styles.textInput : styles.placeholderText,
                  styles.fullWidthInput,
                ]}
              >
                {player.birthdate || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}

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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <PhoneIcon
                size={20}
                color={MODERN_COLORS.textGray}
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
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <EnvelopeIcon
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre de contacto</Text>
            <View style={styles.inputContainer}>
              <UserFriendsIcon
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

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono de contacto</Text>
            <View style={styles.inputContainer}>
              <PhoneIcon
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

        {/* BOTÓN GUARDAR */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
              style={styles.buttonGradient}
            >
              <CheckIcon size={20} color={MODERN_COLORS.textWhite} />
              <Text style={styles.saveButtonText}>Guardar cambios</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
                <TimesIcon size={24} color={MODERN_COLORS.textDark} />
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
                    <CheckIcon size={20} color={MODERN_COLORS.primary} />
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

  content: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
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

  debugText: {
    fontSize: 10,
    color: MODERN_COLORS.textLight,
    marginTop: 4,
    textAlign: "center",
  },

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

  fullWidthInput: {
    width: "100%",
  },

  errorText: {
    fontSize: 12,
    color: MODERN_COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },

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

  saveSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
  },

  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
  },

  buttonGradient: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },

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
