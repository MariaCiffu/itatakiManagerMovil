// src/components/StepIndicator.js
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const StepIndicator = ({ steps, currentStep, onStepPress }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <View 
                style={[
                  styles.connector, 
                  isCompleted ? styles.connectorCompleted : styles.connectorIncomplete
                ]} 
              />
            )}
            
            <TouchableOpacity
              style={[
                styles.step,
                isActive && styles.stepActive,
                isCompleted && styles.stepCompleted,
              ]}
              onPress={() => onStepPress && onStepPress(index)}
              disabled={!onStepPress}
            >
              <Text 
                style={[
                  styles.stepNumber,
                  (isActive || isCompleted) && styles.stepNumberActive
                ]}
              >
                {index + 1}
              </Text>
              <Text 
                style={[
                  styles.stepTitle,
                  (isActive || isCompleted) && styles.stepTitleActive
                ]}
              >
                {step.title}
              </Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#1e1e1e",
  },
  step: {
    alignItems: "center",
    justifyContent: "center",
  },
  stepActive: {
    // Estilos para el paso activo
  },
  stepCompleted: {
    // Estilos para pasos completados
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#333",
    color: "#ccc",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 4,
  },
  stepNumberActive: {
    backgroundColor: "#4CAF50",
    color: "#fff",
  },
  stepTitle: {
    fontSize: 12,
    color: "#ccc",
  },
  stepTitleActive: {
    color: "#fff",
    fontWeight: "bold",
  },
  connector: {
    height: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  connectorCompleted: {
    backgroundColor: "#4CAF50",
  },
  connectorIncomplete: {
    backgroundColor: "#333",
  },
});

export default StepIndicator;