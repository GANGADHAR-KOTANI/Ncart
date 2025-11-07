// src/screens/EnterNameScreen.js
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
import { useDispatch } from "react-redux";
import { setToken, fetchUserProfile } from "../redux/slices/userSlice";

export default function EnterNameScreen({ phone, onComplete }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Please enter your name and Gmail");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, email }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        const token = data.token;
        if (!token) {
          Alert.alert("Error", "No token received from server");
          return;
        }

        // ✅ Save token + fetch fresh profile
        await AsyncStorage.setItem("token", token);
        dispatch(setToken(token));

        // Fetch new user's profile immediately
        await dispatch(fetchUserProfile()).unwrap().catch(() => {});

        onComplete(); // hide overlay
      } else {
        Alert.alert("Error", data.message || "Registration failed");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.error(error);
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
