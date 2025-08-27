import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";

const StepIndicator = ({ steps, currentStep, onStepPress }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        const isClickable = index <= currentStep + 1; // Permitir navegar al siguiente paso

        return (
          <React.Fragment key={step.id}>
            {index > 0 && (
              <View
                style={[
                  styles.connector,
                  isCompleted
                    ? styles.connectorCompleted
                    : styles.connectorIncomplete,
                ]}
              />
            )}

            <TouchableOpacity
              style={[styles.step, !isClickable && styles.stepDisabled]}
              onPress={() => onStepPress && isClickable && onStepPress(index)}
              disabled={!onStepPress || !isClickable}
              activeOpacity={isClickable ? 0.7 : 1}
            >
              <View
                style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isCompleted && styles.stepCircleCompleted,
                  !isClickable && styles.stepCircleDisabled,
                ]}
              >
                {isCompleted ? (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={MODERN_COLORS.textWhite}
                  />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isActive && styles.stepNumberActive,
                      !isClickable && styles.stepNumberDisabled,
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>

              <Text
                style={[
                  styles.stepTitle,
                  isActive && styles.stepTitleActive,
                  isCompleted && styles.stepTitleCompleted,
                  !isClickable && styles.stepTitleDisabled,
                ]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
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
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: MODERN_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  step: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minWidth: 0, // Permite que el texto se ajuste
  },

  stepDisabled: {
    opacity: 0.5,
  },

  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderWidth: 2,
    borderColor: MODERN_COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },

  stepCircleActive: {
    backgroundColor: MODERN_COLORS.primary,
    borderColor: MODERN_COLORS.primary,
  },

  stepCircleCompleted: {
    backgroundColor: MODERN_COLORS.success,
    borderColor: MODERN_COLORS.success,
  },

  stepCircleDisabled: {
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderColor: MODERN_COLORS.border,
  },

  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: MODERN_COLORS.textGray,
  },

  stepNumberActive: {
    color: MODERN_COLORS.textWhite,
  },

  stepNumberDisabled: {
    color: MODERN_COLORS.textLight,
  },

  stepTitle: {
    fontSize: 10,
    fontWeight: "500",
    color: MODERN_COLORS.textGray,
    textAlign: "center",
    paddingHorizontal: 2,
  },

  stepTitleActive: {
    color: MODERN_COLORS.primary,
    fontWeight: "600",
    fontSize: 11,
  },

  stepTitleCompleted: {
    color: MODERN_COLORS.success,
    fontWeight: "600",
  },

  stepTitleDisabled: {
    color: MODERN_COLORS.textLight,
  },

  connector: {
    height: 2,
    width: 20,
    marginHorizontal: 4,
    borderRadius: 1,
  },

  connectorCompleted: {
    backgroundColor: MODERN_COLORS.success,
  },

  connectorIncomplete: {
    backgroundColor: MODERN_COLORS.border,
  },
});

export default StepIndicator;
