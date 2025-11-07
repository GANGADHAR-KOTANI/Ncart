
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

//  Onboarding & Authentication Screens (Teammate flow)
import SplashScreen from "../screens/SplashScreen";
import GetStartedScreen from "../screens/GetStartedScreen";
import FastestDeliveryScreen from "../screens/FastestDeliveryScreen";
import ContactlessDeliveryScreen from "../screens/ContactlessDeliveryScreen";
import EnterMobileScreen from "../screens/EnterMobileScreen";
import VerifyOtpScreen from "../screens/VerifyOtpScreen";

//  Main App Screens (Your tab navigation)
import BottomTabNavigator from "./BottomTabNavigator"; // includes Home, Cart, etc.
import HomeScreen from "../screens/HomeScreen"; // for direct reference if needed

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
        {/*  Teammate’s onboarding flow */}
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

        {/* Optional: Direct HomeScreen (if you ever want to test it standalone) */}
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ animation: "slide_from_bottom" }}
        />

        {/*  Main App after OTP verified (Bottom Tabs) */}
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
