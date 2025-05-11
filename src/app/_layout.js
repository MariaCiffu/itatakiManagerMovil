"use client"

// app/_layout.js
import { View, StatusBar } from "react-native"
import { Stack } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useEffect, useState } from "react"

export default function Layout() {
  const insets = useSafeAreaInsets()
  const [ready, setReady] = useState(false)

  // Usar useEffect para retrasar el renderizado completo
  useEffect(() => {
    // Pequeño retraso para asegurar que useInsertionEffect haya terminado
    const timer = setTimeout(() => {
      setReady(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {ready ? (
        <View
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          <StatusBar barStyle="light-content" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: "#121212" },
              headerTintColor: "white",
              headerTitle: "",
              headerShown: false, // Ocultar el header por defecto
            }}
          />
        </View>
      ) : null}
    </GestureHandlerRootView>
  )
}