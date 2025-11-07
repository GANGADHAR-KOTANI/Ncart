// App.js
import React from "react";
import { SafeAreaView } from "react-native";
import SellerMainScreen from "./src/screens/SellerMainScreen";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SellerMainScreen />
    </SafeAreaView>
  );
}
