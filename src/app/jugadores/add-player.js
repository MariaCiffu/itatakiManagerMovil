// app/jugadores/add-player.js
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
} from "react-native";
import { useRouter } from "expo-router";
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
import { COLORS } from "../../constants/colors";
import BackButton from "../../components/BackButton";
import { addJugador } from "../../services/jugadoresService";

// Opciones de posición
const POSICIONES = [
  "Portero",
  "Lateral izq.",
  "Lateral dcho.",
  "Defensa central",
  "Carrilero izq.",
  "Carrilero dcho.",
  "Mediocentro",
  "Mediapunta",
  "Extremo izq.",
  "Extremo dcho.",
  "Delantero",
];

export default function AddPlayer() {
  const router = useRouter();
  const [player, setPlayer] = useState({
    name: "",
    number: "",
    position: "",
    date: "",
    foot: "Derecho",
    phone: "",
    image: "",
    email: "",
    contactName: "",
    contactPhone: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

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
      handleChange("date", dateStr);
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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      // Mostrar alerta con el primer error
      const firstError = Object.values(formErrors)[0];
      Alert.alert(
        "Campos incompletos",
        firstError || "Por favor completa los campos obligatorios"
      );
      return;
    }

    try {
      // Preparar los datos del jugador
      const playerData = {
        ...player,
        number: parseInt(player.number, 10), // Convertir a número
        multas: [], // Inicializar con array vacío de multas
        // Si no hay imagen, usar un avatar por defecto
        image: player.image,
      };

      // Llamar al servicio para guardar el jugador
      const result = await addJugador(playerData);

      if (result.success) {
        // Mostrar confirmación y volver a la lista
        Alert.alert(
          "Jugador guardado",
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Nuevo jugador</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={selectImage}>
          {player.image ? (
            <Image source={{ uri: player.image }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { borderColor: COLORS.primary },
              ]}
            >
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
        <View
          style={[
            styles.inputContainer,
            formErrors.name ? styles.inputError : null,
          ]}
        >
          <UserFriendsIcon
            size={20}
            color={formErrors.name ? COLORS.danger : COLORS.primary}
          />
          <TextInput
            placeholder="Nombre completo *"
            placeholderTextColor={COLORS.textSecondary}
            value={player.name}
            onChangeText={(text) => handleChange("name", text)}
            style={styles.input}
          />
        </View>

        {/* Dorsal */}
        <View
          style={[
            styles.inputContainer,
            formErrors.number ? styles.inputError : null,
          ]}
        >
          <ShirtIcon
            size={20}
            color={formErrors.number ? COLORS.danger : COLORS.primary}
          />
          <TextInput
            placeholder="Dorsal *"
            placeholderTextColor={COLORS.textSecondary}
            value={player.number}
            onChangeText={(text) => handleChange("number", text)}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>

        {/* Posición (Selector) */}
        <TouchableOpacity
          style={[
            styles.inputContainer,
            formErrors.position ? styles.inputError : null,
          ]}
          onPress={() => setShowPositionModal(true)}
        >
          <RunningIcon
            size={20}
            color={formErrors.position ? COLORS.danger : COLORS.primary}
          />
          <Text
            style={[
              player.position ? styles.input : styles.inputPlaceholder,
              styles.fullWidthInput,
            ]}
          >
            {player.position || "Posición *"}
          </Text>
          <ChevronDownIcon size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Fecha de nacimiento */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.inputContainer}
        >
          <CalendarIcon size={20} color={COLORS.primary} />
          <Text
            style={[
              player.date ? styles.input : styles.inputPlaceholder,
              styles.fullWidthInput,
            ]}
          >
            {player.date || "Fecha de nacimiento"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
          />
        )}

        {/* Pie dominante */}
        <ToggleSwitch
          label="Pie dominante"
          options={["Derecho", "Izquierdo"]}
          selectedValue={player.foot}
          onValueChange={handleFootChange}
          primaryColor={COLORS.primary}
        />

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Contacto</Text>

        {/* Teléfono */}
        <View style={styles.inputContainer}>
          <PhoneIcon size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Teléfono"
            placeholderTextColor={COLORS.textSecondary}
            value={player.phone}
            onChangeText={(text) => handleChange("phone", text)}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        {/* Email */}
        <View style={styles.inputContainer}>
          <EnvelopeIcon size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Correo electrónico"
            placeholderTextColor={COLORS.textSecondary}
            value={player.email}
            onChangeText={(text) => handleChange("email", text)}
            style={styles.input}
            keyboardType="email-address"
          />
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>
          Contacto de emergencia
        </Text>

        {/* Nombre de contacto */}
        <View style={styles.inputContainer}>
          <UserFriendsIcon size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Nombre de contacto"
            placeholderTextColor={COLORS.textSecondary}
            value={player.contactName}
            onChangeText={(text) => handleChange("contactName", text)}
            style={styles.input}
          />
        </View>

        {/* Teléfono de contacto */}
        <View style={styles.inputContainer}>
          <PhoneIcon size={20} color={COLORS.primary} />
          <TextInput
            placeholder="Teléfono de contacto"
            placeholderTextColor={COLORS.textSecondary}
            value={player.contactPhone}
            onChangeText={(text) => handleChange("contactPhone", text)}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        {/* Botón guardar */}
        <TouchableOpacity onPress={handleSave}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.saveButton}
          >
            <CheckIcon size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Guardar jugador</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Modal para seleccionar posición */}
      <Modal
        visible={showPositionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPositionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPositionModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar posición</Text>
                <TouchableOpacity onPress={() => setShowPositionModal(false)}>
                  <TimesIcon size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.positionList}>
                {POSICIONES.map((posicion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.positionItem}
                    onPress={() => selectPosition(posicion)}
                  >
                    <Text
                      style={[
                        styles.positionText,
                        posicion === player.position
                          ? { color: COLORS.primary, fontWeight: "bold" }
                          : null,
                      ]}
                    >
                      {posicion}
                    </Text>
                    {posicion === player.position && (
                      <CheckIcon size={16} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
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
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  editBadgeText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: "bold",
    marginBottom: 12,
  },
  form: {
    gap: 12,
    paddingBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  inputPlaceholder: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  fullWidthInput: {
    width: "100%", // Asegura que el texto ocupe todo el ancho disponible
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Modal de posiciones
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "bold",
  },
  positionList: {
    maxHeight: 300,
  },
  positionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  positionText: {
    color: COLORS.text,
    fontSize: 16,
  },
});
