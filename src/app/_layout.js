import { View, StatusBar } from "react-native"
import { Stack } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useEffect, useState } from "react"
import { AuthProvider } from "../context/authContext"

export default function Layout() {
  const insets = useSafeAreaInsets()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

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
            <StatusBar barStyle="light-content" backgroundColor="#121212" translucent={false} />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: "#121212" },
                headerTintColor: "white",
                headerTitle: "",
                headerShown: false,
              }}
            />
          </View>
        ) : null}
      </AuthProvider>
    </GestureHandlerRootView>
  )
}