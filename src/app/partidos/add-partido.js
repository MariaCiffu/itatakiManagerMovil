import React, { useState, useRef, useEffect } from "react";
import { BackHandler, Alert } from "react-native";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MODERN_COLORS } from "../../constants/modernColors";
import { addPartido } from "../../services/partidosService";
import StepIndicator from "../../components/partido/StepIndicator";
import LineupScreen from "../alineacion";

export default function CrearPartidoScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateTimeMode, setDateTimeMode] = useState("date");
  const [formErrors, setFormErrors] = useState({});

  const [partidoData, setPartidoData] = useState({
    tipoPartido: "liga",
    jornada: "",
    rival: "",
    notasRival: "",
    estrategia: "",
    fecha: new Date(),
    lugar: "Casa",
    lugarEspecifico: "",
    alineacion: null,
  });

  // Referencias para guardar datos de cada paso
  const alineacionRef = useRef(null);

  // Pasos del flujo
  const steps = [
    { id: "info", title: "Información" },
    { id: "rival", title: "Rival" },
    { id: "alineacion", title: "Alineación" },
    { id: "estrategia", title: "Estrategia" },
  ];

  // Función para validar cada paso
  const validateStep = (step) => {
    const errors = {};

    switch (step) {
      case 0: // Información
        if (
          partidoData.tipoPartido !== "amistoso" &&
          !partidoData.jornada.trim()
        ) {
          errors.jornada =
            partidoData.tipoPartido === "liga"
              ? "La jornada es obligatoria"
              : "El nombre del torneo es obligatorio";
        }
        if (
          partidoData.lugar === "Fuera" &&
          !partidoData.lugarEspecifico.trim()
        ) {
          errors.lugarEspecifico =
            "Especifica el lugar cuando juegues de visitante";
        }
        break;

      case 1: // Rival
        if (!partidoData.rival.trim()) {
          errors.rival = "El nombre del rival es obligatorio";
        }
        break;

      // Los pasos de alineación y estrategia son opcionales
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Función para manejar cambios en los campos
  const handleChange = (field, value) => {
    setPartidoData((prev) => ({ ...prev, [field]: value }));

    // Limpiar error cuando se modifica el campo
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    if (!validateStep(currentStep)) {
      return;
    }

    // Si estamos en el paso de alineación, guardar los datos antes de avanzar
    if (currentStep === 2 && alineacionRef.current) {
      const alineacionData = alineacionRef.current.getAlineacionData();
      setPartidoData((prev) => ({ ...prev, alineacion: alineacionData }));
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Si estamos en el último paso (estrategia), guardar directamente
      guardarPartido();
    }
  };

  // Función para retroceder al paso anterior
  const prevStep = () => {
    // Si estamos en el paso de alineación, guardar los datos antes de retroceder
    if (currentStep === 2 && alineacionRef.current) {
      const alineacionData = alineacionRef.current.getAlineacionData();
      setPartidoData((prev) => ({ ...prev, alineacion: alineacionData }));
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  // Función para manejar la navegación directa entre pasos
  const handleStepPress = (index) => {
    // Solo permitir navegar a pasos anteriores o al siguiente paso si el actual es válido
    if (
      index < currentStep ||
      (index === currentStep + 1 && validateStep(currentStep))
    ) {
      // Si estamos en el paso de alineación, guardar los datos antes de cambiar
      if (currentStep === 2 && alineacionRef.current) {
        const alineacionData = alineacionRef.current.getAlineacionData();
        setPartidoData((prev) => ({ ...prev, alineacion: alineacionData }));
      }
      setCurrentStep(index);
    }
  };

  // Manejar el botón de retroceso del dispositivo
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        prevStep();
        return true; // Prevenir el comportamiento por defecto
      }
    );

    return () => backHandler.remove();
  }, [currentStep]);

  // Función para manejar cambio de fecha y hora
  const onDateChange = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowDatePicker(false);
      setDateTimeMode("date");
      return;
    }

    const currentDate = selectedDate || partidoData.fecha;

    if (dateTimeMode === "date") {
      handleChange("fecha", currentDate);

      // En Android, cerrar el picker de fecha y abrir el de hora
      if (Platform.OS === "android") {
        setShowDatePicker(false);
        setTimeout(() => {
          setDateTimeMode("time");
          setShowDatePicker(true);
        }, 100);
      } else {
        setDateTimeMode("time");
      }
    } else {
      handleChange("fecha", currentDate);
      setShowDatePicker(false);
      setDateTimeMode("date");
    }
  };

  // Función para guardar los datos del partido
  const guardarPartido = async () => {
    try {
      setLoading(true);

      // Si la alineación se maneja por referencia
      let finalAlineacion = partidoData.alineacion;
      if (alineacionRef.current) {
        finalAlineacion = alineacionRef.current.getAlineacionData();
      }

      const partidoFinal = {
        ...partidoData,
        alineacion: finalAlineacion,
      };

      // Crear el partido
      const result = await addPartido(partidoFinal);

      if (result.success) {
        Alert.alert(
          "¡Partido creado!",
          "El partido se ha creado correctamente",
          [
            {
              text: "Ver partido",
              onPress: () => router.replace(`/partidos/${result.id}`),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al guardar partido:", error);
      Alert.alert("Error", "No se pudo crear el partido");
      setLoading(false);
    }
  };

  // Renderizar el paso actual
  const renderStep = () => {
    switch (steps[currentStep].id) {
      case "info":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Información del partido</Text>

            {/* Tipo de partido */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tipo de partido</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    partidoData.tipoPartido === "liga" &&
                      styles.radioButtonSelected,
                  ]}
                  onPress={() => handleChange("tipoPartido", "liga")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.radioText,
                      partidoData.tipoPartido === "liga" &&
                        styles.radioTextSelected,
                    ]}
                  >
                    Liga
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    partidoData.tipoPartido === "torneo" &&
                      styles.radioButtonSelected,
                  ]}
                  onPress={() => handleChange("tipoPartido", "torneo")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.radioText,
                      partidoData.tipoPartido === "torneo" &&
                        styles.radioTextSelected,
                    ]}
                  >
                    Torneo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    partidoData.tipoPartido === "amistoso" &&
                      styles.radioButtonSelected,
                  ]}
                  onPress={() => handleChange("tipoPartido", "amistoso")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.radioText,
                      partidoData.tipoPartido === "amistoso" &&
                        styles.radioTextSelected,
                    ]}
                  >
                    Amistoso
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Jornada/Torneo */}
            {partidoData.tipoPartido !== "amistoso" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {partidoData.tipoPartido === "liga"
                    ? "Jornada *"
                    : "Nombre del torneo *"}
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    formErrors.jornada && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="trophy-outline"
                    size={20}
                    color={
                      formErrors.jornada
                        ? MODERN_COLORS.danger
                        : MODERN_COLORS.textGray
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={partidoData.jornada}
                    onChangeText={(text) => handleChange("jornada", text)}
                    keyboardType={
                      partidoData.tipoPartido === "liga" ? "numeric" : "default"
                    }
                    placeholder={
                      partidoData.tipoPartido === "liga"
                        ? "Número de jornada"
                        : "Nombre del torneo"
                    }
                    placeholderTextColor={MODERN_COLORS.textLight}
                  />
                </View>
                {formErrors.jornada && (
                  <Text style={styles.errorText}>{formErrors.jornada}</Text>
                )}
              </View>
            )}

            {/* Fecha y Hora */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha y Hora</Text>
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => {
                  setDateTimeMode("date");
                  setShowDatePicker(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={MODERN_COLORS.textGray}
                  style={styles.inputIcon}
                />
                <View style={styles.dateTimeInfo}>
                  <Text style={styles.dateTimeText}>
                    {partidoData.fecha.toLocaleDateString("es-ES")} •{" "}
                    {partidoData.fecha.toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={partidoData.fecha}
                  mode={dateTimeMode}
                  display="default"
                  onChange={onDateChange}
                  is24Hour={true}
                />
              )}
            </View>

            {/* Lugar */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lugar</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    partidoData.lugar === "Casa" && styles.radioButtonSelected,
                  ]}
                  onPress={() => handleChange("lugar", "Casa")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="home"
                    size={16}
                    color={
                      partidoData.lugar === "Casa"
                        ? MODERN_COLORS.textWhite
                        : MODERN_COLORS.textGray
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.radioText,
                      partidoData.lugar === "Casa" && styles.radioTextSelected,
                    ]}
                  >
                    Local
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    partidoData.lugar === "Fuera" && styles.radioButtonSelected,
                  ]}
                  onPress={() => handleChange("lugar", "Fuera")}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="airplane"
                    size={16}
                    color={
                      partidoData.lugar === "Fuera"
                        ? MODERN_COLORS.textWhite
                        : MODERN_COLORS.textGray
                    }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.radioText,
                      partidoData.lugar === "Fuera" && styles.radioTextSelected,
                    ]}
                  >
                    Visitante
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Lugar específico cuando es visitante */}
            {partidoData.lugar === "Fuera" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lugar específico *</Text>
                <View
                  style={[
                    styles.inputContainer,
                    formErrors.lugarEspecifico && styles.inputError,
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={
                      formErrors.lugarEspecifico
                        ? MODERN_COLORS.danger
                        : MODERN_COLORS.textGray
                    }
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={partidoData.lugarEspecifico}
                    onChangeText={(text) =>
                      handleChange("lugarEspecifico", text)
                    }
                    placeholder="Nombre del campo o ciudad"
                    placeholderTextColor={MODERN_COLORS.textLight}
                  />
                </View>
                {formErrors.lugarEspecifico && (
                  <Text style={styles.errorText}>
                    {formErrors.lugarEspecifico}
                  </Text>
                )}
              </View>
            )}
          </View>
        );

      case "rival":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Información del rival</Text>

            {/* Nombre del rival */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del equipo rival *</Text>
              <View
                style={[
                  styles.inputContainer,
                  formErrors.rival && styles.inputError,
                ]}
              >
                <Ionicons
                  name="shield-outline"
                  size={20}
                  color={
                    formErrors.rival
                      ? MODERN_COLORS.danger
                      : MODERN_COLORS.textGray
                  }
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  value={partidoData.rival}
                  onChangeText={(text) => handleChange("rival", text)}
                  placeholder="Introduce el nombre del equipo rival"
                  placeholderTextColor={MODERN_COLORS.textLight}
                />
              </View>
              {formErrors.rival && (
                <Text style={styles.errorText}>{formErrors.rival}</Text>
              )}
            </View>

            {/* Notas sobre el rival */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas sobre el rival</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={[styles.textArea, styles.textAreaRival]}
                  value={partidoData.notasRival}
                  onChangeText={(text) => handleChange("notasRival", text)}
                  placeholder="Información sobre el rival, jugadores clave, fortalezas, debilidades..."
                  placeholderTextColor={MODERN_COLORS.textLight}
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        );

      case "alineacion":
        return (
          <View style={styles.alineacionContainer}>
            <View style={styles.lineupWrapper}>
              <LineupScreen
                ref={alineacionRef}
                matchday={
                  partidoData.tipoPartido === "liga"
                    ? parseInt(partidoData.jornada) || 0
                    : partidoData.jornada || ""
                }
                isEmbedded={true}
                initialData={partidoData.alineacion}
                onSaveLineup={(lineupData) => {
                  setPartidoData((prev) => ({
                    ...prev,
                    alineacion: lineupData,
                  }));
                }}
              />
            </View>
          </View>
        );

      case "estrategia":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Estrategia para el partido</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estrategia y observaciones</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={[styles.textArea, styles.textAreaLarge]}
                  value={partidoData.estrategia}
                  onChangeText={(text) => handleChange("estrategia", text)}
                  placeholder="Define la estrategia para este partido, instrucciones tácticas, sistemas de juego..."
                  placeholderTextColor={MODERN_COLORS.textLight}
                  multiline={true}
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={MODERN_COLORS.textDark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nuevo partido</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step Indicator */}
      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepPress={handleStepPress}
      />

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.stepContentContainer}>{renderStep()}</View>
      </ScrollView>

      {/* Botón fijo en la parte inferior */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, loading && styles.buttonDisabled]}
          onPress={nextStep}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
            style={styles.buttonGradient}
          >
            {loading ? (
              <ActivityIndicator size="small" color={MODERN_COLORS.textWhite} />
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentStep === steps.length - 1
                    ? "Guardar partido"
                    : "Siguiente"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={MODERN_COLORS.textWhite}
                  style={{ marginLeft: 4 }}
                />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
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

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.3,
  },

  // CONTENT
  content: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  stepContentContainer: {
    flex: 1,
  },

  stepContainer: {
    flex: 1,
    padding: 20,
  },

  stepTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    marginBottom: 24,
    letterSpacing: -0.3,
  },

  // FORM
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
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingHorizontal: 16,
    height: 52,
  },

  inputError: {
    borderColor: MODERN_COLORS.danger,
    backgroundColor: `${MODERN_COLORS.danger}10`,
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

  dateTimeInfo: {
    flex: 1,
  },

  dateTimeText: {
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "600",
  },

  errorText: {
    fontSize: 12,
    color: MODERN_COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },

  // RADIO BUTTONS
  radioGroup: {
    flexDirection: "row",
    gap: 8,
  },

  radioButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: MODERN_COLORS.surface,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  radioButtonSelected: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },

  radioText: {
    fontSize: 14,
    fontWeight: "600",
    color: MODERN_COLORS.textDark,
  },

  radioTextSelected: {
    color: MODERN_COLORS.textWhite,
  },

  // TEXT AREAS
  textAreaContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    padding: 16,
  },

  textArea: {
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
    minHeight: 100,
    textAlignVertical: "top",
  },

  textAreaLarge: {
    minHeight: 350,
  },

  textAreaRival: {
    minHeight: 250, // Más grande para las notas del rival
  },

  // ALINEACIÓN
  alineacionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  lineupWrapper: {
    flex: 1,
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    marginBottom: 10,
    marginBottom: 20,
    overflow: "hidden",
  },

  // BOTONES
  buttonContainer: {
    backgroundColor: MODERN_COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: MODERN_COLORS.border,
    padding: 20,
  },

  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
  },

  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },

  nextButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "600",
  },

  buttonDisabled: {
    opacity: 0.6,
  },
});
