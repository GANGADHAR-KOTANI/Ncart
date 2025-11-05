import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SellerMainScreen from "../screens/SellerMainScreen";
import EnterMobileScreen from "../screens/EnterMobileScreen";
import VerifyOtpScreen from "../screens/VerifyOtpScreen";
import FilterScreen from "../screens/FilterScreen";
import SplashScreen from "../screens/SplashScreen";
import GetStartedScreen from "../screens/GetStartedScreen";
import FastestDeliveryScreen from "../screens/FastestDeliveryScreen";
import ContactlessDeliveryScreen from "../screens/ContactlessDeliveryScreen";

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
        <Stack.Screen
          name="SellerMain"
          component={SellerMainScreen}
          options={{ animation: "fade" }}
        />
        
        
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
