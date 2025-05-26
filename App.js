import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from "./contexts/auth-context"; // 👈 Importar AuthProvider

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider> {/* 👈 Envolver con AuthProvider */}
        <View style={styles.container}>
          <StatusBar style="light" />
        </View>
      </AuthProvider> {/* 👈 Cerrar AuthProvider */}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});