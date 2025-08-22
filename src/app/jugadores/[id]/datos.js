// app/jugadores/[id]/datos.js - SIN CONTEXTO, CON FIREBASE
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
} from "react-native";
import { useState, useCallback, useEffect } from "react";
import { useLocalSearchParams, useGlobalSearchParams } from "expo-router";
import { getJugadorById } from "../../../services/playersService";
import {
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserFriendsIcon,
  FootIcon,
} from "../../../components/Icons";
import { MODERN_COLORS } from "../../../constants/modernColors";
import WhatsAppButton from "../../../components/WhatsAppButton";

export default function DatosPersonales() {
  const params = useGlobalSearchParams(); // 🆕 USAR GLOBAL PARAMS
  const playerId = params.id; // 🆕 OBTENER ID DEL GLOBAL PARAMS
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 CARGAR DATOS DESDE FIREBASE
  useEffect(() => {
    const loadPlayer = async () => {
      if (!playerId) {
        console.log("❌ No hay ID en datos.js:", playerId);
        setLoading(false);
        return;
      }

      try {
        console.log("🔥 Cargando datos del jugador en datos.js:", playerId);
        const playerData = await getJugadorById(playerId);

        if (playerData) {
          console.log("✅ Datos cargados en datos.js:", playerData.name);
          setPlayer(playerData);
        } else {
          console.log("❌ Jugador no encontrado en datos.js");
        }
      } catch (error) {
        console.error("❌ Error cargando jugador en datos.js:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlayer();
  }, [playerId]); // 🆕 DEPENDER DE playerId

  // Función optimizada para realizar llamadas
  const handleCall = useCallback((phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  }, []);

  // Función optimizada para enviar emails
  const handleEmail = useCallback(() => {
    if (player?.email) {
      Linking.openURL(`mailto:${player.email}`);
    }
  }, [player?.email]);

  // 📄 MOSTRAR LOADING
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Cargando datos del jugador...</Text>
      </View>
    );
  }

  // 📄 MOSTRAR ERROR SI NO HAY DATOS
  if (!player) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.errorText}>No se pudieron cargar los datos</Text>
      </View>
    );
  }

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
            <Text style={styles.dataValue}>
              {player.birthdate || "No especificada"}
            </Text>
          </View>
        </View>

        {/* Pie dominante */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#FF9800" }]}>
            <FootIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Pie dominante</Text>
            <Text style={styles.dataValue}>
              {player.foot || "No especificado"}
            </Text>
          </View>
        </View>

        {/* Teléfono con botón de llamada */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#2196F3" }]}>
            <PhoneIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Móvil</Text>
            <Text style={styles.dataValue}>
              {player.phone || "No especificado"}
            </Text>
          </View>

          {/* Contenedor para los botones de acción */}
          <View style={styles.actionButtonsContainer}>
            {player.phone && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#2196F3" }]}
                onPress={() => handleCall(player.phone)}
                activeOpacity={0.8}
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
            <Text style={styles.dataValue}>
              {player.email || "No especificado"}
            </Text>
          </View>
          {player.email && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
              onPress={handleEmail}
              activeOpacity={0.8}
            >
              <EnvelopeIcon size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Sección de contacto de emergencia */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>
          Contacto de emergencia
        </Text>

        {/* Contacto de emergencia */}
        <View style={styles.dataRow}>
          <View style={[styles.iconContainer, { backgroundColor: "#9C27B0" }]}>
            <UserFriendsIcon size={24} color="#fff" />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataLabel}>Nombre contacto</Text>
            <Text style={styles.dataValue}>
              {player.emergencyContact || "No especificado"}
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
            <Text style={styles.dataValue}>
              {player.emergencyPhone || "No especificado"}
            </Text>
          </View>

          {/* Contenedor para los botones de acción */}
          <View style={styles.actionButtonsContainer}>
            {player.emergencyPhone && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: "#673AB7" }]}
                onPress={() => handleCall(player.emergencyPhone)}
                activeOpacity={0.8}
              >
                <PhoneIcon size={16} color="#fff" />
              </TouchableOpacity>
            )}

            {/* Botón de WhatsApp */}
            {player.emergencyPhone && (
              <WhatsAppButton
                phone={player.emergencyPhone}
                message={`Hola ${player.emergencyContact || "contacto"}, soy el entrenador de ${player.name}.`}
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
    backgroundColor: MODERN_COLORS.background,
    padding: 16,
  },

  // 📄 ESTILOS DE LOADING
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: MODERN_COLORS.textGray,
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: MODERN_COLORS.danger,
    fontSize: 16,
    fontWeight: "500",
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: MODERN_COLORS.textDark,
    fontWeight: "bold",
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: MODERN_COLORS.primary,
    paddingLeft: 8,
  },
  dataRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,

    // 🆕 Sombra moderna
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    color: MODERN_COLORS.textGray,
    fontSize: 14,
    marginBottom: 4,
    fontWeight: "500",
  },
  dataValue: {
    color: MODERN_COLORS.textDark,
    fontSize: 16,
    fontWeight: "600",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,

    // 🆕 Sombra para botones
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
});
