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

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { phone } = route.params;

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
  if (data.isNewUser) {
  // New user does NOT have token yet
  console.log("NEW USER → Waiting for register token");

  navigation.reset({
    index: 0,
    routes: [{ name: "HomeScreen", params: { phone, isNewUser: true } }],
  });
}


 else if (data.token) {
  await AsyncStorage.setItem("token", data.token);

  // 🔥 SAME FIX for existing user
  await new Promise(res => setTimeout(res, 50));

  console.log("TOKEN SAVED:", data.token);

  navigation.reset({
    index: 0,
    routes: [{ name: "MainTabs", params: { screen: "Shop" } }],
  });

}
 else {
    Alert.alert("Error", "Unexpected response. Please try again.");
  }
}

      else {
        Alert.alert("Error", data.message || "OTP verification failed.");
      }
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Please try again.");
      console.log("OTP Verify Error:", error);
    }
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.safeArea]}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Text style={[globalStyles.titleText, styles.heading]}>Enter your OTP</Text>
        <Text style={styles.subText}>We’ve sent a 6-digit code to {phone}</Text>

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
  wrapper: { flex: 1, alignItems: "center", justifyContent: "center" },
  heading: { color: COLORS.primary, fontWeight: "700", fontSize: 22, marginBottom: 8 },
  subText: { color: "#777", fontSize: 14, marginBottom: 40 },
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
  },
  verifyText: { color: COLORS.white, fontSize: 16, fontWeight: "600" },
});
