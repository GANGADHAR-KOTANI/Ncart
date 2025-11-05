// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Import screens
import SplashScreen from "./src/screens/SplashScreen";
import GetStartedScreen from "./src/screens/GetStartedScreen";
import FastestDeliveryScreen from "./src/screens/FastestDeliveryScreen";
import ContactlessDeliveryScreen from "./src/screens/ContactlessDeliveryScreen";



const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="FastestDelivery" component={FastestDeliveryScreen} />
        <Stack.Screen
          name="ContactlessDelivery"
          component={ContactlessDeliveryScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
