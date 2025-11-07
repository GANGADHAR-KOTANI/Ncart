// src/screens/VerifyOtpScreen.js
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, API_URL } from "../config/constants";
import globalStyles from "../globalStyles";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import { setToken, fetchUserProfile } from "../redux/slices/userSlice";

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { phone } = route.params;

  /** 🔢 Handle OTP input */
  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      if (text && index < 5) inputs.current[index + 1].focus();
    }
  };

  const handleBackspace = (text, index) => {
    if (text === "" && index > 0) inputs.current[index - 1].focus();
  };

  /** ✅ Verify OTP */
  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6)
      return Alert.alert("Invalid OTP", "Please enter a 6-digit code.");

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/user/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: enteredOtp }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        // 🧩 CASE 1: Existing user → backend gives token
        if (data.token) {
          await AsyncStorage.setItem("token", data.token);
          dispatch(setToken(data.token));

          // ✅ Fetch latest user profile immediately
          await dispatch(fetchUserProfile()).unwrap().catch(() => {});

         // reset to the tab navigator. MainTabs should have HomeScreen as default tab.
navigation.reset({
  index: 0,
  routes: [{ name: "MainTabs", params: { screen: "Home", params: { phone, isNewUser: true } } }],
});

        }
        // 🧩 CASE 2: New user → show name/email overlay
        else if (data.isNewUser) {
          navigation.reset({
            index: 0,
            routes: [{ name: "HomeScreen", params: { phone, isNewUser: true } }],
          });
        } else {
          Alert.alert("Error", "Unexpected response. Please try again.");
        }
      } else {
        Alert.alert("Error", data.message || "OTP verification failed.");
      }
    } catch (error) {
      setLoading(false);
      console.log("OTP Verify Error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.safeArea]}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={[globalStyles.titleText, styles.heading]}>
          Enter your OTP
        </Text>
        <Text style={styles.subText}>We’ve sent a 6-digit code to {phone}</Text>

        {/* 🔘 OTP Inputs */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(t) => handleChange(t, index)}
              onKeyPress={({ nativeEvent }) =>
                nativeEvent.key === "Backspace" && handleBackspace("", index)
              }
            />
          ))}
        </View>

        {/* ✅ Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            { opacity: otp.join("").length === 6 && !loading ? 1 : 0.6 },
          ]}
          onPress={handleVerify}
          disabled={otp.join("").length !== 6 || loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.verifyText}>Verify OTP</Text>
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { justifyContent: "center" },
  wrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 22,
    marginBottom: 8,
  },
  subText: {
    color: "#777",
    fontSize: 14,
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
    marginBottom: 50,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    textAlign: "center",
    fontSize: 18,
    color: COLORS.primary,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 5,
  },
  verifyButton: {
    width: "80%",
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
