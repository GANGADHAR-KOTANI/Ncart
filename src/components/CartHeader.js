
// ✅ src/components/CartHeader.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../config/constants";

export default function CartHeader({ title = "My Cart", onClear, showClear }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {showClear && (
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  clearText: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.danger,
  },
});
