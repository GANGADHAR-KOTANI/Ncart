import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Keyboard,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { COLORS } from "../config/constants";
import { ArrowRight } from "lucide-react-native";
import { AntDesign } from "@expo/vector-icons";
import axios_api from "../config/axiosConfig"; // ✅ Add this

const { height } = Dimensions.get("window");

export default function EnterMobileScreen({ navigation }) {
  const [selectedCode, setSelectedCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const imageHeight = useState(new Animated.Value(height * 0.5))[0];

  //  Animate image height when keyboard opens
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      Animated.timing(imageHeight, {
        toValue: height * 0.3,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      Animated.timing(imageHeight, {
        toValue: height * 0.5,
        duration: 300,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  //  Send OTP API Call
const handleSendOtp = async () => {
  if (!mobile || mobile.length !== 10) {
    Alert.alert("Invalid Number", "Please enter a valid 10-digit mobile number");
    return;
  }

  try {
    const fullPhone = `${selectedCode}${mobile}`;
    console.log(" Sending OTP to:", fullPhone);

    const response = await axios_api.post("/api/user/send-otp", { phone: fullPhone });
    console.log(" OTP API Response:", response.data);

    if (response.data.success) {
      Alert.alert("OTP Sent", "Please check your phone for the verification code.");
      navigation.navigate("VerifyOtp", { phone: fullPhone }); // ✅ pass phone to OTP screen
    } else {
      Alert.alert("Failed", response.data.message || "Could not send OTP");
    }
  } catch (error) {
    console.error(" OTP Send Error (Full):", {
      message: error.message,
      url: error.config?.url,
      data: error.config?.data,
      response: error.response?.data,
      status: error.response?.status,
    });
    Alert.alert(
      "Error",
      `Something went wrong while sending OTP\n\nDetails: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.fullScreen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/*  Top Image Section */}
        <Animated.View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={require("../../assets/grocery.png")}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
        </Animated.View>

        {/*  Bottom Section */}
        <Animated.View
          style={[
            styles.bottomSection,
            {
              top: Animated.add(imageHeight, new Animated.Value(-height * 0.05)),
            },
          ]}
        >
          <Text style={styles.heading}>Enter your mobile number</Text>

          {/* Country Picker + Input */}
          <View style={styles.inputRow}>
            <View style={styles.countryPicker}>
              <Picker
                selectedValue={selectedCode}
                onValueChange={(value) => setSelectedCode(value)}
                style={styles.picker}
                dropdownIconColor={COLORS.primary}
              >
                <Picker.Item label="+91 🇮🇳" value="+91" />
                <Picker.Item label="+1 🇺🇸" value="+1" />
                <Picker.Item label="+44 🇬🇧" value="+44" />
              </Picker>
            </View>

            <TextInput
              style={styles.numberInput}
              placeholder="Enter number"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={(t) => setMobile(t.replace(/\D/g, ""))}
            />
          </View>

          {/*  Send OTP Button */}
          <TouchableOpacity
            style={[styles.sendButton, { opacity: mobile.length === 10 ? 1 : 0.6 }]}
            disabled={mobile.length !== 10}
            onPress={handleSendOtp}
          >
            <Text style={styles.sendText}>Send OTP</Text>
            <ArrowRight color={COLORS.white} size={22} />
          </TouchableOpacity>

          {/* OR Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separator} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.separator} />
          </View>

          {/* Continue with Google */}
          <TouchableOpacity style={styles.googleButton}>
            <AntDesign name="google" size={22} color="#EA4335" />
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {/* Continue with Gmail */}
          <TouchableOpacity style={[styles.googleButton, { marginTop: 15 }]}>
            <AntDesign name="mail" size={22} color="#EA4335" />
            <Text style={styles.googleText}>Continue with Gmail</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  fullScreen: { flex: 1, backgroundColor: COLORS.white },

  imageContainer: {
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    zIndex: 0,
  },
  image: { width: "100%", height: "100%" },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.25)" },

  bottomSection: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 130,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
    zIndex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 28,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 22,
  },
  countryPicker: {
    width: 100,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  picker: { height: 55 },
  numberInput: {
    flex: 1,
    height: 55,
    paddingHorizontal: 12,
    fontSize: 16,
    color: "#333",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 28,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  sendText: { color: COLORS.white, fontSize: 16, fontWeight: "600", marginRight: 6 },
  separatorContainer: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  separator: { flex: 1, height: 1, backgroundColor: "#ddd" },
  orText: { marginHorizontal: 10, color: "#888", fontWeight: "500" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingVertical: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  googleText: {
    marginLeft: 10,
    color: "#333",
    fontWeight: "600",
    fontSize: 15,
  },
});
