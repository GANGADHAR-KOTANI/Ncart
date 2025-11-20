// ✅ src/components/CartSummary.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../config/constants";

export default function CartSummary({
  subtotal,
  deliveryFee = 0,
  total,
  onCheckout,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Subtotal</Text>
        <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery Fee</Text>
        <Text style={styles.value}>
          {deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : "Free"}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.checkoutBtn} onPress={onCheckout}>
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  label: { fontSize: 15, color: COLORS.gray },
  value: { fontSize: 15, fontWeight: "600", color: COLORS.black },
  divider: { height: 1, backgroundColor: "#ddd", marginVertical: 6 },
  totalLabel: { fontSize: 17, fontWeight: "bold", color: COLORS.black },
  totalValue: { fontSize: 17, fontWeight: "bold", color: COLORS.primary },
  checkoutBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  checkoutText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
