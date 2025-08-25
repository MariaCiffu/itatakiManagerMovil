import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../hooks/useFirebase";
import { updateUserProfile } from "../../services/authService";
import { MODERN_COLORS } from "../../constants/modernColors";

const categories = [
  "Prebenjamín",
  "Benjamín",
  "Alevín",
  "Infantil",
  "Cadete",
  "Juvenil",
  "Senior",
  "Veteranos",
];

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    teamName: "",
    category: "",
    homeField: "",
    profilePhoto: null,
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [initialLoad, setInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      const newFormData = {
        name: user.name || "",
        email: user.email || "",
        teamName: user.teamName || "",
        category: user.category || "",
        homeField: user.homeField || "",
        profilePhoto: user.profilePhoto || null,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      };

      setFormData(newFormData);

      if (initialLoad) {
        setInitialLoad(false);
        setHasChanges(false);
      }
    }
  }, [user, initialLoad]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (!initialLoad) {
      setHasChanges(true);
    }
  };

  // 🔧 FUNCIÓN CORREGIDA PARA SELECCIONAR FOTO (igual que add-player)
  const selectPhoto = async () => {
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
            handleInputChange("profilePhoto", result.assets[0].uri);
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
            handleInputChange("profilePhoto", result.assets[0].uri);
          }
        },
      },
      {
        text: "Eliminar foto",
        onPress: () => handleInputChange("profilePhoto", null),
        style: "destructive",
      },
    ]);
  };

  const validatePassword = () => {
    if (
      !formData.newPassword &&
      !formData.currentPassword &&
      !formData.confirmNewPassword
    ) {
      return true;
    }

    if (!formData.currentPassword) {
      Alert.alert("Error", "Ingresa tu contraseña actual");
      return false;
    }

    if (!formData.newPassword) {
      Alert.alert("Error", "Ingresa una nueva contraseña");
      return false;
    }

    if (formData.newPassword.length < 6) {
      Alert.alert(
        "Error",
        "La nueva contraseña debe tener al menos 6 caracteres"
      );
      return false;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      Alert.alert("Error", "Las contraseñas nuevas no coinciden");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.teamName.trim()) {
      Alert.alert(
        "Error",
        "El nombre y el nombre del equipo son obligatorios",
        [{ text: "OK" }]
      );
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        teamName: formData.teamName,
        category: formData.category,
        homeField: formData.homeField,
        profilePhoto: formData.profilePhoto,
      };

      const result = await updateUserProfile(user.uid, updateData);

      if (result.success) {
        setHasChanges(false);

        // Limpiar campos de contraseña
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }));

        Alert.alert("¡Éxito!", "Perfil actualizado correctamente", [
          {
            text: "OK",
            onPress: () => {
              // 🎯 SOLUCIÓN: usar replace en lugar de back
              router.replace("/");
            },
          },
        ]);
      } else {
        throw new Error(result.message || "Error actualizando perfil");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      Alert.alert(
        "Error",
        "No se pudo actualizar el perfil. Inténtalo de nuevo.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (hasChanges) {
      Alert.alert(
        "¿Descartar cambios?",
        "Se perderán todos los cambios no guardados",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Descartar",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  if (!user) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={styles.sectionTitle}>No hay datos de usuario</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={handleDiscard} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={MODERN_COLORS.textDark}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Mi Perfil</Text>

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveButton, { opacity: hasChanges ? 1 : 0.5 }]}
            disabled={!hasChanges || isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Guardando..." : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatar} onPress={selectPhoto}>
              {formData.profilePhoto ? (
                <Image
                  source={{ uri: formData.profilePhoto }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {formData.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={selectPhoto}
            >
              <Ionicons
                name="camera"
                size={16}
                color={MODERN_COLORS.textWhite}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarLabel}>Toca para cambiar foto</Text>
        </View>

        {/* INFORMACIÓN PERSONAL */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información Personal</Text>

          {/* NOMBRE */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={formData.name}
                onChangeText={(value) => handleInputChange("name", value)}
                placeholder="Tu nombre completo"
                placeholderTextColor={MODERN_COLORS.textLight}
              />
            </View>
          </View>

          {/* EMAIL */}
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
                style={[styles.textInput, { opacity: 0.6 }]}
                value={formData.email}
                placeholder="tu@email.com"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </View>
            <Text style={styles.helperText}>El email no se puede cambiar</Text>
          </View>
        </View>

        {/* INFORMACIÓN DEL EQUIPO */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información del Equipo</Text>

          {/* NOMBRE DEL EQUIPO */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre del Equipo</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="shield-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={formData.teamName}
                onChangeText={(value) => handleInputChange("teamName", value)}
                placeholder="Nombre de tu equipo"
                placeholderTextColor={MODERN_COLORS.textLight}
              />
            </View>
          </View>

          {/* CATEGORÍA */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Categoría</Text>
            <View style={styles.pickerContainer}>
              <Ionicons
                name="trophy-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => handleInputChange("category", value)}
                style={styles.picker}
                dropdownIconColor={MODERN_COLORS.textGray}
              >
                <Picker.Item label="Selecciona una categoría" value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category}
                    label={category}
                    value={category}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* CAMPO LOCAL */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Campo Local</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="location-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={formData.homeField}
                onChangeText={(value) => handleInputChange("homeField", value)}
                placeholder="Nombre del campo local"
                placeholderTextColor={MODERN_COLORS.textLight}
              />
            </View>
          </View>
        </View>

        {/* SEGURIDAD - CAMBIO DE CONTRASEÑA */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Seguridad</Text>

          <Text style={styles.sectionSubtitle}>
            Deja estos campos vacíos si no quieres cambiar tu contraseña
          </Text>

          {/* CONTRASEÑA ACTUAL */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Contraseña Actual</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={formData.currentPassword}
                onChangeText={(value) =>
                  handleInputChange("currentPassword", value)
                }
                placeholder="Tu contraseña actual"
                placeholderTextColor={MODERN_COLORS.textLight}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off" : "eye"}
                  size={20}
                  color={MODERN_COLORS.textGray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* NUEVA CONTRASEÑA */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nueva Contraseña</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="key-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={formData.newPassword}
                onChangeText={(value) =>
                  handleInputChange("newPassword", value)
                }
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={MODERN_COLORS.textLight}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={20}
                  color={MODERN_COLORS.textGray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRMAR NUEVA CONTRASEÑA */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar Nueva Contraseña</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={MODERN_COLORS.textGray}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={formData.confirmNewPassword}
                onChangeText={(value) =>
                  handleInputChange("confirmNewPassword", value)
                }
                placeholder="Repite la nueva contraseña"
                placeholderTextColor={MODERN_COLORS.textLight}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={MODERN_COLORS.textGray}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MODERN_COLORS.background,
  },

  header: {
    backgroundColor: MODERN_COLORS.surface,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  saveButton: {
    backgroundColor: MODERN_COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },

  saveButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 14,
    fontWeight: "600",
  },

  content: {
    flex: 1,
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: MODERN_COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },

  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: MODERN_COLORS.textWhite,
  },

  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MODERN_COLORS.accent,
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

  formSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 12,
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

  inputIcon: {
    marginRight: 12,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
  },

  helperText: {
    fontSize: 12,
    color: MODERN_COLORS.textGray,
    marginTop: 4,
    fontStyle: "italic",
  },

  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingLeft: 16,
    height: 52,
    overflow: "hidden",
  },

  picker: {
    flex: 1,
    height: 50,
    color: MODERN_COLORS.textDark,
  },

  sectionSubtitle: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    marginBottom: 16,
    fontStyle: "italic",
  },

  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },

  bottomSpacer: {
    height: 32,
  },
});
