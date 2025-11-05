import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../config/constants";
import globalStyles from "../globalStyles";
import { useNavigation } from "@react-navigation/native";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const navigation = useNavigation(); // ✅ added navigation hook

  const handleChange = (text, index) => {
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Move focus
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

  const handleVerify = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length === 6) {
      alert("OTP Verified Successfully 🎉");
      navigation.replace("HomeScreen"); // ✅ navigate to HomeScreen
    } else {
      alert("Please enter the complete OTP");
    }
  };

  return (
    <SafeAreaView style={[globalStyles.container, styles.safeArea]}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* 🧾 Heading */}
        <Text style={[globalStyles.titleText, styles.heading]}>
          Enter your OTP
        </Text>
        <Text style={styles.subText}>
          We’ve sent a 6-digit code to your number
        </Text>

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
            { opacity: otp.join("").length === 6 ? 1 : 0.6 },
          ]}
          onPress={handleVerify}
          disabled={otp.join("").length !== 6}
        >
          <Text style={styles.verifyText}>Verify OTP</Text>
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
  },

  /** OTP Boxes */
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

  /** Button */
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
