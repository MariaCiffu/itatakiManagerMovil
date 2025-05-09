// app/_layout.js
import {View, StatusBar} from "react-native"
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout(){
    const insets = useSafeAreaInsets();

    return (
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
            }} />
        </View>
    );
}