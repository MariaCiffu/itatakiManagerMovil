// app/_layout.js
import { View, StatusBar } from "react-native"
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
    const insets = useSafeAreaInsets();

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ 
                flex: 1, 
                paddingTop: insets.top,
                paddingBottom: insets.bottom,
            }}>
                <StatusBar barStyle="light-content" />
                <Stack
                    screenOptions={{
                        headerStyle: { backgroundColor: "#121212"},
                        headerTintColor: "white",
                        headerTitle: "",
                        headerShown: false, // Ocultar el header por defecto
                    }} 
                />
            </View>
        </GestureHandlerRootView>
    );
}