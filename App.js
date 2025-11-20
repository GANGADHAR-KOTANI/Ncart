import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet, Platform } from "react-native";
import { Provider } from "react-redux";
import { store } from "./src/redux/store";
import AppNavigator from "./src/navigation/AppNavigator";
import { COLORS } from "./src/config/constants";

export default function App() {
  return (
    <Provider store={store}>
      <View style={styles.appWrapper}>

        {/* ⭐ Fake green area for iOS status bar */}
        {Platform.OS === "ios" && <View style={styles.iosStatusBar} />}

        {/* ⭐ Status bar text color for both platforms */}
        <StatusBar style="light" />

        <AppNavigator />
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  appWrapper: {
    flex: 1,
    backgroundColor: COLORS.primary, // must be green under iOS notch
  },

  iosStatusBar: {
    height: Platform.OS === "ios" ? 60 : 0, // iPhone notch height
    backgroundColor: COLORS.primary,       // green
  },
});
