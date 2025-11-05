import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ContactlessDeliveryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Illustration */}
      <Image
        source={require("../../assets/image3.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Contactless Delivery</Text>

      {/* Description */}
      <Text style={styles.description}>
        We also Have the Zipla pay Where UPI is not required.
      </Text>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Prev */}
        <TouchableOpacity
          style={styles.prevButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.prevText}>Prev</Text>
        </TouchableOpacity>

        {/* Dots */}
        <View style={styles.dotsContainer}>
          <View style={[styles.dot, { backgroundColor: "#ccc" }]} />
          <View style={[styles.dot, { backgroundColor: "#ccc" }]} />
          <View style={[styles.dot, { backgroundColor: "#4CAF50" }]} />
        </View>

        {/* Start (was Next) */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate("EnterMobile")}
        >
          <Text style={styles.nextText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  image: {
    width: 430,
    height: 421,
    marginTop: height * 0.12,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    textAlign: "center",
    marginTop: 35,
  },
  description: {
    fontSize: 15,
    color: "#7C7C7C",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 15,
    marginBottom: 70,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "92%",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
  },
  prevButton: {
    left: 0,
  },
  prevText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
  nextButton: {
    right: 0,
  },
  nextText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
