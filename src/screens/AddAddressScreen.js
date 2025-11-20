// ✅ src/screens/AddAddressScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { addAddress as addAddressThunk } from "../redux/slices/profileSlice";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../config/constants";

export default function AddAddressScreen() {
  const route = useRoute();
  const existing = route.params?.address;
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [label, setLabel] = useState(existing?.label ?? "");
  const [house, setHouse] = useState(existing?.house ?? "");
  const [street, setStreet] = useState(existing?.street ?? "");
  const [city, setCity] = useState(existing?.city ?? "");
  const [state, setState] = useState(existing?.state ?? "");
  const [pincode, setPincode] = useState(existing?.pincode ?? "");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
  (async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission required", "Please enable location access to add your address.");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log("📍 LOCATION COORDS:", location.coords); // ✅ Add this line

    setLatitude(location.coords.latitude);
    setLongitude(location.coords.longitude);
  })();
}, []);


  // 📍 Request location permission and get coordinates
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please enable location access to add your address."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
      console.log("📍 User location:", location.coords);
    })();
  }, []);

  const onSave = async () => {
    if (!house || !street || !city || !state || !pincode) {
      return Alert.alert("Validation", "Please fill all the fields.");
    }
    if (!latitude || !longitude) {
      return Alert.alert("Location Error", "Unable to fetch location coordinates.");
    }

    setSaving(true);
    try {
      await dispatch(
        addAddressThunk({
          label,
          house,
          street,
          city,
          state,
          pincode,
          latitude,
          longitude,
          isDefault: false,
        })
      ).unwrap();

      Alert.alert("✅ Success", "Address saved successfully!");
      navigation.goBack();
    } catch (err) {
      console.error("❌ Add address error:", err);
      Alert.alert("Error", err || "Could not save address");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.label}>Label (Home / Work)</Text>
        <TextInput
          style={styles.input}
          value={label}
          onChangeText={setLabel}
          placeholder="e.g., Home"
        />

        <Text style={styles.label}>House / Flat No.</Text>
        <TextInput
          style={styles.input}
          value={house}
          onChangeText={setHouse}
          placeholder="e.g., Plot No. 21"
        />

        <Text style={styles.label}>Street / Area</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
          placeholder="e.g., Inorbit Mall Road"
        />

        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="e.g., Hyderabad"
        />

        <Text style={styles.label}>State</Text>
        <TextInput
          style={styles.input}
          value={state}
          onChangeText={setState}
          placeholder="e.g., Telangana"
        />

        <Text style={styles.label}>Pincode</Text>
        <TextInput
          style={styles.input}
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric"
          placeholder="e.g., 500081"
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.6 }]}
          onPress={onSave}
          disabled={saving}
        >
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save Address"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { marginTop: 12, marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  saveBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});