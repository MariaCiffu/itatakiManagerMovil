import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
// 🔥 CORREGIDO: Importar servicios de Firebase
import { registerUser } from "../../src/services/authService";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../src/config/firebase";
import { COLORS } from "../../src/constants/colors";
// 🔥 CORREGIDO: Usar el hook correcto
import { useAuth } from "../../src/hooks/useFirebase";
// 🆕 IMPORTAR CLOUDINARY
import { uploadImage } from "../../src/components/cloudinary";

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

// 🔥 FUNCIÓN PARA CREAR/ACTUALIZAR EQUIPO
const createOrUpdateTeam = async (teamData) => {
  try {
    const teamId = "acd-fatima";
    const teamRef = doc(db, "teams", teamId);

    // Directamente actualizar/crear sin verificar primero
    await setDoc(
      teamRef,
      {
        id: teamId,
        name: teamData.name,
        category: teamData.category,
        homeField: teamData.homeField,
        createdBy: teamData.createdBy,
        updatedAt: new Date(),
        active: true,
      },
      { merge: true }
    ); // merge: true actualiza si existe, crea si no existe

    console.log("Equipo actualizado exitosamente");
    return { success: true };
  } catch (error) {
    console.error("Error con el equipo:", error);
    return { success: false, message: error.message };
  }
};

// 🔥 VALIDACIONES CENTRALIZADAS
const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "El email es obligatorio";
    if (!emailRegex.test(email)) return "Formato de email inválido";
    return null;
  },

  password: (password) => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 6) return "Mínimo 6 caracteres";
    if (!/(?=.*[a-z])/.test(password))
      return "Debe contener al menos una minúscula";
    if (!/(?=.*[A-Z])/.test(password))
      return "Debe contener al menos una mayúscula";
    if (!/(?=.*\d)/.test(password)) return "Debe contener al menos un número";
    return null;
  },

  confirmPassword: (password, confirmPassword) => {
    if (!confirmPassword) return "Confirma tu contraseña";
    if (password !== confirmPassword) return "Las contraseñas no coinciden";
    return null;
  },

  name: (name) => {
    if (!name?.trim()) return "El nombre es obligatorio";
    if (name.trim().length < 2)
      return "El nombre debe tener al menos 2 caracteres";
    if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name))
      return "Solo se permiten letras y espacios";
    return null;
  },

  teamName: (teamName) => {
    if (!teamName?.trim()) return "El nombre del equipo es obligatorio";
    if (teamName.trim().length < 2) return "Mínimo 2 caracteres";
    return null;
  },

  category: (category) => {
    if (!category) return "Selecciona una categoría";
    return null;
  },

  homeField: (homeField) => {
    if (!homeField?.trim()) return "El campo local es obligatorio";
    if (homeField.trim().length < 2) return "Mínimo 2 caracteres";
    return null;
  },
};

// 🔥 COMPONENTE INPUT FIELD
const InputField = ({
  label,
  field,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  showPasswordToggle = false,
  showPassword: showPasswordProp,
  onTogglePassword,
  multiline = false,
  autoCapitalize = "sentences",
  formData,
  errors,
  updateFormData,
  handleBlur,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label} *</Text>
    <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={formData[field]}
        onChangeText={(text) => updateFormData(field, text)}
        onBlur={() => handleBlur(field)}
        secureTextEntry={secureTextEntry && !showPasswordProp}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        returnKeyType={multiline ? "default" : "next"}
      />
      {showPasswordToggle && (
        <TouchableOpacity style={styles.eyeIcon} onPress={onTogglePassword}>
          <Ionicons
            name={showPasswordProp ? "eye-off" : "eye"}
            size={20}
            color="#9ca3af"
          />
        </TouchableOpacity>
      )}
    </View>
    {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
  </View>
);

// 🔥 COMPONENTE SELECTOR DE FOTO ACTUALIZADO CON CLOUDINARY
const PhotoSelector = ({ profilePhoto, onSelectPhoto }) => {
  const selectPhoto = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos requeridos",
          "Necesitamos acceso a tu galería para seleccionar una foto.",
          [{ text: "OK" }]
        );
        return;
      }

      Alert.alert(
        "Seleccionar foto",
        "Elige cómo quieres agregar tu foto de perfil",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Galería", onPress: () => pickFromGallery() },
          { text: "Cámara", onPress: () => pickFromCamera() },
        ]
      );
    } catch (error) {
      console.error("Error selecting photo:", error);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        onSelectPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking from gallery:", error);
      Alert.alert("Error", "No se pudo seleccionar la imagen");
    }
  };

  const pickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permisos requeridos",
          "Necesitamos acceso a tu cámara para tomar una foto.",
          [{ text: "OK" }]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        onSelectPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking from camera:", error);
      Alert.alert("Error", "No se pudo tomar la foto");
    }
  };

  return (
    <View style={styles.photoSection}>
      <Text style={styles.photoLabel}>Foto de Perfil (Opcional)</Text>
      <TouchableOpacity style={styles.photoContainer} onPress={selectPhoto}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={32} color="#9ca3af" />
          </View>
        )}
        <View style={styles.photoOverlay}>
          <Ionicons name="camera" size={20} color="#fff" />
        </View>
      </TouchableOpacity>
      <Text style={styles.photoHint}>Toca para agregar una foto</Text>
    </View>
  );
};

export default function RegisterScreen() {
  const router = useRouter();
  // 🔥 CORREGIDO: Usar el hook en lugar del contexto
  const { isAuthenticated, loading: authLoading } = useAuth();

  // 🔥 ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamName: "",
    category: "",
    homeField: "",
    profilePhoto: null,
  });

  // 🔥 ESTADO DE ERRORES INDIVIDUALES
  const [errors, setErrors] = useState({});

  // 🔥 ESTADO DE VALIDACIÓN EN TIEMPO REAL
  const [touched, setTouched] = useState({});

  // 🔥 ESTADO PARA MOSTRAR/OCULTAR CONTRASEÑAS
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔥 ESTADO DEL FORMULARIO PASO A PASO
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  // 🔥 ESTADO DE CARGA
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 VALIDAR CAMPO INDIVIDUAL
  const validateField = (field, value, allData = formData) => {
    switch (field) {
      case "email":
        return validators.email(value);
      case "password":
        return validators.password(value);
      case "confirmPassword":
        return validators.confirmPassword(allData.password, value);
      case "name":
        return validators.name(value);
      case "teamName":
        return validators.teamName(value);
      case "category":
        return validators.category(value);
      case "homeField":
        return validators.homeField(value);
      default:
        return null;
    }
  };

  // 🔥 VALIDAR TODOS LOS CAMPOS DE UN PASO
  const validateStep = (step) => {
    const stepFields =
      step === 1
        ? ["name", "email", "password", "confirmPassword"]
        : ["teamName", "category", "homeField"];

    const stepErrors = {};
    stepFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) stepErrors[field] = error;
    });

    setErrors((prev) => ({ ...prev, ...stepErrors }));
    return Object.keys(stepErrors).length === 0;
  };

  // 🔥 ACTUALIZAR CAMPO DEL FORMULARIO
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    if (touched[field]) {
      const error = validateField(field, value, {
        ...formData,
        [field]: value,
      });
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // 🔥 ACTUALIZAR FOTO DE PERFIL
  const updateProfilePhoto = (uri) => {
    setFormData((prev) => ({ ...prev, profilePhoto: uri }));
  };

  // 🔥 MARCAR CAMPO COMO TOCADO
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // 🔥 AVANZAR AL SIGUIENTE PASO
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // 🔥 RETROCEDER AL PASO ANTERIOR
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // 🔥 REGISTRO FINAL CON FIREBASE Y CLOUDINARY
  const handleRegister = async () => {
    // Marcar todos los campos como tocados
    const allFields = [
      "name",
      "email",
      "password",
      "confirmPassword",
      "teamName",
      "category",
      "homeField",
    ];
    const allTouched = {};
    allFields.forEach((field) => (allTouched[field] = true));
    setTouched(allTouched);

    // Validar todos los campos
    if (!validateStep(1) || !validateStep(2)) {
      Alert.alert("Error", "Por favor corrige los errores en el formulario");
      return;
    }

    setIsLoading(true);

    try {
      // 🆕 1. SUBIR FOTO A CLOUDINARY SI EXISTE
      let profilePhotoURL = null;
      if (formData.profilePhoto) {
        try {
          const tempUserId = `temp_${Date.now()}`; // ID temporal para la subida
          profilePhotoURL = await uploadImage(
            formData.profilePhoto,
            `users/${tempUserId}`
          );
          console.log("✅ Foto subida a Cloudinary:", profilePhotoURL);
        } catch (uploadError) {
          console.error("❌ Error subiendo foto:", uploadError);
          // No detener el registro por error de foto, solo advertir
          Alert.alert(
            "Advertencia",
            "No se pudo subir la foto de perfil, pero continuaremos con el registro."
          );
        }
      }

      // 2. 🔥 CREAR USUARIO EN FIREBASE (COMO COACH)
      const userResult = await registerUser({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        name: formData.name.trim(),
        role: "coach", // ← TODOS LOS REGISTROS SON ENTRENADORES (COACH)
        teamId: "acd-fatima", // ← EQUIPO FIJO
        teamName: formData.teamName.trim(),
        homeField: formData.homeField.trim(),
        category: formData.category,
        profilePhoto: profilePhotoURL, // ← URL de Cloudinary o null
      });

      if (userResult.success) {
        Alert.alert(
          "Registro exitoso",
          "Tu cuenta ha sido creada. Está pendiente de aprobación por un administrador.",
          [{ text: "OK" }] // ← Solo cerrar el alert, el useEffect se encarga de redirigir
        );
      } else {
        Alert.alert("Error", userResult.message);
      }
    } catch (error) {
      console.error("Error en registro:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo crear la cuenta. Intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 MOSTRAR LOADING SI AUTH ESTÁ CARGANDO
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Verificando autenticación...</Text>
      </View>
    );
  }

  // 🔥 NO MOSTRAR SI YA ESTÁ AUTENTICADO
  if (isAuthenticated) {
    return null;
  }

  // 🔥 INDICADOR DE PROGRESO COMPACTO
  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressWrapper}>
        {[1, 2].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View
              style={[
                styles.progressCircle,
                currentStep >= step && styles.progressCircleActive,
                currentStep > step && styles.progressCircleCompleted,
              ]}
            >
              {currentStep > step ? (
                <Ionicons name="checkmark" size={14} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.progressNumber,
                    currentStep >= step && styles.progressNumberActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.progressLabel,
                currentStep >= step && styles.progressLabelActive,
              ]}
            >
              {step === 1 ? "Personal" : "Equipo"}
            </Text>
            {step < totalSteps && (
              <View
                style={[
                  styles.progressLine,
                  currentStep > step && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]}
        style={styles.background}
      >
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        <KeyboardAwareScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          extraScrollHeight={20}
          extraHeight={Platform.OS === "ios" ? 20 : 0}
          keyboardShouldPersistTaps="handled"
          resetScrollToCoords={{ x: 0, y: 0 }}
          scrollEnabled={true}
        >
          <View style={styles.content}>
            {/* 🔥 HEADER LIMPIO SIN BOTÓN DE ATRÁS */}
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Crear cuenta</Text>
            </View>

            {/* 🔥 INDICADOR DE PROGRESO */}
            <ProgressIndicator />

            <View style={styles.formCard}>
              {/* 🔥 PASO 1: DATOS PERSONALES */}
              {currentStep === 1 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    👤 Información Personal
                  </Text>

                  {/* 🆕 SELECTOR DE FOTO */}
                  <PhotoSelector
                    profilePhoto={formData.profilePhoto}
                    onSelectPhoto={updateProfilePhoto}
                  />

                  <InputField
                    label="Nombre Completo"
                    field="name"
                    placeholder="Tu nombre completo"
                    autoCapitalize="words"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    handleBlur={handleBlur}
                  />

                  <InputField
                    label="Email"
                    field="email"
                    placeholder="tu@email.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    handleBlur={handleBlur}
                  />

                  <InputField
                    label="Contraseña"
                    field="password"
                    placeholder="Mínimo 6 caracteres"
                    secureTextEntry={true}
                    showPasswordToggle={true}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    handleBlur={handleBlur}
                  />

                  <InputField
                    label="Confirmar Contraseña"
                    field="confirmPassword"
                    placeholder="Repite tu contraseña"
                    secureTextEntry={true}
                    showPasswordToggle={true}
                    showPassword={showConfirmPassword}
                    onTogglePassword={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    handleBlur={handleBlur}
                  />

                  <TouchableOpacity
                    style={styles.nextButton}
                    onPress={nextStep}
                  >
                    <LinearGradient
                      colors={[COLORS.primary, COLORS.primaryDark]}
                      style={styles.buttonGradient}
                    >
                      <Text style={styles.buttonText}>Siguiente</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* 🔥 PASO 2: INFORMACIÓN DEL EQUIPO */}
              {currentStep === 2 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    ⚽ Información del Equipo
                  </Text>

                  <InputField
                    label="Nombre del Equipo"
                    field="teamName"
                    placeholder="Ej: A.C.D Equipo"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    handleBlur={handleBlur}
                  />

                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Categoría *</Text>
                    <View
                      style={[
                        styles.pickerContainer,
                        errors.category && styles.inputError,
                      ]}
                    >
                      <Picker
                        selectedValue={formData.category}
                        onValueChange={(value) =>
                          updateFormData("category", value)
                        }
                        style={styles.picker}
                        dropdownIconColor="#9ca3af"
                      >
                        <Picker.Item
                          label="Selecciona una categoría"
                          value=""
                        />
                        {categories.map((category) => (
                          <Picker.Item
                            key={category}
                            label={category}
                            value={category}
                          />
                        ))}
                      </Picker>
                    </View>
                    {errors.category && (
                      <Text style={styles.errorText}>{errors.category}</Text>
                    )}
                  </View>

                  <InputField
                    label="Campo Local"
                    field="homeField"
                    placeholder="ej: Estadio Municipal"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    handleBlur={handleBlur}
                  />

                  {/* 🔥 BOTONES DE NAVEGACIÓN */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.prevButton}
                      onPress={prevStep}
                    >
                      <View style={styles.prevButtonContent}>
                        <Text style={styles.prevButtonText}>Anterior</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.registerButton,
                        isLoading && styles.buttonDisabled,
                      ]}
                      onPress={handleRegister}
                      disabled={isLoading}
                    >
                      <LinearGradient
                        colors={[COLORS.primary, COLORS.primaryDark]}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.buttonText}>
                          {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => router.push("/auth/login")}
              >
                <Text style={styles.loginButtonText}>
                  ¿Ya tienes cuenta?{" "}
                  <Text style={styles.loginLink}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Al crear una cuenta, aceptas nuestros términos y condiciones
              </Text>
            </View>
          </View>
        </KeyboardAwareScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  circle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(34, 197, 94, 0.1)",
  },
  circle2: {
    position: "absolute",
    top: 200,
    left: -80,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  circle3: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(168, 85, 247, 0.06)",
  },
  content: {
    padding: 24,
    paddingTop: 40,
    zIndex: 1,
  },

  // 🔥 LOADING CONTAINER
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },

  // 🔥 HEADER LIMPIO SIN BOTÓN
  header: {
    alignItems: "center",
    marginBottom: 28,
    paddingTop: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 300,
  },

  // 🆕 ESTILOS DE FOTO DE PERFIL
  photoSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  photoContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
  },
  photoOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  photoHint: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },

  // 🔥 INDICADOR DE PROGRESO COMPACTO
  progressContainer: {
    marginBottom: 20,
  },
  progressWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
    position: "relative",
  },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  progressCircleActive: {
    backgroundColor: COLORS.primary,
  },
  progressCircleCompleted: {
    backgroundColor: "#10b981",
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#9ca3af",
  },
  progressNumberActive: {
    color: "#fff",
  },
  progressLabel: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    fontWeight: "500",
  },
  progressLabelActive: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  progressLine: {
    position: "absolute",
    top: 16,
    left: "50%",
    right: "-50%",
    height: 2,
    backgroundColor: "#e5e7eb",
    zIndex: -1,
  },
  progressLineActive: {
    backgroundColor: "#10b981",
  },

  formCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  // 🔥 ESTILOS DE INPUTS
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: "#1f2937",
  },
  inputMultiline: {
    textAlignVertical: "top",
    minHeight: 80,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  eyeIcon: {
    padding: 14,
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 4,
    marginLeft: 4,
  },

  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  picker: {
    height: 50,
    color: "#1f2937",
  },

  // 🔥 ESTILOS DE BOTONES
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },
  prevButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  prevButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  prevButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  registerButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  buttonGradient: {
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonIcon: {
    marginLeft: 8,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e7eb",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#9ca3af",
    fontSize: 14,
  },
  loginButton: {
    alignItems: "center",
    padding: 10,
  },
  loginButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  loginLink: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
});
