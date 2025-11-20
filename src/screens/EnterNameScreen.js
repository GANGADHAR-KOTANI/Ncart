import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { COLORS, API_URL } from "../config/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import getToken from "../utils/getToken";
import { useDispatch } from "react-redux";
import { fetchProfile } from "../redux/slices/profileSlice";

export default function EnterNameScreen({ phone, onComplete }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Please enter your name and Gmail");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();

      const res = await fetch(`${API_URL}/api/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ phone, name, email }),
      });

      const data = await res.json();
      setLoading(false);
if (res.ok && data.success) {

    // ⭐ Save token returned from register API
    if (data.token) {
      await AsyncStorage.setItem("token", data.token);
      await new Promise(r => setTimeout(r, 50));
      console.log("REGISTER TOKEN SAVED:", data.token);
    }

    // ⭐ Now fetch the profile using the real token
    await dispatch(fetchProfile());

    // close popup
    onComplete();

    // navigate to MainTabs
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs", params: { screen: "Shop" } }],
    });
}
 else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error("Register Error:", error);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>Welcome 👋</Text>
        <Text style={styles.subtitle}>
          Enter your name and Gmail to continue
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Your Name"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Your Gmail"
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.button, { opacity: name && email ? 1 : 0.6 }]}
          disabled={!name || !email || loading}
          onPress={handleSave}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,128,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  box: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    color: COLORS.primary,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
