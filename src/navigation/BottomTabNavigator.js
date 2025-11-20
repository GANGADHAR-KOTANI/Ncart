// src/navigation/BottomTabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../config/constants";

// Screens
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import CartScreen from "../screens/CartScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import AccountScreen from "../screens/AccountScreen";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          height: 60,
          borderTopWidth: 0.3,
          borderTopColor: "#ddd",
          backgroundColor: "#fff",
        },
        tabBarIcon: ({ color, focused }) => {
          const icons = {
            Shop: focused ? "home" : "home-outline",
            Explore: focused ? "search" : "search-outline",
            Cart: focused ? "cart" : "cart-outline",
            Favorites: focused ? "heart" : "heart-outline",
            Account: focused ? "person" : "person-outline",
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Shop"
        component={HomeScreen}
        options={{ tabBarLabel: "Shop" }}
      />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ tabBarBadgeStyle: { backgroundColor: COLORS.primary } }}
      />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}
