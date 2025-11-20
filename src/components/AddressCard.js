// ✅ src/components/AddressCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../config/constants";

export default function AddressCard({ address, onEdit, onDelete, primary }) {
  return (
    <View style={[styles.container, primary && styles.primary]}>
      <View style={{ flex: 1 }}>
        {/* Label (Home / Work / etc.) */}
        <View style={styles.rowBetween}>
          <Text style={styles.label}>{address.label || "Address"}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>

        {/* Full address */}
        <Text style={styles.addressText}>
          {[
            address.house,
            address.street,
            address.city,
            address.state,
            address.pincode,
          ]
            .filter(Boolean)
            .join(", ")}
        </Text>
      </View>

      {/* Edit / Delete Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.iconBtn}>
          <Ionicons name="pencil" size={18} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconBtn}>
          <Ionicons name="trash" size={18} color="#E53935" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  primary: {
    borderColor: COLORS.primary,
    backgroundColor: "#F4FBFF",
  },
  label: {
    fontWeight: "700",
    marginBottom: 6,
    fontSize: 15,
    color: COLORS.black,
  },
  addressText: {
    color: "#444",
    fontSize: 14,
    lineHeight: 20,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  iconBtn: { padding: 6 },
});