"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Picker } from "@react-native-picker/picker"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../../context/authContext"
import { COLORS } from "../../constants/colors"

const categories = ["Prebenjamín", "Benjamín", "Alevín", "Infantil", "Cadete", "Juvenil", "Senior", "Veteranos"]

export default function RegisterScreen() {
  const router = useRouter()
  const { register, state } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamName: "",
    category: "",
    homeField: "",
  })

  const handleRegister = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.teamName ||
      !formData.category ||
      !formData.homeField
    ) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        teamName: formData.teamName,
        category: formData.category,
        homeField: formData.homeField,
      })

      // 🔥 AGREGAR REDIRECCIÓN MANUAL
      console.log("Registro exitoso, redirigiendo...")
      router.replace("/")
    } catch (error) {
      console.error("Error en registro:", error)
      Alert.alert("Error", "No se pudo crear la cuenta. Intenta de nuevo.")
    }
  }

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <LinearGradient colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]} style={styles.background}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#374151" />
              </TouchableOpacity>

              <View style={styles.logoContainer}>
                <Image
                  source={{
                    uri: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-tM6oLpsmrTpiVF966eTOQst7xHlbYK.jpeg",
                  }}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.welcomeText}>¡Únete a Itataki Manager!</Text>
              <Text style={styles.subtitle}>Crea tu cuenta y comienza a gestionar tu equipo</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👤 Información Personal</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre Completo *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Tu nombre completo"
                    placeholderTextColor="#9ca3af"
                    value={formData.name}
                    onChangeText={(text) => updateFormData("name", text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor="#9ca3af"
                    value={formData.email}
                    onChangeText={(text) => updateFormData("email", text)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Contraseña *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor="#9ca3af"
                    value={formData.password}
                    onChangeText={(text) => updateFormData("password", text)}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Confirmar Contraseña *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor="#9ca3af"
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData("confirmPassword", text)}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.separator} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚽ Información del Equipo</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Nombre del Equipo *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: A.C.D Equipo"
                    placeholderTextColor="#9ca3af"
                    value={formData.teamName}
                    onChangeText={(text) => updateFormData("teamName", text)}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Categoría *</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.category}
                      onValueChange={(value) => updateFormData("category", value)}
                      style={styles.picker}
                      dropdownIconColor="#9ca3af"
                    >
                      <Picker.Item label="Selecciona una categoría" value="" />
                      {categories.map((category) => (
                        <Picker.Item key={category} label={category} value={category} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Campo Local *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ej: Estadio Municipal"
                    placeholderTextColor="#9ca3af"
                    value={formData.homeField}
                    onChangeText={(text) => updateFormData("homeField", text)}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, state.isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={state.isLoading}
              >
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>{state.isLoading ? "Creando cuenta..." : "Crear Cuenta"}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>o</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/auth/login")}>
                <Text style={styles.loginButtonText}>
                  ¿Ya tienes cuenta? <Text style={styles.loginLink}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Al crear una cuenta, aceptas nuestros términos y condiciones</Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
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
    paddingTop: 60,
    zIndex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: -20,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
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
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  separator: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },
  buttonGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
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
    padding: 12,
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
    marginTop: 24,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 18,
  },
})
