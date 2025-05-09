import React from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"

const { width, height } = Dimensions.get("window")
const FIELD_RATIO = 0.65 // Proporción del campo respecto a la altura de la pantalla

const FootballField = ({ children, colors }) => {
  // Colores por defecto si no se proporcionan
  const fieldColors = colors || {
    field: "#3a9d3a",
    fieldDark: "#358a35",
    fieldLines: "#ffffff",
  }

  return (
    <View style={styles.fieldContainer}>
      <LinearGradient
        colors={[fieldColors.field, fieldColors.fieldDark]}
        style={styles.fieldGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={[styles.field, { borderColor: fieldColors.fieldLines }]}>
          {/* Líneas del campo */}
          <View style={[styles.centerLine, { backgroundColor: fieldColors.fieldLines }]} />
          <View style={[styles.centerCircle, { borderColor: fieldColors.fieldLines }]} />
          <View style={[styles.centerDot, { backgroundColor: fieldColors.fieldLines }]} />

          <View style={[styles.penaltyBoxTop, { borderColor: fieldColors.fieldLines }]}>
            <View style={[styles.goalBoxTop, { borderColor: fieldColors.fieldLines }]} />
            <View style={[styles.penaltyArcTop, { borderColor: fieldColors.fieldLines }]} />
            <View style={[styles.penaltyDotTop, { backgroundColor: fieldColors.fieldLines }]} />
          </View>

          <View style={[styles.penaltyBoxBottom, { borderColor: fieldColors.fieldLines }]}>
            <View style={[styles.goalBoxBottom, { borderColor: fieldColors.fieldLines }]} />
            <View style={[styles.penaltyArcBottom, { borderColor: fieldColors.fieldLines }]} />
            <View style={[styles.penaltyDotBottom, { backgroundColor: fieldColors.fieldLines }]} />
          </View>

          {/* Renderizar los hijos (jugadores) */}
          {children}
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
  fieldContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  fieldGradient: {
    width: width - 32,
    height: height * FIELD_RATIO,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  field: {
    width: "100%",
    height: "100%",
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
  },
  // Líneas del campo
  centerLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    top: "50%",
  },
  centerCircle: {
    position: "absolute",
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    borderWidth: 2,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -width * 0.15 }, { translateY: -width * 0.15 }],
  },
  centerDot: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    top: "50%",
    left: "50%",
    transform: [{ translateX: -3 }, { translateY: -3 }],
  },
  penaltyBoxTop: {
    position: "absolute",
    width: "60%",
    height: "20%",
    borderWidth: 2,
    borderTopWidth: 0,
    top: 0,
    left: "20%",
  },
  goalBoxTop: {
    position: "absolute",
    width: "30%",
    height: "40%",
    borderWidth: 2,
    borderTopWidth: 0,
    top: 0,
    left: "35%",
  },
  penaltyArcTop: {
    position: "absolute",
    width: width * 0.2,
    height: width * 0.1,
    borderBottomLeftRadius: width * 0.1,
    borderBottomRightRadius: width * 0.1,
    borderWidth: 2,
    borderTopWidth: 0,
    top: "60%",
    left: "50%",
    transform: [{ translateX: -width * 0.1 }],
  },
  penaltyDotTop: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    top: "70%",
    left: "50%",
    transform: [{ translateX: -3 }],
  },
  penaltyBoxBottom: {
    position: "absolute",
    width: "60%",
    height: "20%",
    borderWidth: 2,
    borderBottomWidth: 0,
    bottom: 0,
    left: "20%",
  },
  goalBoxBottom: {
    position: "absolute",
    width: "30%",
    height: "40%",
    borderWidth: 2,
    borderBottomWidth: 0,
    bottom: 0,
    left: "35%",
  },
  penaltyArcBottom: {
    position: "absolute",
    width: width * 0.2,
    height: width * 0.1,
    borderTopLeftRadius: width * 0.1,
    borderTopRightRadius: width * 0.1,
    borderWidth: 2,
    borderBottomWidth: 0,
    bottom: "60%",
    left: "50%",
    transform: [{ translateX: -width * 0.1 }],
  },
  penaltyDotBottom: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    bottom: "70%",
    left: "50%",
    transform: [{ translateX: -3 }],
  },
})

export default FootballField