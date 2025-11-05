import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { COLORS, SIZES } from "../config/constants";
import { Ionicons } from "@expo/vector-icons";

export default function CategoryCheckbox({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.row}>
        <View
          style={[
            styles.checkbox,
            selected && { backgroundColor: COLORS.white, borderColor: COLORS.white },
          ]}
        >
          {selected && <Ionicons name="checkmark" size={16} color={COLORS.primary} />}
        </View>
        <Text style={[styles.label, selected && { color: COLORS.white }]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    padding: SIZES.small,
    marginVertical: 6,
    marginHorizontal: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.gray,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  label: {
    fontSize: SIZES.medium,
    color: COLORS.black,
  },
});
