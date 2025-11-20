import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile, fetchProfile } from "../redux/slices/profileSlice";
import { COLORS } from "../config/constants";

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.profile); // <-- unified selector

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [saving, setSaving] = useState(false);

  // keep local inputs in sync when the store user updates
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name cannot be empty");
      return;
    }

    try {
      setSaving(true);

      // Make sure updateProfile thunk resolves/throws so we can handle outcome
      const result = await dispatch(updateProfile({ name, email })).unwrap();

      // If your updateProfile returns the updated user, you could optimistically update the store here.
      // But to be consistent and ensure all derived UI gets refreshed, call fetchProfile and wait for it.
      await dispatch(fetchProfile()).unwrap();

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (err) {
      // unwrap() throws if thunk rejected, so handle that message
      const msg = (err && err.message) || String(err) || "Failed to update profile";
      Alert.alert("Error", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 50 }}
        />
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={[styles.input, { backgroundColor: "#f3f3f3" }]}
            value={phone ? String(phone) : ""}
            editable={false}
            placeholder="Phone number"
          />

          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.black },
  form: { marginTop: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 6,
    fontSize: 15,
    color: "#222",
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 25,
  },
  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
