import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../src/constants/modernColors";
import { addStaffMember } from "../../src/services/staffService";

export default function AddMember() {
  const router = useRouter();
  const [member, setMember] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field, value) => {
    setMember({ ...member, [field]: value });
    // Limpiar error cuando se modifica el campo
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!member.name.trim()) {
      errors.name = "El nombre es obligatorio";
    }

    if (!member.position.trim()) {
      errors.position = "El cargo es obligatorio";
    }

    if (member.email && !/\S+@\S+\.\S+/.test(member.email)) {
      errors.email = "El formato del email no es válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      return;
    }

    setIsLoading(true);
    try {
      const result = await addStaffMember(member);

      if (result.success) {
        Alert.alert(
          "¡Miembro añadido!",
          "El miembro ha sido añadido correctamente",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error al guardar miembro:", error);
      Alert.alert("Error", "Ocurrió un error al guardar el miembro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* HEADER MODERNO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={MODERN_COLORS.textDark}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Nuevo miembro</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* INFORMACIÓN BÁSICA */}
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
                value={member.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder="Nombre del miembro"
                placeholderTextColor={MODERN_COLORS.textLight}
              />
            </View>
            {formErrors.name && (
              <Text style={styles.errorText}>{formErrors.name}</Text>
            )}
          </View>

          {/* Cargo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cargo *</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.position && styles.inputError,
              ]}
            >
              <Ionicons
                name="briefcase-outline"
                size={20}
                color={
                  formErrors.position
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={member.position}
                onChangeText={(text) => handleChange("position", text)}
                placeholder="Entrenador, Fisioterapeuta, etc."
                placeholderTextColor={MODERN_COLORS.textLight}
              />
            </View>
            {formErrors.position && (
              <Text style={styles.errorText}>{formErrors.position}</Text>
            )}
          </View>
        </View>

        {/* INFORMACIÓN DE CONTACTO */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Contacto</Text>

          {/* Teléfono */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={member.phone}
                onChangeText={(text) => handleChange("phone", text)}
                placeholder="Número de teléfono"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.email && styles.inputError,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={
                  formErrors.email
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={member.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {formErrors.email && (
              <Text style={styles.errorText}>{formErrors.email}</Text>
            )}
          </View>
        </View>

        {/* BOTÓN GUARDAR */}
        <View style={styles.saveSection}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
              style={styles.buttonGradient}
            >
              {isLoading ? (
                <ActivityIndicator
                  size="small"
                  color={MODERN_COLORS.textWhite}
                />
              ) : (
                <>
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={MODERN_COLORS.textWhite}
                  />
                  <Text style={styles.saveButtonText}>Guardar miembro</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

  errorText: {
    fontSize: 12,
    color: MODERN_COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },

  // SAVE SECTION
  saveSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
  },

  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
  },

  saveButtonDisabled: {
    opacity: 0.6,
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
});
