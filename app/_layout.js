import { View, StatusBar, ActivityIndicator, Text } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect, useState } from "react";
// 🔥 CORREGIDO: Usar el hook en lugar del contexto
import { useAuth } from "../src/hooks/useFirebase";
import { COLORS } from "../src/constants/colors";

// 🔥 COMPONENTE QUE MANEJA LA NAVEGACIÓN SEGÚN AUTENTICACIÓN
function AuthNavigator() {
  // 🔥 CORREGIDO: Usar el hook directamente
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    console.log("🔵 AuthNavigator - Estado:", {
      loading,
      isAuthenticated,
      hasUser: !!user,
      currentSegments: segments,
    });

    // No hacer nada mientras está cargando
    if (loading) return;

    // 🔥 FILTRAR RUTAS DEL SISTEMA
    const filteredSegments = segments.filter(
      (segment) =>
        !segment.startsWith("_") && // Filtrar _sitemap, _layout, etc.
        segment !== "" &&
        segment !== "index"
    );

    const inAuthGroup = filteredSegments[0] === "auth";

    if (!isAuthenticated) {
      // Usuario NO autenticado
      if (!inAuthGroup && filteredSegments.length > 0) {
        console.log("🔵 Usuario no autenticado, redirigiendo a login...");
        router.replace("/auth/login");
      } else if (filteredSegments.length === 0) {
        // Está en root pero no autenticado
        console.log("🔵 En root sin autenticar, redirigiendo a login...");
        router.replace("/auth/login");
      }
    } else {
      // Usuario SÍ autenticado
      if (inAuthGroup) {
        console.log("🔵 Usuario autenticado en auth, redirigiendo a home...");
        router.replace("/");
      }
    }
  }, [isAuthenticated, loading, segments, router, user]);

  // 🔥 PANTALLA DE CARGA
  if (loading) {
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
            fontWeight: "500",
          }}
        >
          Verificando autenticación...
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
      {/* 🔥 CORREGIDO: Sin AuthProvider, solo el hook */}
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
      ) : (
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
              fontWeight: "500",
            }}
          >
            Iniciando aplicación...
          </Text>
        </View>
      )}
    </GestureHandlerRootView>
  );
}
