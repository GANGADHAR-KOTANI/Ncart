// src/screens/CartScreen.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  ToastAndroid,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS } from "../config/constants";
import {
  fetchCart,
  addToCart,
  removeFromCart,
  deleteCartItem,
  clearCart,
} from "../redux/slices/cartSlice";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CartScreen({ navigation }) {
  const dispatch = useDispatch();
  const { sellers, totalPrice, loading } = useSelector((s) => s.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleAdd = async (productId) => {
    dispatch({ type: "cart/localIncrement", payload: { productId } });
    try {
      await dispatch(addToCart({ productId })).unwrap();
    } catch (e) {
      ToastAndroid.show("Failed to update cart", ToastAndroid.SHORT);
      dispatch(fetchCart());
    }
  };

  const handleRemove = async (productId) => {
    dispatch({ type: "cart/localDecrement", payload: { productId } });
    try {
      await dispatch(removeFromCart({ productId })).unwrap();
    } catch (e) {
      ToastAndroid.show("Failed to update cart", ToastAndroid.SHORT);
      dispatch(fetchCart());
    }
  };

  // ✅ Delete single cart item permanently
  const handleDelete = async (productId) => {
    // Optimistic UI update
    dispatch({ type: "cart/localDelete", payload: { cartItemId: productId } });
    try {
      await dispatch(deleteCartItem({ productId })).unwrap();
      ToastAndroid.show("Item removed from cart", ToastAndroid.SHORT);
    } catch (e) {
      console.error("❌ Delete item failed:", e);
      ToastAndroid.show("Failed to delete item", ToastAndroid.SHORT);
      dispatch(fetchCart());
    }
  };

  // ✅ Clear all items
  const handleClearAll = () => {
    Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Clear",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(clearCart()).unwrap();
            ToastAndroid.show("Cart cleared successfully", ToastAndroid.SHORT);
          } catch (err) {
            console.error("❌ Clear all failed:", err);
            ToastAndroid.show(
              "Failed to clear cart. Please try again.",
              ToastAndroid.SHORT
            );
            dispatch(fetchCart());
          }
        },
      },
    ]);
  };

  if (loading)
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {sellers.length > 0 && (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAll}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items */}
      {sellers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {sellers.map((seller) => (
            <View key={seller.sellerId} style={styles.sellerSection}>
              <View style={styles.sellerHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={{ uri: seller.shopImage }}
                    style={styles.sellerImg}
                  />
                  <Text style={styles.sellerName}>{seller.shopName}</Text>
                </View>
              </View>

              {seller.items.map((item) => (
                <View key={item._id} style={styles.itemCard}>
                  <Image
                    source={{ uri: item.productId?.image?.[0] }}
                    style={styles.itemImage}
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.itemName}>{item.productId?.name}</Text>
                    <Text style={styles.itemPrice}>
                      ₹{item.productId?.price}
                    </Text>

                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleRemove(item.productId?._id)}
                      >
                        <Text style={styles.qtyText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyCount}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => handleAdd(item.productId?._id)}
                      >
                        <Text style={styles.qtyText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.rightSide}>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.productId?._id)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                    <Text style={styles.itemTotal}>₹{item.total}</Text>
                  </View>
                </View>
              ))}

              <Text style={styles.sellerTotal}>
                Seller Total: ₹{seller.sellerTotal}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Footer */}
      {sellers.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Subtotal</Text>
            <Text style={styles.footerValue}>₹{totalPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerLabel}>Delivery Fee</Text>
            <Text style={styles.footerValue}>Free</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.footerRow}>
            <Text style={styles.footerTotalLabel}>Total</Text>
            <Text style={styles.footerTotalValue}>
              ₹{totalPrice.toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            onPress={() =>
              navigation.navigate("checkout")
            }
          >
            <Text style={styles.checkoutText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#222" },
  clearAll: { color: "#e63946", fontWeight: "700" },
  sellerSection: {
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginBottom: 10,
    paddingBottom: 10,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sellerImg: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  sellerName: { fontWeight: "700", color: "#333" },
  sellerTotal: {
    fontWeight: "700",
    color: COLORS.primary,
    alignSelf: "flex-end",
    marginRight: 16,
    marginTop: 6,
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    marginHorizontal: 12,
    marginVertical: 4,
    padding: 10,
    alignItems: "center",
  },
  itemImage: { width: 55, height: 55, borderRadius: 8 },
  itemName: { fontWeight: "600", fontSize: 14, color: "#222" },
  itemPrice: { color: "#444", marginTop: 2, fontSize: 13 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  qtyBtn: {
    backgroundColor: COLORS.primary,
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  qtyCount: {
    width: 28,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
    color: "#222",
  },
  rightSide: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 55,
  },
  itemTotal: { fontWeight: "700", fontSize: 13, color: "#222" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  footerLabel: { color: "#555" },
  footerValue: { color: "#222", fontWeight: "600" },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 4 },
  footerTotalLabel: { fontWeight: "800", fontSize: 16, color: "#000" },
  footerTotalValue: { fontWeight: "800", fontSize: 16, color: COLORS.primary },
  checkoutBtn: {
    marginTop: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: "#777" },
});
