import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function FastestDeliveryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("EnterMobile")}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration */}
      <Image
        source={require("../../assets/image2.png")}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title */}
      <Text style={styles.title}>Fastest Delivery</Text>

      {/* Description */}
      <Text style={styles.description}>
        We do Eagle Speed Delivery with best handling{"\n"}
        and get the most products very precious{"\n"}
        and delivery like our own products.
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
          <View style={[styles.dot, { backgroundColor: "#4CAF50" }]} />
          <View style={[styles.dot, { backgroundColor: "#ccc" }]} />
        </View>

        {/* Next (no box, just text) */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation.navigate("ContactlessDelivery")}
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
    alignItems: "center",
    paddingHorizontal: 20,
  },
  skipButton: {
    position: "absolute",
    top: 55,
    right: 25,
  },
  skipText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  image: {
    width: 430,
    height: 412,
    marginTop: height * 0.13,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginTop: 35, // ⬆️ moved slightly up (was 45)
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginTop: 10, // ⬆️ slightly reduced gap from title (was 18)
    marginBottom: 55, // ⬆️ small upward adjustment (was 60)
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
