import React, { useEffect } from "react";
import { View, Image, Text, StyleSheet } from "react-native";


export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("GetStarted"); // ✅ navigate after 2.5 seconds
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Logo container */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
        />
      </View>

      {/* App name */}
      <Text style={styles.appName}>SelectO Stores</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#009245",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 25,
    marginBottom: 15,
    elevation: 5, // adds shadow on Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  appName: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
