import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FilterScreen from "../screens/FilterScreen";


// Screens
import SplashScreen from "../screens/SplashScreen";
import GetStartedScreen from "../screens/GetStartedScreen";
import FastestDeliveryScreen from "../screens/FastestDeliveryScreen";
import ContactlessDeliveryScreen from "../screens/ContactlessDeliveryScreen";
import EnterMobileScreen from "../screens/EnterMobileScreen";
import VerifyOtpScreen from "../screens/VerifyOtpScreen";
import HomeScreen from "../screens/HomeScreen"; // ✅ added
import BottomTabNavigator from "./BottomTabNavigator"; // ✅ merged from jahnavi
import EnterNameScreen from "../screens/EnterNameScreen"; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen
          name="FastestDelivery"
          component={FastestDeliveryScreen}
        />
        <Stack.Screen
          name="ContactlessDelivery"
          component={ContactlessDeliveryScreen}
        />
        <Stack.Screen
          name="EnterMobile"
          component={EnterMobileScreen}
          options={{ animation: "fade" }}
        />
        <Stack.Screen
          name="VerifyOtp"
          component={VerifyOtpScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen name="EnterNameScreen" component={EnterNameScreen} />
        {/* ✅ Added HomeScreen after OTP verification */}
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen
  name="FilterScreen"
  component={FilterScreen}
  options={{ animation: "slide_from_right" }}
/>

        {/* ✅ Added BottomTabNavigator from teammate’s code */}
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ animation: "fade" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
