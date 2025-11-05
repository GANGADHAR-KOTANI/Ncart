import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function GetStartedScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.replace("SignIn")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        <Image
          source={require("../../assets/image1.png")}
          style={styles.illustration}
        />
        <Text style={styles.title}>Your Organic Online Store</Text>
        <Text style={styles.subtitle}>
          Get your Products Handy with in Minutes from your local stores.
          Shop fruits, veggies, and essentials where you daily go and purchase.
        </Text>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomContainer}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: "#009245" }]} />
          <View style={[styles.dot, { backgroundColor: "#D3D3D3" }]} />
          <View style={[styles.dot, { backgroundColor: "#D3D3D3" }]} />
        </View>

        {/* Next Button */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate("FastestDelivery")}
        >
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 2,
  },
  // ✅ updated skipText color to green (#009245)
  skipText: {
    color: "#009245",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  illustration: {
    width: 436,
    height: 437,
    resizeMode: "contain",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
  },
  bottomContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    position: "relative",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  nextButton: {
    position: "absolute",
    right: 25,
    bottom: 0,
  },
  nextText: {
    color: "#009245",
    fontWeight: "600",
    fontSize: 16,
  },
});
