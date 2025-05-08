import {View} from "react-native"
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Layout(){
    const insets = useSafeAreaInsets();

    return (
        <View style={{ flex: 1}}>
            <Stack
            screenOptions={{
                headerStyle : { backgroundColor: "#121212"},
                headerTintColor: "white",
                headerTitle: ""
            }} />
        </View>
    );
}