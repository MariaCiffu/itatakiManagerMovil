// app/jugadores/[id]/datos.js
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useContext } from "react";
import { PlayerContext } from "../../../context/PlayerContext";
import {
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserFriendsIcon,
  FootIcon,
} from "../../../components/Icons";
import { COLORS } from "../../../constants/colors";
import WhatsAppButton from "../../../components/WhatsAppButton";

export default function DatosPersonales() {
  const player = useContext(PlayerContext);

  const handleCall = () => {
    if (player.phone) {
      Linking.openURL(`tel:${player.phone}`);
    }
  };

  const handleEmail = () => {
    if (player.email) {
      Linking.openURL(`mailto:${player.email}`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos personales</Text>

        {/* Fecha de nacimiento */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#FF5252" }]}>
            <CalendarIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Fecha de nacimiento</Text>
            <Text style={styles.dataValue}>{player.birthdate || "-"}</Text>
          </View>
        </View>

        {/* Pie dominante */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#FF9800" }]}>
            <FootIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Pie dominante</Text>
            <Text style={styles.dataValue}>{player.foot || "-"}</Text>
          </View>
        </View>

        {/* Teléfono con botón de llamada */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#2196F3" }]}>
            <PhoneIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Móvil</Text>
            <Text style={styles.dataValue}>{player.phone || "-"}</Text>
          </View>

          {/* Contenedor para los botones de acción */}
          <View style={styles.actionButtonsContainer}>
            {player.phone && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
                onPress={handleCall}
              >
                <PhoneIcon size={16} color="#fff" />
              </TouchableOpacity>
            )}

            {/* Botón de WhatsApp */}
            {player.phone && (
              <WhatsAppButton
                phone={player.phone}
                message={`Hola ${player.name}, soy el entrenador.`}
              />
            )}
          </View>
        </View>

        {/* Correo con botón de email */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#4CAF50" }]}>
            <EnvelopeIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Correo</Text>
            <Text style={styles.dataValue}>{player.email || "-"}</Text>
          </View>
          {player.email && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={handleEmail}
            >
              <EnvelopeIcon size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Contacto de emergencia */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#9C27B0" }]}>
            <UserFriendsIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Nombre contacto</Text>
            <Text style={styles.dataValue}>
              {player.emergencyContact || "-"}
            </Text>
          </View>
        </View>

        {/* Teléfono de contacto */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#673AB7" }]}>
            <PhoneIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Móvil contacto</Text>
            <Text style={styles.dataValue}>{player.emergencyPhone || "-"}</Text>
          </View>

          {/* Contenedor para los botones de acción */}
          <View style={styles.actionButtonsContainer}>
            {player.emergencyPhone && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#673AB7" }]}
                onPress={handleCall}
              >
                <PhoneIcon size={16} color="#fff" />
              </TouchableOpacity>
            )}

            {/* Botón de WhatsApp */}
            {player.emergencyPhone && (
              <WhatsAppButton
                phone={player.emergencyPhone}
                message={`Hola ${player.emergencyContact}, soy el entrenador.`}
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.text,
    fontWeight: "bold",
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    paddingLeft: 8,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  dataInfo: {
    flex: 1,
  },
  dataLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  dataValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "500",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // Aumentar el espacio entre botones
  },
});
