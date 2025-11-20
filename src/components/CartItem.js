// ✅ src/components/CartItem.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS } from "../config/constants";

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
  onDelete,
  disabled,
}) {
  const name = item?.name || "Unnamed Product";
  const price = Number(item?.price ?? 0);
  const qty = Number(item?.quantity ?? 1);
  const total = Number(item?.total ?? price * qty);

  const imageUri =
    Array.isArray(item?.image) && item.image.length > 0
      ? item.image[0]
      : typeof item?.image === "string"
      ? item.image
      : "https://cdn-icons-png.flaticon.com/512/3081/3081559.png";

  return (
    <View style={styles.container}>
      {/* 🖼 Image */}
      <Image source={{ uri: imageUri }} style={styles.image} />

      {/* 🛒 Product Info */}
      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.price}>₹{price}</Text>

        {/* Quantity Control */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.btn, disabled && { opacity: 0.5 }]}
            onPress={onDecrease}
            disabled={disabled}
          >
            <Text style={styles.btnText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.qty}>{qty}</Text>

          <TouchableOpacity
            style={[styles.btn, disabled && { opacity: 0.5 }]}
            onPress={onIncrease}
            disabled={disabled}
          >
            <Text style={styles.btnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ❌ Delete & Total */}
      <View style={styles.right}>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={onDelete}
          disabled={disabled}
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.total}>₹{total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginRight: 10,
  },
  details: { flex: 1 },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 4,
  },
  price: { fontSize: 13, color: COLORS.gray, marginBottom: 6 },
  controls: { flexDirection: "row", alignItems: "center" },
  btn: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  btnText: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  qty: { marginHorizontal: 10, fontSize: 16, color: COLORS.black },
  right: { alignItems: "flex-end" },
  deleteBtn: { padding: 4 },
  deleteText: { color: COLORS.gray, fontSize: 14, fontWeight: "bold" },
  total: {
    fontWeight: "bold",
    fontSize: 15,
    color: COLORS.black,
    marginTop: 6,
  },
});
