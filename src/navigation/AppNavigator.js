import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import SplashScreen from "../screens/SplashScreen";
import GetStartedScreen from "../screens/GetStartedScreen";
import FastestDeliveryScreen from "../screens/FastestDeliveryScreen";
import ContactlessDeliveryScreen from "../screens/ContactlessDeliveryScreen";
import EnterMobileScreen from "../screens/EnterMobileScreen";
import VerifyOtpScreen from "../screens/VerifyOtpScreen";
import HomeScreen from "../screens/HomeScreen";
import EnterNameScreen from "../screens/EnterNameScreen";
import FilterScreen from "../screens/FilterScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import SingleProductPage from "../screens/SingleProductPage";

// Newly added screens
import CategoryStoreScreen from "../screens/CategoryStoreScreen";
import SellerMainScreen from "../screens/SellerMainScreen";
import SeeAllProductsScreen from "../screens/SeeAllProductsScreen";

// 🆕 Your Checkout Flow Screens
import Checkout from "../components/Checkout";
import AddAddress from "../components/AddAddress";
import PaymentSelection from "../components/PaymentSelection";
import OrderAccepted from "../components/OrderAccepted";
import AddressList from "../components/AddressList";
// Account-related
import AccountScreen from "../screens/AccountScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import OrdersScreen from "../screens/OrdersScreen";
import AddressesScreen from "../screens/AddressesScreen";
import AddAddressScreen from "../screens/AddAddressScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import HelpChatbotScreen from "../screens/HelpChatbotScreen";
import AboutScreen from "../screens/AboutScreen";


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
        {/* 🌱 Intro Screens */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="FastestDelivery" component={FastestDeliveryScreen} />
        <Stack.Screen name="ContactlessDelivery" component={ContactlessDeliveryScreen} />

        {/* 🔢 Auth Screens */}
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

        {/* 🏠 Home */}
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ animation: "slide_from_bottom" }}
        />

        {/* 🔍 Filter */}
        <Stack.Screen
          name="FilterScreen"
          component={FilterScreen}
          options={{ animation: "slide_from_right" }}
        />

        {/* Main Tabs */}
        <Stack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ animation: "fade" }}
        />

        {/* 🛒 Category & Seller Screens */}
        <Stack.Screen
          name="CategoryStoreScreen"
          component={CategoryStoreScreen}
          options={{ animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="SellerMainScreen"
          component={SellerMainScreen}
          options={{ animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="SeeAllProductsScreen"
          component={SeeAllProductsScreen}
          options={{ animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="SingleProduct"
          component={SingleProductPage}
          options={{ animation: "slide_from_right", headerShown: false }}
        />

        {/* 🆕 CHECKOUT FLOW SCREENS */}
        <Stack.Screen
          name="checkout"
          component={Checkout}
          options={{ animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="addAddress"
          component={AddAddress}
          options={{ animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="paymentSelection"
          component={PaymentSelection}
          options={{ animation: "slide_from_right" }}
        />

        <Stack.Screen
          name="orderAccepted"
          component={OrderAccepted}
          options={{ animation: "slide_from_bottom" }}
        />

        <Stack.Screen
          name="addressList"
          component={AddressList}
          options={{ animation: "slide_from_right" }}
        />
         <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        {/* ✅ Address Management */}
        <Stack.Screen name="Addresses" component={AddressesScreen}options={{ animation: "slide_from_right" }}/>
        <Stack.Screen name="AddAddress"component={AddAddressScreen}options={{ animation: "slide_from_bottom" }}/>
        {/* Other Pages */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="HelpChatbot" component={HelpChatbotScreen} />
        <Stack.Screen name="About" component={AboutScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
