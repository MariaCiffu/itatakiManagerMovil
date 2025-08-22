// app/jugadores/add-multa.js - CON ESTILOS MODERNOS
import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";
import { addMultaToJugador } from "../../services/playersService";
import {
  ArrowLeftIcon,
  UserFriendsIcon, // En lugar de FileTextIcon
  CoinsIcon, // En lugar de EuroIcon
  CalendarIcon,
  CheckIcon,
} from "../../components/Icons";

export default function AddMulta() {
  const router = useRouter();
  const { jugadorId } = useLocalSearchParams();
  const [multa, setMulta] = useState({
    reason: "",
    amount: "",
    date: "",
    paid: false,
  });

  // 🔍 DEBUG: Ver cambios en el estado
  useEffect(() => {
    console.log("🔍 Estado actual de multa:", multa);
  }, [multa]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Función optimizada para manejar cambios en los campos
  const handleChange = useCallback(
    (field, value) => {
      setMulta((prevMulta) => ({ ...prevMulta, [field]: value }));

      // Limpiar error cuando se modifica el campo
      if (formErrors[field]) {
        setFormErrors((prevErrors) => ({ ...prevErrors, [field]: null }));
      }
    },
    [formErrors]
  );

  // Función optimizada para manejar cambios en la fecha
  const handleDateChange = useCallback(
    (event, selectedDate) => {
      setShowDatePicker(false);
      if (selectedDate) {
        const day = String(selectedDate.getDate()).padStart(2, "0");
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const year = selectedDate.getFullYear();
        const dateStr = `${day}/${month}/${year}`;
        handleChange("date", dateStr);
      }
    },
    [handleChange]
  );

  // Función optimizada para cambiar el estado de pago
  const togglePagado = useCallback(() => {
    const newPaidStatus = !multa.paid;
    console.log("🔄 Cambiando estado pagado:", multa.paid, "->", newPaidStatus);
    setMulta((prevMulta) => ({ ...prevMulta, paid: newPaidStatus }));
  }, [multa.paid]);

  // Función optimizada para validar el formulario
  const validateForm = useCallback(() => {
    const errors = {};

    if (!multa.reason.trim()) {
      errors.reason = "El motivo es obligatorio";
    }

    if (!multa.amount.trim()) {
      errors.amount = "El importe es obligatorio";
    } else if (isNaN(Number(multa.amount))) {
      errors.amount = "El importe debe ser un número";
    }

    if (!multa.date.trim()) {
      errors.date = "La fecha es obligatoria";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [multa]);

  // Función optimizada para guardar la multa
  const handleSave = useCallback(async () => {
    // 🆕 OBTENER EL ESTADO MÁS ACTUAL
    setMulta((currentMulta) => {
      console.log("🔍 Estado actual al guardar:", currentMulta);

      if (!currentMulta.reason.trim()) {
        Alert.alert("Error", "El motivo es obligatorio");
        return currentMulta;
      }

      if (!currentMulta.amount.trim()) {
        Alert.alert("Error", "El importe es obligatorio");
      } else if (isNaN(Number(currentMulta.amount))) {
        Alert.alert("Error", "El importe debe ser un número");
        return currentMulta;
      }

      if (!currentMulta.date.trim()) {
        Alert.alert("Error", "La fecha es obligatoria");
        return currentMulta;
      }

      // 🆕 PROCESAR EL GUARDADO CON EL ESTADO ACTUAL
      const multaToSave = {
        ...currentMulta,
        amount: Number(currentMulta.amount),
      };

      console.log("💾 Guardando multa:", multaToSave);
      console.log("💾 Estado pagado final:", multaToSave.paid);

      setIsLoading(true);

      // 🆕 LLAMAR A LA FUNCIÓN ASYNC DENTRO DE UN TIMEOUT
      setTimeout(async () => {
        try {
          const result = await addMultaToJugador(jugadorId, multaToSave);

          if (result.success) {
            Alert.alert(
              "Multa registrada",
              "La multa ha sido registrada correctamente",
              [
                {
                  text: "OK",
                  onPress: () => {
                    router.push(`/jugadores/${jugadorId}/multas`);
                  },
                },
              ]
            );
          } else {
            Alert.alert(
              "Error",
              result.message || "No se pudo registrar la multa"
            );
          }
        } catch (error) {
          console.error("Error al guardar multa:", error);
          Alert.alert("Error", "Ocurrió un error al guardar la multa");
        } finally {
          setIsLoading(false);
        }
      }, 0);

      return currentMulta;
    });
  }, [jugadorId, router]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* HEADER MODERNO */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push(`/jugadores/${jugadorId}/multas`)}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeftIcon size={24} color={MODERN_COLORS.textDark} />
        </TouchableOpacity>

        <Text style={styles.title}>Nueva multa</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* FORMULARIO */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Información de la multa</Text>

          {/* Motivo */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Motivo *</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.reason && styles.inputError,
              ]}
            >
              <UserFriendsIcon
                size={20}
                color={
                  formErrors.reason
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.textInput, styles.textInputMultiline]}
                value={multa.reason}
                onChangeText={(text) => handleChange("reason", text)}
                placeholder="Describe el motivo de la multa"
                placeholderTextColor={MODERN_COLORS.textLight}
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            {formErrors.reason && (
              <Text style={styles.errorText}>{formErrors.reason}</Text>
            )}
          </View>

          {/* Importe */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Importe *</Text>
            <View
              style={[
                styles.inputContainer,
                formErrors.amount && styles.inputError,
              ]}
            >
              <CoinsIcon
                size={20}
                color={
                  formErrors.amount
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.textInput}
                value={multa.amount}
                onChangeText={(text) => handleChange("amount", text)}
                placeholder="0.00"
                placeholderTextColor={MODERN_COLORS.textLight}
                keyboardType="numeric"
              />
              <Text style={styles.currencySymbol}>€</Text>
            </View>
            {formErrors.amount && (
              <Text style={styles.errorText}>{formErrors.amount}</Text>
            )}
          </View>

          {/* Fecha */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Fecha *</Text>
            <TouchableOpacity
              style={[
                styles.inputContainer,
                formErrors.date && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <CalendarIcon
                size={20}
                color={
                  formErrors.date
                    ? MODERN_COLORS.danger
                    : MODERN_COLORS.textGray
                }
                style={styles.inputIcon}
              />
              <Text
                style={[
                  multa.date ? styles.textInput : styles.placeholderText,
                  styles.fullWidthInput,
                ]}
              >
                {multa.date || "Seleccionar fecha"}
              </Text>
            </TouchableOpacity>
            {formErrors.date && (
              <Text style={styles.errorText}>{formErrors.date}</Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}

          {/* Estado de pago */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Estado</Text>
            <TouchableOpacity
              style={[
                styles.switchContainer,
                multa.paid && styles.switchContainerActive,
              ]}
              onPress={togglePagado}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.switchTrack,
                  {
                    backgroundColor: multa.paid
                      ? MODERN_COLORS.success
                      : `${MODERN_COLORS.textGray}30`,
                  },
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    {
                      backgroundColor: multa.paid
                        ? MODERN_COLORS.textWhite
                        : MODERN_COLORS.textGray,
                      transform: [{ translateX: multa.paid ? 24 : 0 }],
                    },
                  ]}
                >
                  {multa.paid && (
                    <CheckIcon size={12} color={MODERN_COLORS.success} />
                  )}
                </View>
              </View>
              <Text
                style={[
                  styles.switchLabel,
                  {
                    color: multa.paid
                      ? MODERN_COLORS.success
                      : MODERN_COLORS.textDark,
                  },
                ]}
              >
                {multa.paid ? "✅ Pagada" : "⏳ Pendiente de pago"}
              </Text>
            </TouchableOpacity>
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
                  <CheckIcon size={20} color={MODERN_COLORS.textWhite} />
                  <Text style={styles.saveButtonText}>Guardar multa</Text>
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

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // FORM
  formSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
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
    alignItems: "flex-start",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    paddingHorizontal: 16,
    minHeight: 52,
    paddingVertical: 16,
  },

  inputError: {
    borderColor: MODERN_COLORS.danger,
    backgroundColor: "#fef2f2",
  },

  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    color: MODERN_COLORS.textDark,
    fontWeight: "500",
    padding: 0,
  },

  textInputMultiline: {
    minHeight: 60,
    textAlignVertical: "top",
  },

  placeholderText: {
    color: MODERN_COLORS.textLight,
  },

  fullWidthInput: {
    width: "100%",
  },

  currencySymbol: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    fontWeight: "600",
    marginLeft: 8,
  },

  errorText: {
    fontSize: 12,
    color: MODERN_COLORS.danger,
    marginTop: 4,
    marginLeft: 4,
  },

  // SWITCH
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
    padding: 16,
    gap: 12,
  },

  switchContainerActive: {
    backgroundColor: `${MODERN_COLORS.success}10`,
    borderColor: MODERN_COLORS.success,
  },

  switchTrack: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 3,
    justifyContent: "center",
  },

  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  // SAVE SECTION
  saveSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
    margin: 16,
    borderRadius: 16,
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
