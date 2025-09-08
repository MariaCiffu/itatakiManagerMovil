import { StyleSheet, TouchableOpacity, Linking, Alert } from "react-native";
import { WhatsAppIcon } from "./Icons";

const WhatsAppButton = ({ phone, size = 24, color = "#25D366" }) => {
  const openWhatsApp = async () => {
    try {
      // Formatear número de teléfono
      let phoneNumber = phone.replace(/\s+/g, "");
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = `+34${phoneNumber}`;
      }
      phoneNumber = phoneNumber.replace("+", "");

      // Intentar abrir directamente la app de WhatsApp
      await Linking.openURL(`whatsapp://send?phone=${phoneNumber}`);
    } catch (error) {
      console.warn(
        "No se pudo abrir WhatsApp nativo, intentando web...",
        error
      );

      try {
        // Fallback al enlace web oficial de WhatsApp
        await Linking.openURL(
          `https://api.whatsapp.com/send?phone=${phoneNumber}`
        );
      } catch (err) {
        console.error("Error al abrir WhatsApp:", err);
        Alert.alert("Error", "No se pudo abrir WhatsApp.");
      }
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, { width: size + 16, height: size + 16 }]}
      onPress={openWhatsApp}
      activeOpacity={0.7}
    >
      <WhatsAppIcon size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    backgroundColor: "rgba(37, 211, 102, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WhatsAppButton;
