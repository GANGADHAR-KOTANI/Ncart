import React from "react";

import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { COLORS } from "./src/config/constants";

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <StatusBar style="dark" backgroundColor={COLORS.white} />
        <AppNavigator />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
});

