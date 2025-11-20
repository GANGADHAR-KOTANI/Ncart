import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { clearCart } from "../redux/slices/cartSlice";

export default function OrderAccepted({ navigation }) {
  const dispatch = useDispatch();

  const goHome = async () => {
    try {
      // 🔥 Clear server cart + local Redux + AsyncStorage
      await dispatch(clearCart()).unwrap();
      console.log("🧹 Cart cleared successfully after order");
    } catch (err) {
      console.log("❌ Failed to clear cart:", err);
    }

    // 🔥 Reset the navigation so user can't go back
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons
          name="check-circle"
          size={120}
          color="#2ecc71"
        />
      </View>

      <Text style={styles.title}>Order Placed Successfully</Text>
      <Text style={styles.message}>
        Thank you for shopping with us. Your order has been accepted.
      </Text>

      <TouchableOpacity style={styles.homeBtn} onPress={goHome}>
        <MaterialCommunityIcons name="home" size={28} color="#fff" />
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  iconWrapper: { marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#333",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  homeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ecc71",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  homeBtnText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
});
