import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { COLORS } from "../../constants/colors";
import { useAuth } from "../../context/authContext";

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
    return null;
  },
};

// 🔥 COMPONENTE INPUT FIELD REUTILIZABLE
const InputField = ({
  label,
  field,
  placeholder,
  secureTextEntry = false,
  keyboardType = "default",
  showPasswordToggle = false,
  showPassword: showPasswordProp,
  onTogglePassword,
  autoCapitalize = "sentences",
  formData,
  errors,
  updateFormData,
  handleBlur,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={formData[field]}
        onChangeText={(text) => updateFormData(field, text)}
        onBlur={() => handleBlur(field)}
        secureTextEntry={secureTextEntry && !showPasswordProp}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType="next"
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

export default function LoginScreen() {
  const router = useRouter();
  const { login, state } = useAuth();

  // 🔥 ESTADO DEL FORMULARIO
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // 🔥 ESTADO DE ERRORES INDIVIDUALES
  const [errors, setErrors] = useState({});

  // 🔥 ESTADO DE VALIDACIÓN EN TIEMPO REAL
  const [touched, setTouched] = useState({});

  // 🔥 ESTADO PARA MOSTRAR/OCULTAR CONTRASEÑA
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 VALIDAR CAMPO INDIVIDUAL
  const validateField = (field, value) => {
    switch (field) {
      case "email":
        return validators.email(value);
      case "password":
        return validators.password(value);
      default:
        return null;
    }
  };

  // 🔥 ACTUALIZAR CAMPO DEL FORMULARIO
  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    // Validación en tiempo real si el campo ya fue tocado
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  // 🔥 MARCAR CAMPO COMO TOCADO
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // 🔥 VALIDAR FORMULARIO COMPLETO
  const validateForm = () => {
    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({ email: true, password: true });

    return Object.keys(newErrors).length === 0;
  };

  // 🔥 MANEJAR LOGIN
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email.toLowerCase().trim(), formData.password);
      // 🔥 YA NO NECESITAS NAVEGACIÓN MANUAL - EL _layout SE ENCARGA
      console.log("🟢 Login exitoso, el layout redirigirá automáticamente");
    } catch (error) {
      console.log("🔴 Error en handleLogin:", error);
      Alert.alert("Error", error.message || "Credenciales incorrectas");
    }
  };

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
            {/* 🔥 HEADER CON LOGO CENTRADO */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={{
                    uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-tM6oLpsmrTpiVF966eTOQst7xHlbYK.jpeg",
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeText}>¡Bienvenido de vuelta!</Text>
              <Text style={styles.subtitle}>
                Inicia sesión para gestionar tu equipo
              </Text>
            </View>

            <View style={styles.formCard}>
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
                placeholder="Tu contraseña"
                secureTextEntry={true}
                showPasswordToggle={true}
                showPassword={showPassword}
                onTogglePassword={() => setShowPassword(!showPassword)}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                handleBlur={handleBlur}
              />

              <TouchableOpacity
                style={[
                  styles.loginButton,
                  state.isLoading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={state.isLoading}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {state.isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => router.push("/auth/register")}
              >
                <Text style={styles.registerButtonText}>
                  ¿No tienes cuenta?{" "}
                  <Text style={styles.registerLink}>Crear cuenta</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Al iniciar sesión, aceptas nuestros términos y condiciones
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
    top: 100,
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
    flex: 1,
    justifyContent: "center",
    padding: 24,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    textAlign: "center",
    lineHeight: 24,
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },

  // 🔥 ESTILOS DE INPUTS MEJORADOS
  inputContainer: {
    marginBottom: 16,
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

  loginButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  buttonGradient: {
    padding: 16,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
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
  registerButton: {
    alignItems: "center",
    padding: 12,
  },
  registerButtonText: {
    fontSize: 14,
    color: "#6b7280",
  },
  registerLink: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  footer: {
    marginTop: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
});
