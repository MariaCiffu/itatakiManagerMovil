// src/app/partidos/[id]/editar.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import StepIndicator from "../../../components/partido/StepIndicator";
import {
  getPartidoByIdWithDelay,
  updatePartidoWithDelay,
} from "../../../services/partidosService";
import LineupScreen from "../../alineacion"; // Asegúrate de que la ruta sea correcta

export default function EditarPartidoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [partidoData, setPartidoData] = useState(null);

  // Referencias para guardar datos de cada paso
  const alineacionRef = useRef(null);

  // Pasos del flujo - Cambiado el orden: alineación antes que estrategia
  const steps = [
    { id: "info", title: "Información" },
    { id: "rival", title: "Rival" },
    { id: "alineacion", title: "Alineación" }, // Ahora es el tercer paso
    { id: "estrategia", title: "Estrategia" }, // Ahora es el cuarto paso
  ];

  // Cargar datos del partido
  useEffect(() => {
    loadPartido();
  }, [id]);

  const loadPartido = async () => {
    try {
      setLoading(true);
      const data = await getPartidoByIdWithDelay(id);
      if (data) {
        // Asegurarse de que la fecha es un objeto Date
        data.fecha = new Date(data.fecha);

        // Asegurar que los nuevos campos existen
        if (!data.notasRival) data.notasRival = "";
        if (!data.lugarEspecifico) data.lugarEspecifico = "";

        // Renombrar notas a estrategia si es necesario
        if (data.notas && !data.estrategia) {
          data.estrategia = data.notas;
          delete data.notas;
        }

        setPartidoData(data);
      } else {
        // Manejar caso de partido no encontrado
        Alert.alert("Error", "Partido no encontrado");
        router.replace("/partidos");
      }
    } catch (error) {
      console.error("Error al cargar partido:", error);
      Alert.alert("Error", "No se pudo cargar el partido");
      router.replace("/partidos");
    } finally {
      setLoading(false);
    }
  };

  // Función para avanzar al siguiente paso
  const nextStep = () => {
    // Si estamos en el paso de alineación, guardar los datos antes de avanzar
    if (currentStep === 2 && alineacionRef.current) {
      const alineacionData = alineacionRef.current.getAlineacionData();
      setPartidoData((prev) => ({ ...prev, alineacion: alineacionData }));
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Si estamos en el último paso (estrategia), guardar directamente
      actualizarPartido();
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
    // Si estamos en el paso de alineación, guardar los datos antes de cambiar
    if (currentStep === 2 && alineacionRef.current) {
      const alineacionData = alineacionRef.current.getAlineacionData();
      setPartidoData((prev) => ({ ...prev, alineacion: alineacionData }));
    }

    // Solo permitir navegar a pasos anteriores o al siguiente paso
    if (index <= currentStep + 1) {
      setCurrentStep(index);
    }
  };

  // Función para manejar cambio de fecha
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || partidoData.fecha;
    setShowDatePicker(Platform.OS === "ios");
    setPartidoData({ ...partidoData, fecha: currentDate });
  };

  // Función para actualizar los datos del partido
  const actualizarPartido = async () => {
    try {
      setSaving(true);

      // Si la alineación se maneja por referencia
      if (alineacionRef.current) {
        const alineacionData = alineacionRef.current.getAlineacionData();
        setPartidoData((prev) => ({ ...prev, alineacion: alineacionData }));
      }

      // Actualizar el partido
      const partidoActualizado = await updatePartidoWithDelay(id, partidoData);
      console.log("Partido actualizado:", partidoActualizado);

      // Mostrar mensaje de éxito
      Alert.alert(
        "Partido actualizado",
        "Los cambios se han guardado correctamente",
        [
          {
            text: "OK",
            onPress: () => router.replace(`/partidos/${id}`),
          },
        ]
      );
    } catch (error) {
      console.error("Error al actualizar partido:", error);
      Alert.alert("Error", "No se pudo actualizar el partido");
      setSaving(false);
    }
  };

  // Renderizar el paso actual
  const renderStep = () => {
    if (!partidoData) return null;

    switch (steps[currentStep].id) {
      case "info":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Información del partido</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Jornada</Text>
              <TextInput
                style={styles.input}
                value={partidoData.jornada}
                onChangeText={(text) =>
                  setPartidoData({ ...partidoData, jornada: text })
                }
                keyboardType="numeric"
                placeholder="Número de jornada"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fecha</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {partidoData.fecha.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={partidoData.fecha}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Lugar</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    partidoData.lugar === "Casa" && styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    setPartidoData({ ...partidoData, lugar: "Casa" })
                  }
                >
                  <Text style={styles.radioText}>Local</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    partidoData.lugar === "Fuera" && styles.radioButtonSelected,
                  ]}
                  onPress={() =>
                    setPartidoData({ ...partidoData, lugar: "Fuera" })
                  }
                >
                  <Text style={styles.radioText}>Visitante</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campo adicional para lugar específico cuando es visitante */}
            {partidoData.lugar === "Fuera" && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lugar específico</Text>
                <TextInput
                  style={styles.input}
                  value={partidoData.lugarEspecifico}
                  onChangeText={(text) =>
                    setPartidoData({ ...partidoData, lugarEspecifico: text })
                  }
                  placeholder="Ej: Estadio Santiago Bernabéu"
                  placeholderTextColor="#999"
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.nextButton,
                !partidoData.jornada && styles.buttonDisabled,
              ]}
              onPress={nextStep}
              disabled={!partidoData.jornada}
            >
              <Text style={styles.nextButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        );

      case "rival":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Información del rival</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre del equipo rival</Text>
              <TextInput
                style={styles.input}
                value={partidoData.rival}
                onChangeText={(text) =>
                  setPartidoData({ ...partidoData, rival: text })
                }
                placeholder="Introduce el nombre del equipo rival"
                placeholderTextColor="#999"
              />
            </View>

            {/* Nuevo campo para notas del rival */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas sobre el rival</Text>
              <TextInput
                style={[styles.input, styles.textAreaRival]}
                value={partidoData.notasRival}
                onChangeText={(text) =>
                  setPartidoData({ ...partidoData, notasRival: text })
                }
                placeholder="Información sobre el rival, jugadores clave, etc."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.nextButton,
                !partidoData.rival && styles.buttonDisabled,
              ]}
              onPress={nextStep}
              disabled={!partidoData.rival}
            >
              <Text style={styles.nextButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        );

      case "alineacion": // Ahora es el tercer paso
        return (
          <View style={styles.alineacionContainer}>
            <LineupScreen
              ref={alineacionRef}
              matchday={parseInt(partidoData.jornada) || 0}
              isEmbedded={true}
              initialData={partidoData.alineacion}
              onSaveLineup={(lineupData) => {
                setPartidoData({ ...partidoData, alineacion: lineupData });
              }}
            />

            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
              <Text style={styles.nextButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        );

      case "estrategia": // Ahora es el cuarto paso (último)
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Estrategia para el partido</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Estrategia y observaciones</Text>
              <TextInput
                style={[styles.input, styles.textAreaEstrategia]}
                value={partidoData.estrategia}
                onChangeText={(text) =>
                  setPartidoData({ ...partidoData, estrategia: text })
                }
                placeholder="Define la estrategia para este partido, instrucciones tácticas, etc."
                placeholderTextColor="#999"
                multiline={true}
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={actualizarPartido}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar cambios</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Cargando partido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevStep} style={styles.backButtonHeader}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar partido</Text>
      </View>

      <StepIndicator
        steps={steps}
        currentStep={currentStep}
        onStepPress={handleStepPress}
      />

      <ScrollView style={styles.content}>{renderStep()}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    backgroundColor: "#4CAF50", // Color verde para el encabezado
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ccc",
    fontSize: 16,
    marginTop: 16,
  },
  stepContainer: {
    padding: 16,
  },
  alineacionContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  dateText: {
    color: "#fff",
  },
  textAreaEstrategia: {
    height: 450,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  textAreaRival: {
    height: 350,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  radioButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#333",
    alignItems: "center",
    marginHorizontal: 4,
  },
  radioButtonSelected: {
    backgroundColor: "#4CAF50",
  },
  radioText: {
    color: "#fff",
    fontSize: 16,
  },
  nextButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#4CAF50",
    alignItems: "center",
    marginTop: 20,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#2196F3",
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});