import { StyleSheet, View, TouchableHighlight, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router"; // 👈 IMPORTANTE

export function Main() {
  const insets = useSafeAreaInsets();
  const router = useRouter(); // 👈 Para navegación

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View style={styles.container}>
        <TouchableHighlight
          underlayColor="#09f"
          onPress={() => router.push("/jugadores")} // 👈 NAVEGACIÓN
          style={{
            backgroundColor: "red",
            width: 200,
            height: 200,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>Ver jugadores</Text>
        </TouchableHighlight>

        <Text
          style={{ marginTop: 20, backgroundColor: "blue", color: "white" }}
        >
          huhukhuj
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center", // centra horizontalmente
    justifyContent: "center", // centra verticalmente
  },
});
