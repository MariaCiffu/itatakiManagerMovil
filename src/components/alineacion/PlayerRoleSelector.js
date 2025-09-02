import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MODERN_COLORS } from "../../constants/modernColors";
import { availableRoles } from "../../data/roles";

const PlayerRoleSelector = ({
  player,
  specialRoles,
  onUpdateSpecialRoles,
  onClose,
}) => {
  // Función para alternar un rol
  const toggleRole = (roleId) => {
    const newRoles = { ...specialRoles };

    if (newRoles[roleId] === player.id) {
      newRoles[roleId] = null;
    } else {
      newRoles[roleId] = player.id;
    }

    onUpdateSpecialRoles(newRoles);
  };

  // Función para renderizar el indicador (icono o letra)
  const renderIndicator = (role, isAssigned) => {
    if (role.type === "icon") {
      return (
        <View
          style={[
            styles.iconBadge,
            {
              backgroundColor: isAssigned
                ? role.backgroundColor
                : MODERN_COLORS.surfaceGray,
              borderColor: isAssigned
                ? role.backgroundColor
                : MODERN_COLORS.border,
            },
          ]}
        >
          <Ionicons
            name={isAssigned ? role.icon.replace("-outline", "") : role.icon}
            size={18}
            color={
              isAssigned
                ? role.iconColor || MODERN_COLORS.textWhite
                : MODERN_COLORS.textGray
            }
          />
        </View>
      );
    } else if (role.type === "letter") {
      return (
        <View
          style={[
            styles.letterBadge,
            {
              backgroundColor: isAssigned
                ? role.backgroundColor
                : MODERN_COLORS.surfaceGray,
              borderColor: isAssigned
                ? role.backgroundColor
                : MODERN_COLORS.border,
            },
          ]}
        >
          <Text
            style={[
              styles.letterText,
              {
                color: isAssigned ? role.letterColor : MODERN_COLORS.textGray,
                fontWeight: isAssigned ? "700" : "500",
              },
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
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Roles especiales</Text>
          <Text style={styles.subtitle}>{player.name}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={20} color={MODERN_COLORS.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.rolesContainer}
        showsVerticalScrollIndicator={false}
      >
        {availableRoles.map((role) => {
          const isAssigned = specialRoles[role.id] === player.id;
          const isAssignedToOther =
            specialRoles[role.id] && specialRoles[role.id] !== player.id;

          return (
            <TouchableOpacity
              key={role.id}
              style={[styles.roleButton, isAssigned && styles.roleButtonActive]}
              onPress={() => toggleRole(role.id)}
              activeOpacity={0.8}
            >
              {renderIndicator(role, isAssigned)}

              <View style={styles.roleInfo}>
                <Text
                  style={[
                    styles.roleName,
                    {
                      color: isAssigned
                        ? MODERN_COLORS.textDark
                        : MODERN_COLORS.textGray,
                    },
                  ]}
                >
                  {role.name}
                </Text>
                {isAssignedToOther && (
                  <Text style={styles.warningText}>
                    Asignado a otro jugador
                  </Text>
                )}
              </View>

              {isAssigned && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={MODERN_COLORS.success}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.doneButton} onPress={onClose}>
        <Text style={styles.doneButtonText}>Listo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: MODERN_COLORS.surface,
    borderRadius: 16,
    maxHeight: "80%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: MODERN_COLORS.border,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: MODERN_COLORS.textDark,
    letterSpacing: -0.2,
  },

  subtitle: {
    fontSize: 14,
    color: MODERN_COLORS.textGray,
    marginTop: 2,
    fontWeight: "500",
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: MODERN_COLORS.surfaceGray,
    justifyContent: "center",
    alignItems: "center",
  },

  rolesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },

  roleButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: MODERN_COLORS.surfaceGray,
    borderWidth: 1,
    borderColor: MODERN_COLORS.border,
  },

  roleButtonActive: {
    backgroundColor: `${MODERN_COLORS.success}15`,
    borderColor: `${MODERN_COLORS.success}40`,
  },

  roleInfo: {
    flex: 1,
    marginLeft: 12,
  },

  roleName: {
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.1,
  },

  warningText: {
    color: MODERN_COLORS.danger,
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },

  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  letterText: {
    fontSize: 14,
    fontWeight: "600",
  },

  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  doneButton: {
    backgroundColor: MODERN_COLORS.primary,
    marginHorizontal: 20,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  doneButtonText: {
    color: MODERN_COLORS.textWhite,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

export default PlayerRoleSelector;
