import { View, StatusBar, ActivityIndicator, Text } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/authContext";
import { COLORS } from "../constants/colors";

// 🔥 COMPONENTE QUE MANEJA LA NAVEGACIÓN SEGÚN AUTENTICACIÓN
function AuthNavigator() {
  const { state } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log("🔵 AuthNavigator - Estado:", {
      isLoading: state.isLoading,
      isAuthenticated: state.isAuthenticated,
      currentSegments: segments,
    });

    // No hacer nada mientras está cargando
    if (state.isLoading) return;

    const inAuthGroup = segments[0] === "auth";

    if (!state.isAuthenticated) {
      // Usuario NO autenticado
      if (!inAuthGroup) {
        console.log("🔵 Redirigiendo a login...");
        router.replace("/auth/login");
      }
    } else {
      // Usuario SÍ autenticado
      if (inAuthGroup) {
        console.log("🔵 Redirigiendo a home...");
        router.replace("/");
      }
    }
  }, [state.isAuthenticated, state.isLoading, segments]);

  // 🔥 PANTALLA DE CARGA
  if (state.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f8fafc",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#64748b",
          }}
        >
          Cargando...
        </Text>
      </View>
    );
  }

  // 🔥 RENDERIZAR STACK NORMAL
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#121212" },
        headerTintColor: "white",
        headerTitle: "",
        headerShown: false,
      }}
    />
  );
}

export default function Layout() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        {ready ? (
          <View
            style={{
              flex: 1,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              backgroundColor: "#121212",
            }}
          >
            <StatusBar
              barStyle="light-content"
              backgroundColor="#121212"
              translucent={false}
            />
            {/* 🔥 AQUÍ ESTÁ LA MAGIA - AuthNavigator maneja todo */}
            <AuthNavigator />
          </View>
        ) : null}
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
