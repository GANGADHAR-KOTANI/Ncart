

import React, { useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios_api from "../config/axiosConfig";
import { COLORS } from "../config/constants";
import globalStyles from "../globalStyles";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function VerifyOtpScreen() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const inputs = useRef([]);
  const navigation = useNavigation();
  const route = useRoute();

  const phone = route.params?.phone;

  const handleSuccessfulOtp = async (responseData) => {
    try {
      const token = responseData?.token;
      if (token) {
        // ✅ Use the SAME key as CartScreen (token)
        await AsyncStorage.setItem("authToken", token);
        console.log("✅ Token saved in AsyncStorage:", token);

        // Navigate to main screen
        navigation.replace("MainTabs");
      } else {
        Alert.alert("Login failed", "No token returned from server");
      }
    } catch (err) {
      console.error("Saving token error", err);
      Alert.alert("Error", "Could not save auth token");
    }
  };

  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      if (text && index < 5) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleBackspace = (text, index) => {
    if (text === "" && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter all 6 digits");
      return;
    }

    try {
      setVerifying(true);
      console.log("🔍 Verifying OTP for:", phone);

      const response = await axios_api.post("/api/user/verify-otp", {
        phone,
        otp: enteredOtp,
      });

      console.log("✅ OTP Verification Response:", response.data);

      if (response.data.success) {
        Alert.alert("OTP Verified", "Welcome to NCart!");
        // ✅ Save token here
        await handleSuccessfulOtp(response.data);
      } else {
        Alert.alert("Invalid OTP", response.data.message || "Try again.");
      }
    } catch (error) {
      console.error("❌ OTP Verify Error:", error.response?.data || error.message);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong while verifying OTP."
      );
    } finally {
      setVerifying(false);
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
        <Text style={styles.subText}>
          We’ve sent a 6-digit code to {phone || "your mobile number"}
        </Text>

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
            { opacity: otp.join("").length === 6 && !verifying ? 1 : 0.6 },
          ]}
          onPress={handleVerify}
          disabled={verifying || otp.join("").length !== 6}
        >
          <Text style={styles.verifyText}>
            {verifying ? "Verifying..." : "Verify OTP"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    justifyContent: "center",
  },
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
    textAlign: "center",
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
  },
  verifyText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
