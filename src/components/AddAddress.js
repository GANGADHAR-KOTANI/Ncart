import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { addAddress } from "../redux/slices/address";

export default function AddAddress({ navigation }) {
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
  });

  const handleInput = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const submitAddress = () => {
    if (
      !form.name ||
      !form.phone ||
      !form.addressLine ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all required fields");
      return;
    }

    dispatch(addAddress(form));
    navigation.navigate("addressList");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Delivery Address</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          onChangeText={(val) => handleInput("name", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="Phone"
          keyboardType="numeric"
          maxLength={10}
          onChangeText={(val) => handleInput("phone", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="House No, Street"
          onChangeText={(val) => handleInput("addressLine", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="Landmark (optional)"
          onChangeText={(val) => handleInput("landmark", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="City"
          onChangeText={(val) => handleInput("city", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="State"
          onChangeText={(val) => handleInput("state", val)}
        />

        <TextInput
          style={styles.input}
          placeholder="Pincode"
          keyboardType="numeric"
          maxLength={6}
          onChangeText={(val) => handleInput("pincode", val)}
        />

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => handleInput("isDefault", !form.isDefault)}
        >
          <View
            style={[
              styles.checkbox,
              form.isDefault && styles.checkboxActive
            ]}
          />
          <Text style={styles.checkboxText}>Set as default address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={submitAddress}>
          <Text style={styles.saveText}>Save Address</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    padding: 22,
    backgroundColor: "#F9FAFB",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 14,
    fontSize: 15,
    elevation: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#28A745",
    borderRadius: 5,
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: "#28A745",
  },
  checkboxText: {
    fontSize: 16,
    color: "#444",
  },
  saveBtn: {
    backgroundColor: "#28A745",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },
});
