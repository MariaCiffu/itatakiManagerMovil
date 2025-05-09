import { View, Text, StyleSheet } from "react-native"
import { CornerIcon } from "../../components/Icons";

const PlayerRoleIndicators = ({ player, specialRoles }) => {
  if (!player) return null

  const isRoleAssigned = (roleType) => specialRoles[roleType] === player.id

  // Recopilar todos los roles asignados con sus colores específicos
  const assignedRoles = []
  if (isRoleAssigned("captain")) 
    assignedRoles.push({ 
      type: "captain", 
      element: <Text style={[styles.roleText, { color: "#000000" }]}>C</Text>, 
      color: "#FFC107" // Amarillo/Dorado
    })
  
  if (isRoleAssigned("freeKicks")) 
    assignedRoles.push({ 
      type: "freeKicks", 
      element: <Text style={[styles.roleText, { color: "#FFFFFF" }]}>F</Text>, 
      color: "#FF5722" // Naranja/Rojo
    })
  
  if (isRoleAssigned("freeKicksNear")) 
    assignedRoles.push({ 
      type: "freeKicksNear", 
      element: <Text style={[styles.roleText, { color: "#000000" }]}>f</Text>, 
      color: "#FF9800" // Naranja
    })
  
  if (isRoleAssigned("corners")) 
    assignedRoles.push({ 
      type: "corners", 
      element: <CornerIcon color="#FFFFFF" />, 
      color: "#2196F3" // Azul
    })
  
  if (isRoleAssigned("penalties")) 
    assignedRoles.push({ 
      type: "penalties", 
      element: <Text style={[styles.roleText, { color: "#FFFFFF" }]}>P</Text>, 
      color: "#E91E63" // Rosa/Fucsia
    })

  // Si no hay roles asignados, no renderizar nada
  if (assignedRoles.length === 0) return null

  // Calcular posiciones en círculo
  return (
    <View style={styles.container}>
      {assignedRoles.map((role, index) => {
        let angle;
        
        // Si solo hay un rol, colocarlo en la posición de las "2" del reloj
        if (assignedRoles.length === 1) {
          // Aproximadamente 60 grados o π/3 radianes desde la vertical
          angle = Math.PI / 3;
        } else {
          // Distribuir los roles en un semicírculo en la parte superior
          // Empezar desde la posición de las "10" del reloj y terminar en las "2"
          const startAngle = (3 * Math.PI) / 6; // Posición de las "10" (150 grados)
          const endAngle = Math.PI / 6;         // Posición de las "2" (30 grados)
          
          // Calcular el ángulo para cada rol
          if (assignedRoles.length > 1) {
            const angleRange = startAngle - endAngle;
            angle = startAngle - (index * angleRange) / (assignedRoles.length - 1);
          } else {
            angle = Math.PI / 3; // Por si acaso, aunque este caso ya está cubierto
          }
        }
        
        // Radio del círculo donde se colocarán los indicadores
        const radius = 28
        
        // Calcular posición X e Y basada en el ángulo
        const x = Math.sin(angle) * radius
        const y = -Math.cos(angle) * radius
        
        return (
          <View
            key={role.type}
            style={[
              styles.roleBadgeBase,
              { 
                backgroundColor: role.color,
                transform: [
                  { translateX: x },
                  { translateY: y }
                ]
              }
            ]}
          >
            {role.element}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 0, // Punto central
    height: 0, // Punto central
    top: 23, // Centro del círculo del jugador (ajustar según el tamaño)
    left: 23, // Centro del círculo del jugador (ajustar según el tamaño)
    zIndex: 10,
  },
  roleBadgeBase: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    // Centrar el badge en su posición calculada
    marginLeft: -11,
    marginTop: -11,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "bold",
  }
})

export default PlayerRoleIndicators