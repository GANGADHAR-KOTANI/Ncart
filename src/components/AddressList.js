import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { setDefaultAddress } from "../redux/slices/address";

export default function AddressList({ navigation }) {
  const dispatch = useDispatch();
  const addresses = useSelector((state) => state.address.addresses);

  const [selectedId, setSelectedId] = useState(
    addresses.find((a) => a.isDefault)?.id || null
  );

  const handleSubmit = () => {
    if (!selectedId) return alert("Select an address first!");
    dispatch(setDefaultAddress(selectedId));

    navigation.reset({
      index: 0,
      routes: [{ name: "checkout" }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select Delivery Address</Text>

        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedId(item.id)}
            >
              <View style={styles.row}>
                <View style={styles.radioOuter}>
                  {selectedId === item.id && <View style={styles.radioInner} />}
                </View>

                <View style={styles.addressInfo}>
                  <Text style={styles.addressLine}>{item.addressLine}</Text>
                  <Text style={styles.city}>
                    {item.city}, {item.state} - {item.pincode}
                  </Text>
                </View>
              </View>

              {item.isDefault && (
                <Text style={styles.defaultText}>Default</Text>
              )}
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity
          style={styles.addAddressBtn}
          onPress={() => navigation.navigate("addAddress")}
        >
          <Text style={styles.addBtnText}>+ Add New Address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitText}>Deliver to This Address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 16, flex: 1 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  row: { flexDirection: "row", alignItems: "center" },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 12,
    height: 12,
    backgroundColor: "#000",
    borderRadius: 6,
  },
  addressInfo: { flex: 1 },
  addressLine: { fontSize: 16, fontWeight: "600", color: "#333" },
  city: { fontSize: 14, color: "#555" },
  defaultText: { marginTop: 5, color: "green", fontWeight: "bold" },

  addAddressBtn: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#28A745",
    alignItems: "center",
  },
  addBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#28A745",
  },

  submitBtn: {
    marginTop: "auto",
    backgroundColor: "#28A745",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
