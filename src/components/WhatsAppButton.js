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
      // Eliminar el + para el esquema nativo
      phoneNumber = phoneNumber.replace("+", "");

      // Intentar primero con el esquema nativo
      const whatsappUrl = `whatsapp://send?phone=${phoneNumber}`;
      const canOpenWhatsApp = await Linking.canOpenURL(whatsappUrl);

      if (canOpenWhatsApp) {
        await Linking.openURL(whatsappUrl);
      } else {
        // Fallback para dispositivos sin WhatsApp
        const webUrl = `https://wa.me/${phoneNumber}`;
        const canOpenWeb = await Linking.canOpenURL(webUrl);

        if (canOpenWeb) {
          await Linking.openURL(webUrl);
        } else {
          Alert.alert(
            "Error",
            "WhatsApp no está instalado en este dispositivo."
          );
        }
      }
    } catch (error) {
      console.error("Error al abrir WhatsApp:", error);
      Alert.alert("Error", "No se pudo abrir WhatsApp.");
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
