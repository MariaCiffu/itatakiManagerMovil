import { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckIcon, ClockIcon, CalendarIcon } from "../../components/Icons";
import { MODERN_COLORS } from "../../constants/modernColors";

const MultaCard = memo(function MultaCard({ multa, onPress }) {
  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.9}
      onPress={() => onPress(multa)}
    >
      <View style={styles.cardContent}>
        {/* Indicador de estado de pago */}
        <View
          style={[
            styles.statusIndicator,
            {
              backgroundColor: multa.paid
                ? `${MODERN_COLORS.success}15`
                : `${MODERN_COLORS.danger}15`,
            },
          ]}
        >
          {multa.paid ? (
            <CheckIcon size={16} color={MODERN_COLORS.success} />
          ) : (
            <ClockIcon size={16} color={MODERN_COLORS.danger} />
          )}
        </View>

        {/* Contenido principal */}
        <View style={styles.cardMain}>
          {/* Fecha y motivo */}
          <View style={styles.cardHeader}>
            <View style={styles.fechaContainer}>
              <CalendarIcon size={14} color={MODERN_COLORS.textGray} />
              <Text style={styles.fechaText}>{multa.date}</Text>
            </View>
            <Text style={styles.motivoText} numberOfLines={2}>
              {multa.reason}
            </Text>
          </View>

          {/* Importe y estado */}
          <View style={styles.cardFooter}>
            <View style={styles.importeContainer}>
              <Text style={styles.importeText}>{multa.amount}€</Text>
            </View>
            <View
              style={[
                styles.estadoBadge,
                {
                  backgroundColor: multa.paid
                    ? `${MODERN_COLORS.success}15`
                    : `${MODERN_COLORS.danger}15`,
                },
              ]}
            >
              <Text
                style={[
                  styles.estadoText,
                  {
                    color: multa.paid
                      ? MODERN_COLORS.success
                      : MODERN_COLORS.danger,
                  },
                ]}
              >
                {multa.paid ? "Pagado" : "Pendiente"}
              </Text>
            </View>
          </View>
        </View>

        {/* Indicador visual derecho */}
        <View
          style={[
            styles.rightIndicator,
            {
              backgroundColor: multa.paid
                ? MODERN_COLORS.success
                : MODERN_COLORS.danger,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.surface,

    // Sombra moderna
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,

    // Borde sutil
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    position: "relative",
  },

  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  cardMain: {
    flex: 1,
    justifyContent: "space-between",
  },

  cardHeader: {
    marginBottom: 12,
  },

  fechaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },

  fechaText: {
    color: MODERN_COLORS.textGray,
    fontSize: 12,
    fontWeight: "500",
  },

  motivoText: {
    color: MODERN_COLORS.textDark,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
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
    color: MODERN_COLORS.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  estadoText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  rightIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
});
