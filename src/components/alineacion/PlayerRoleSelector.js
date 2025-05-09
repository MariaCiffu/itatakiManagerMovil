import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PlayerRoleSelector = ({
  player,
  specialRoles,
  onUpdateSpecialRoles,
  onClose,
  theme,
}) => {
  // Definición de los roles disponibles
  const availableRoles = [
  { 
    id: "captain", 
    name: "Capitán", 
    type: "letter",
    letter: "C",
    letterColor: "#000000",
    backgroundColor: "#FFC107"  // Amarillo/Dorado
  },
  { 
    id: "freeKicks", 
    name: "Faltas lejanas", 
    type: "letter",
    letter: "F",
    letterColor: "#FFFFFF",
    backgroundColor: "#FF5722"  // Naranja/Rojo
  },
  {
    id: "freeKicksNear",
    name: "Faltas cercanas",
    type: "letter",
    letter: "f",
    letterColor: "#000000",
    backgroundColor: "#FF9800"  // Naranja
  },
  { 
    id: "corners", 
    name: "Córners", 
    type: "icon", 
    icon: "flag-outline",
    iconColor: "#FFFFFF",
    backgroundColor: "#2196F3"  // Azul
  },
  { 
    id: "penalties", 
    name: "Penaltis", 
    type: "letter",
    letter: "P",
    letterColor: "#FFFFFF",
    backgroundColor: "#E91E63"  // Rosa/Fucsia
  },
];

  // Función para alternar un rol
  const toggleRole = (roleId) => {
    const newRoles = { ...specialRoles };

    // Si este jugador ya tiene este rol, quitárselo
    if (newRoles[roleId] === player.id) {
      newRoles[roleId] = null;
    }
    // Si otro jugador tiene este rol, quitárselo y asignarlo a este jugador
    else {
      newRoles[roleId] = player.id;
    }

    onUpdateSpecialRoles(newRoles);
  };

  const colors = theme || {
    modalContent: "#333333",
    text: "#ffffff",
    textSecondary: "#cccccc",
    modalBorder: "#444444",
  };

  // Función para renderizar el indicador (icono o letra)
const renderIndicator = (role, isAssigned) => {
  if (role.type === "icon") {
    return (
      <View 
        style={[
          styles.iconBadge, 
          { 
            backgroundColor: isAssigned ? role.backgroundColor : "#555",
          }
        ]}
      >
        <Ionicons
          name={isAssigned ? role.icon.replace("-outline", "") : role.icon}
          size={20}
          color={isAssigned ? (role.iconColor || "#FFFFFF") : "#ccc"}
        />
      </View>
    );
  } else if (role.type === "letter") {
    return (
      <View 
        style={[
          styles.letterBadge, 
          { 
            backgroundColor: isAssigned ? role.backgroundColor : "#555",
          }
        ]}
      >
        <Text 
          style={[
            styles.letterText, 
            { 
              color: isAssigned ? role.letterColor : "#ccc",
              fontWeight: isAssigned ? "bold" : "normal"
            }
          ]}
        >
          {role.letter}
        </Text>
      </View>
    );
  }
  return null;
};

  return (
    <View style={[styles.container, { backgroundColor: colors.modalContent }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Roles especiales para {player.name}
      </Text>

      {availableRoles.map((role) => {
        const isAssigned = specialRoles[role.id] === player.id;
        const isAssignedToOther =
          specialRoles[role.id] && specialRoles[role.id] !== player.id;

        return (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleButton,
              { backgroundColor: isAssigned ? "#1a3a1a" : "#333" },
              { borderColor: colors.modalBorder },
            ]}
            onPress={() => toggleRole(role.id)}
          >
            {renderIndicator(role, isAssigned)}
            <Text
              style={[styles.roleName, { color: isAssigned ? "#fff" : "#ccc" }]}
            >
              {role.name}
            </Text>
            {isAssignedToOther && (
              <Text style={styles.warningText}>(Asignado a otro jugador)</Text>
            )}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Cerrar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignSelf: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    marginBottom: 8,
    borderWidth: 1,
  },
  roleName: {
    marginLeft: 10,
    flex: 1,
  },
  warningText: {
    color: "#F44336",
    fontSize: 12,
    marginLeft: 5,
  },
  closeButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  letterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  iconBadge: {
  width: 24,
  height: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
},
});

export default PlayerRoleSelector;