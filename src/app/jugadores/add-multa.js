"use client"

import { useState, useCallback } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import DateTimePicker from "@react-native-community/datetimepicker"
import FontAwesome5 from "react-native-vector-icons/FontAwesome5"
import { COLORS } from "../../constants/colors"
import { addMultaToJugador } from "../../services/jugadoresService"
import BackButton from "../../components/BackButton"

export default function AddMulta() {
  const router = useRouter()
  const { jugadorId } = useLocalSearchParams()
  const [multa, setMulta] = useState({
    reason: "",
    amount: "",
    date: "",
    paid: false,
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Función optimizada para manejar cambios en los campos
  const handleChange = useCallback((field, value) => {
    setMulta(prevMulta => ({ ...prevMulta, [field]: value }))
    
    // Limpiar error cuando se modifica el campo
    if (formErrors[field]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [field]: null }))
    }
  }, [formErrors])

  // Función optimizada para manejar cambios en la fecha
  const handleDateChange = useCallback((event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, "0")
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0")
      const year = selectedDate.getFullYear()
      const dateStr = `${day}/${month}/${year}`
      handleChange("date", dateStr)
    }
  }, [handleChange])

  // Función optimizada para cambiar el estado de pago
  const togglePagado = useCallback(() => {
    setMulta(prevMulta => ({ ...prevMulta, paid: !prevMulta.paid }))
  }, [])

  // Función optimizada para validar el formulario
  const validateForm = useCallback(() => {
    const errors = {}

    if (!multa.reason.trim()) {
      errors.reason = "El motivo es obligatorio"
    }

    if (!multa.amount.trim()) {
      errors.amount = "El importe es obligatorio"
    } else if (isNaN(Number(multa.amount))) {
      errors.amount = "El importe debe ser un número"
    }

    if (!multa.date.trim()) {
      errors.date = "La fecha es obligatoria"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }, [multa])

  // Función optimizada para guardar la multa
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      // Mostrar alerta con el primer error
      const firstError = Object.values(formErrors)[0]
      Alert.alert("Campos incompletos", firstError || "Por favor completa todos los campos obligatorios.")
      return
    }

    // Convertir importe a número
    const multaToSave = {
      ...multa,
      amount: Number(multa.amount),
    }

    setIsLoading(true)

    try {
      const result = await addMultaToJugador(jugadorId, multaToSave)

      setIsLoading(false)

      if (result.success) {
        Alert.alert("Multa registrada", "La multa ha sido registrada correctamente", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ])
      } else {
        Alert.alert("Error", result.message || "No se pudo registrar la multa")
      }
    } catch (error) {
      setIsLoading(false)
      console.error("Error al guardar multa:", error)
      Alert.alert("Error", "Ocurrió un error al guardar la multa")
    }
  }, [multa, formErrors, validateForm, jugadorId, router])

  // El resto del componente permanece igual
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.title}>Nueva multa</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.form}>
        {/* Motivo */}
        <View style={[styles.inputContainer, formErrors.reason ? styles.inputError : null]}>
          <FontAwesome5 name="file-alt" size={20} color={formErrors.reason ? COLORS.danger : COLORS.primary} />
          <TextInput
            placeholder="Motivo de la multa *"
            placeholderTextColor={COLORS.textSecondary}
            value={multa.reason}
            onChangeText={(text) => handleChange("reason", text)}
            style={styles.input}
            multiline={true}
            numberOfLines={2}
          />
        </View>
        {formErrors.reason && <Text style={styles.errorText}>{formErrors.reason}</Text>}

        {/* Importe */}
        <View style={[styles.inputContainer, formErrors.amount ? styles.inputError : null]}>
          <FontAwesome5 name="euro-sign" size={20} color={formErrors.amount ? COLORS.danger : COLORS.primary} />
          <TextInput
            placeholder="Importe (€) *"
            placeholderTextColor={COLORS.textSecondary}
            value={multa.amount}
            onChangeText={(text) => handleChange("amount", text)}
            style={styles.input}
            keyboardType="numeric"
          />
        </View>
        {formErrors.amount && <Text style={styles.errorText}>{formErrors.amount}</Text>}

        {/* Fecha */}
        <TouchableOpacity
          style={[styles.inputContainer, formErrors.date ? styles.inputError : null]}
          onPress={() => setShowDatePicker(true)}
        >
          <FontAwesome5 name="calendar-alt" size={20} color={formErrors.date ? COLORS.danger : COLORS.primary} />
          <Text style={multa.date ? styles.input : styles.inputPlaceholder}>{multa.date || "Fecha *"}</Text>
        </TouchableOpacity>
        {formErrors.date && <Text style={styles.errorText}>{formErrors.date}</Text>}

        {showDatePicker && (
          <DateTimePicker value={new Date()} mode="date" display="spinner" onChange={handleDateChange} />
        )}

        {/* Estado de pago */}
        <TouchableOpacity style={styles.switchContainer} onPress={togglePagado}>
          <View
            style={[
              styles.switchTrack,
              { backgroundColor: multa.paid ? `${COLORS.success}40` : `${COLORS.textSecondary}40` },
            ]}
          >
            <View
              style={[
                styles.switchThumb,
                {
                  backgroundColor: multa.paid ? COLORS.success : COLORS.textSecondary,
                  transform: [{ translateX: multa.paid ? 24 : 0 }],
                },
              ]}
            >
              {multa.paid && <FontAwesome5 name="check" size={12} color="#fff" />}
            </View>
          </View>
          <Text style={styles.switchLabel}>{multa.paid ? "Pagada" : "Pendiente de pago"}</Text>
        </TouchableOpacity>

        {/* Botón guardar */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading}
          style={isLoading ? styles.saveButtonDisabled : null}
        >
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveButton}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <FontAwesome5 name="check" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Guardar multa</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  // Los estilos permanecen igual
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
  form: {
    gap: 16,
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
    gap: 12,
  },
  inputError: {
    borderColor: COLORS.danger,
    borderWidth: 1,
  },
  errorText: {
    color: COLORS.danger,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 8,
    fontSize: 12,
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
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  switchTrack: {
    width: 50,
    height: 26,
    borderRadius: 13,
    padding: 3,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  switchLabel: {
    color: COLORS.text,
    fontSize: 16,
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
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
})