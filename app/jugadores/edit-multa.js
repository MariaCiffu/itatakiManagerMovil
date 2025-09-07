import { useState, useEffect, useCallback } from "react";
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
import { MODERN_COLORS } from "../../src/constants/modernColors";
import {
  updateMulta,
  deleteMultaFromJugador,
} from "../../src/services/playersService";
import {
  ArrowLeftIcon,
  CoinsIcon,
  CalendarIcon,
  CheckIcon,
} from "../../src/components/Icons";

export default function EditMulta() {
  const router = useRouter();
  const { multaData, jugadorId } = useLocalSearchParams();

  const [multa, setMulta] = useState({
    id: "",
    reason: "",
    amount: "",
    date: "",
    paid: false,
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 CARGAR DATOS DE LA MULTA
  useEffect(() => {
    const loadMultaData = () => {
      try {
        setIsLoading(true);

        if (multaData) {
          const parsedData = JSON.parse(multaData);
          console.log("📄 Datos de multa recibidos:", parsedData);

          setMulta({
            id: parsedData.id || "",
            reason: parsedData.reason || "",
            amount: parsedData.amount?.toString() || "",
            date: parsedData.date || "",
            paid: parsedData.paid || false,
          });
        } else {
          throw new Error("No se recibieron datos de la multa");
        }
      } catch (error) {
        console.error("❌ Error cargando datos de multa:", error);
        Alert.alert("Error", "No se pudieron cargar los datos de la multa", [
          { text: "Volver", onPress: () => router.back() },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMultaData();
  }, [multaData, router]);

  // 🔥 MANEJAR CAMBIOS EN CAMPOS
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

  // 🔥 MANEJAR CAMBIO DE FECHA
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

  // 🔥 CAMBIAR ESTADO DE PAGO
  const togglePagado = useCallback(() => {
    const newPaidStatus = !multa.paid;
    console.log("🔄 Cambiando estado pagado:", multa.paid, "->", newPaidStatus);
    setMulta((prevMulta) => ({ ...prevMulta, paid: newPaidStatus }));
  }, [multa.paid]);

  // 🔥 VALIDAR FORMULARIO
  const validateForm = useCallback(() => {
    const errors = {};

    if (!multa.reason.trim()) {
      errors.reason = "El motivo es obligatorio";
    }

    if (!multa.amount.trim()) {
      errors.amount = "El importe es obligatorio";
    } else if (isNaN(Number(multa.amount))) {
      errors.amount = "El importe debe ser un número válido";
    } else if (Number(multa.amount) <= 0) {
      errors.amount = "El importe debe ser mayor que 0";
    }

    if (!multa.date.trim()) {
      errors.date = "La fecha es obligatoria";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [multa]);

  // 🔥 GUARDAR CAMBIOS
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      const firstError = Object.values(formErrors)[0];
      Alert.alert(
        "Campos incompletos",
        firstError || "Por favor completa todos los campos obligatorios"
      );
      return;
    }

    if (!multa.id) {
      Alert.alert("Error", "No se encontró el ID de la multa");
      return;
    }

    setIsSaving(true);

    try {
      console.log("💾 Guardando multa completa:", multa);

      // 🆕 Usar updateMulta para actualizar todos los campos
      const result = await updateMulta(multa.id, {
        reason: multa.reason.trim(),
        amount: Number(multa.amount),
        date: multa.date,
        paid: multa.paid,
      });

      if (result.success) {
        Alert.alert(
          "Multa actualizada",
          "Los cambios se han guardado correctamente",
          [
            {
              text: "OK",
              onPress: () => router.push(`/jugadores/${jugadorId}/multas`),
            },
          ]
        );
      } else {
        Alert.alert(
          "Error",
          result.message || "No se pudo actualizar la multa"
        );
      }
    } catch (error) {
      console.error("❌ Error al actualizar multa:", error);
      Alert.alert("Error", "Ocurrió un error al actualizar la multa");
    } finally {
      setIsSaving(false);
    }
  }, [validateForm, formErrors, multa, router]);

  // 🔥 ELIMINAR MULTA
  const handleDelete = useCallback(() => {
    Alert.alert(
      "Eliminar multa",
      `¿Eliminar multa de ${multa.amount}€?\n\nMotivo: ${multa.reason}\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setIsSaving(true);

            try {
              const result = await deleteMultaFromJugador(multa.id);

              if (result.success) {
                Alert.alert(
                  "Multa eliminada",
                  "La multa ha sido eliminada correctamente",
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
                  result.message || "No se pudo eliminar la multa"
                );
              }
            } catch (error) {
              console.error("❌ Error al eliminar multa:", error);
              Alert.alert("Error", "Ocurrió un error al eliminar la multa");
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  }, [multa, router]);

  // 🔄 LOADING STATE
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={MODERN_COLORS.primary} />
        <Text style={styles.loadingText}>Cargando datos de la multa...</Text>
      </View>
    );
  }

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
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={MODERN_COLORS.textDark}
          />
        </TouchableOpacity>

        <Text style={styles.title}>Editar multa</Text>

        {/* BOTÓN ELIMINAR */}
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={MODERN_COLORS.danger}
          />
        </TouchableOpacity>
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

        {/* SECCIÓN DE ACCIONES */}
        <View style={styles.actionsSection}>
          {/* BOTÓN GUARDAR */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[MODERN_COLORS.primary, MODERN_COLORS.primaryDark]}
              style={styles.buttonGradient}
            >
              {isSaving ? (
                <ActivityIndicator
                  size="small"
                  color={MODERN_COLORS.textWhite}
                />
              ) : (
                <>
                  <CheckIcon size={20} color={MODERN_COLORS.textWhite} />
                  <Text style={styles.saveButtonText}>Guardar cambios</Text>
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

  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },

  loadingText: {
    fontSize: 16,
    color: MODERN_COLORS.textGray,
    fontWeight: "500",
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

  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${MODERN_COLORS.danger}15`,
    justifyContent: "center",
    alignItems: "center",
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

  // ACTIONS SECTION
  actionsSection: {
    backgroundColor: MODERN_COLORS.surface,
    padding: 20,
    margin: 16,
    borderRadius: 16,
    gap: 12,
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

  deleteButtonSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: `${MODERN_COLORS.danger}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${MODERN_COLORS.danger}30`,
    gap: 8,
  },

  deleteButtonText: {
    color: MODERN_COLORS.danger,
    fontSize: 16,
    fontWeight: "600",
  },
});
