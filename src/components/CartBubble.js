import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { ShoppingCart } from "lucide-react-native";
import { useSelector } from "react-redux";
import { COLORS } from "../config/constants";

export default function CartBubble({ navigation }) {
  const { cartItemCount } = useSelector((s) => s.cart);
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  useEffect(() => {
    if (cartItemCount > 0) {
      setVisible(true);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setVisible(false));
      }, 5000);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [cartItemCount]);

  if (!visible) return null;

  // ✅ navigate safely to Cart tab inside your bottom navigator
  const handleGoToCart = () => {
    try {
      // 👉 if your bottom tab navigator is named "MainTabs", "BottomTabs", or similar — adjust below:
      navigation.navigate("MainTabs", { screen: "Cart" });
      // Example alternatives (uncomment one if yours differs):
      // navigation.navigate("BottomTabs", { screen: "Cart" });
      // navigation.navigate("HomeTabs", { screen: "Cart" });
    } catch (err) {
      console.warn("⚠️ Cart navigation failed:", err);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity activeOpacity={0.85} style={styles.bubble} onPress={handleGoToCart}>
        <ShoppingCart color="#fff" size={20} style={{ marginRight: 6 }} />
        <Text style={styles.text}>View Cart</Text>

        {cartItemCount > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{cartItemCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 10, // sits above bottom tab bar
    alignSelf: "center",
    zIndex: 50,
  },
  bubble: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  countBadge: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  countText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
});
