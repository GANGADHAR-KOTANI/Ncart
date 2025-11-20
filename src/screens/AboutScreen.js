// ✅ src/screens/AboutScreen.js
import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../config/constants";

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 24 }} />
      </View>

      
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.h1}>About Selecto</Text>
        <Text style={styles.p}>
          Selecto is a grocery & essentials delivery app built to make your life easier.
          We partner with local stores to bring fresh produce, pantry staples, and daily
          essentials right to your doorstep.
        </Text>

        <Text style={styles.h2}>App Version</Text>
        <Text style={styles.p}>1.0.0</Text>

        <Text style={styles.h2}>Contact Us</Text>
        <Text style={styles.p}>📧 support@selecto.com</Text>

        <Text style={styles.h2}>Terms & Privacy</Text>
        <Text style={styles.p}>
          By using Selecto, you agree to our Terms of Service and Privacy Policy. We are committed
          to protecting your data and ensuring transparency in how we handle it.
        </Text>

        <Text style={styles.footer}>
          © {new Date().getFullYear()} Selecto — All Rights Reserved
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  h1: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    color: COLORS.primary,
  },
  h2: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 20,
    color: COLORS.black,
  },
  p: {
    color: "#555",
    marginTop: 8,
    lineHeight: 20,
    fontSize: 14,
  },
  footer: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 13,
    color: COLORS.gray,
  },
});