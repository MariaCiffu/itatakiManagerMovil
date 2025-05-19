// components/MultaCard.js
import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Calendar, Check, Clock } from "react-native-feather";
import { COLORS } from "../../constants/colors";

const MultaCard = memo(function MultaCard({ multa, onPress }) {
  return (
    <TouchableOpacity style={styles.cardContainer} activeOpacity={0.9} onPress={() => onPress(multa)}>
      <LinearGradient colors={[COLORS.card, "#252525"]} style={styles.cardGradient}>
        <View style={styles.cardContent}>
          {/* Indicador de estado de pago */}
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: multa.paid ? `${COLORS.success}20` : `${COLORS.danger}20` },
            ]}
          >
            {multa.paid ? (
              <Check width={16} height={16} color={COLORS.success} />
            ) : (
              <Clock width={16} height={16} color={COLORS.danger} />
            )}
          </View>

          {/* Contenido principal */}
          <View style={styles.cardMain}>
            {/* Fecha y motivo */}
            <View style={styles.cardHeader}>
              <View style={styles.fechaContainer}>
                <Calendar width={14} height={14} color="#999" style={styles.fechaIcon} />
                <Text style={styles.fechaText}>{multa.date}</Text>
              </View>
              <Text style={styles.motivoText}>{multa.reason}</Text>
            </View>

            {/* Importe y estado */}
            <View style={styles.cardFooter}>
              <View style={styles.importeContainer}>
                <Text style={styles.importeText}>{multa.amount}€</Text>
              </View>
              <Text style={[styles.estadoText, { color: multa.paid ? COLORS.success : COLORS.danger }]}>
                {multa.paid ? "Pagado" : "Pendiente"}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  cardGradient: {
    borderRadius: 16,
    padding: 1, // Borde gradiente
  },
  cardContent: {
    flexDirection: "row",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 16,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardMain: {
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    marginBottom: 8,
  },
  fechaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  fechaIcon: {
    marginRight: 4,
  },
  fechaText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  motivoText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  importeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  importeText: {
    color: COLORS.warning,
    fontSize: 16,
    fontWeight: "bold",
  },
  estadoText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default MultaCard;