import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SellerMainScreen from "../screens/SellerMainScreen"; // ✅ newly added
import EnterMobileScreen from "../screens/EnterMobileScreen";
import VerifyOtpScreen from "../screens/VerifyOtpScreen";
import FilterScreen from "../screens/FilterScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SellerMain" // 👈 make seller screen the first one
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* 🏪 Seller main page (Two-column layout) */}
        <Stack.Screen
          name="SellerMain"
          component={SellerMainScreen}
          options={{
            animation: "fade",
          }}
        />

        {/* 📱 Enter Mobile Number */}
        <Stack.Screen
          name="EnterMobile"
          component={EnterMobileScreen}
          options={{
            animation: "fade",
          }}
        />

        {/* 🔐 Verify OTP */}
        <Stack.Screen
          name="VerifyOtp"
          component={VerifyOtpScreen}
          options={{
            animation: "slide_from_right",
          }}
        />

        {/* ⚙️ Filter Screen */}
        <Stack.Screen
          name="Filter"
          component={FilterScreen}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
