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
import { COLORS, API_URL } from "../config/constants";
import { ArrowRight } from "lucide-react-native";
import { AntDesign } from "@expo/vector-icons";


const { height } = Dimensions.get("window");

export default function EnterMobileScreen({ navigation }) {
  const [selectedCode, setSelectedCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const imageHeight = useState(new Animated.Value(height * 0.5))[0];

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

  const handleSendOtp = async () => {
    if (mobile.length !== 10) {
      Alert.alert("Invalid number", "Please enter a valid 10-digit number");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: selectedCode + mobile }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        navigation.navigate("VerifyOtp", { phone: selectedCode + mobile });
      } else {
        Alert.alert("Error", data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Please try again later");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.fullScreen}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View style={[styles.imageContainer, { height: imageHeight }]}>
          <Image
            source={require("../../assets/grocery.png")}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSection,
            {
              top: Animated.add(imageHeight, new Animated.Value(-height * 0.05)),
            },
          ]}
        >
          <Text style={styles.heading}>Enter your mobile number</Text>

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

          <TouchableOpacity
            style={[styles.sendButton, { opacity: mobile.length === 10 ? 1 : 0.6 }]}
            disabled={mobile.length !== 10}
            onPress={handleSendOtp}
          >
            <Text style={styles.sendText}>Send OTP</Text>
            <ArrowRight color={COLORS.white} size={22} />
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
  },
  heading: { fontSize: 22, fontWeight: "700", color: COLORS.primary, marginBottom: 28 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    marginBottom: 22,
  },
  countryPicker: { width: 100, borderRightWidth: 1, borderRightColor: "#e0e0e0" },
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
  },
  sendText: { color: COLORS.white, fontSize: 16, fontWeight: "600", marginRight: 6 },
});
