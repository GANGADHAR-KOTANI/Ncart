



import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import axios_api from "../config/axiosConfig";
import getToken from "../utils/getToken";
import { COLORS } from "../config/constants";
import globalStyles from "../globalStyles";
import { useFocusEffect } from "@react-navigation/native";

const DELIVERY_FEE = 40;

const CartScreen = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockWarnings, setStockWarnings] = useState({});

  // 🛒 Fetch cart data from backend
  const fetchCartData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      console.log("🪪 Cart token found:", token);

      if (!token) {
        console.log("No token found — using local cart (if any).");
        setCartItems([]);
        setLoading(false);
        return;
      }

      const response = await axios_api.get("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("🛒 Cart API Response:", JSON.stringify(response.data, null, 2));

      if (response.data?.success && response.data?.cart?.sellers?.length > 0) {
        const sellers = response.data.cart.sellers;

        // flatten all sellers into one array of items
        const allItems = sellers.flatMap((seller) =>
          (seller.items || []).map((i) => ({
            ...i,
            shopName: seller.shopName,
            shopImage: seller.shopImage,
            shopId: seller.sellerId,
            quantity: i.quantity ?? 1,
            price: i.price ?? i.productId?.price ?? 0,
            stock: 10, // default stock for now
            productName: i.productId?.name ?? "Unnamed Product",
            productImage: Array.isArray(i.productId?.image)
              ? i.productId.image[0]
              : i.productId?.image,
          }))
        );

        setCartItems(allItems);
      } else {
        console.log("⚠️ Empty cart returned from backend.");
        setCartItems([]);
      }
    } catch (error) {
      console.error("❌ Error fetching cart:", error.response ?? error.message);
      Alert.alert("Error", "Failed to fetch cart from server.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCartData();
  }, []);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchCartData();
    }, [])
  );

  // 🟢 Listen for cart updates from HomeScreen
  useEffect(() => {
    const listener = DeviceEventEmitter.addListener("cartUpdated", () => {
      console.log("🔄 Cart update event received — refreshing cart data...");
      fetchCartData();
    });
    return () => listener.remove();
  }, []);

  // Extract productId utility
  const extractProductId = (item) => {
    const maybeProduct = item?.productId || item?.product || item;
    return (
      maybeProduct?._id ||
      maybeProduct?.id ||
      item?.productId ||
      item?.product
    );
  };

  // Delete one item
  const handleDeleteItem = async (item) => {
    const productId = extractProductId(item);
    if (!productId) return;

    try {
      const token = await getToken();
      await axios_api.delete("/api/cart/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId },
      });
      setCartItems((prev) =>
        prev.filter((i) => extractProductId(i) !== productId)
      );
      setStockWarnings((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } catch (error) {
      console.error("Error removing item:", error.response ?? error.message);
      Alert.alert("Error", "Failed to remove item");
    }
  };

  // Clear all
  const handleClearCart = async () => {
    try {
      const token = await getToken();
      await axios_api.delete("/api/cart/clear", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
      setStockWarnings({});
    } catch (error) {
      console.error("Error clearing cart:", error.response ?? error.message);
      Alert.alert("Error", "Could not clear cart.");
    }
  };

  // Increase quantity (with stock validation)
  const handleIncrease = (item) => {
    const productId = extractProductId(item);
    const currentItem = cartItems.find(
      (i) => extractProductId(i) === productId
    );
    const currentQty = currentItem?.quantity || 1;
    const stock = currentItem?.stock ?? 0;

    if (stock === 0) {
      setStockWarnings((prev) => ({
        ...prev,
        [productId]: "Out of stock",
      }));
      return;
    }

    if (currentQty >= stock) {
      setStockWarnings((prev) => ({
        ...prev,
        [productId]: `Only ${stock} in stock`,
      }));
      return;
    }

    setStockWarnings((prev) => {
      const updated = { ...prev };
      delete updated[productId];
      return updated;
    });

    setCartItems((prev) =>
      prev.map((i) =>
        extractProductId(i) === productId
          ? { ...i, quantity: (i.quantity || 1) + 1 }
          : i
      )
    );
  };

  // Decrease quantity
  const handleDecrease = async (item) => {
    const productId = extractProductId(item);
    if (!productId) return;

    const currentQty =
      cartItems.find((i) => extractProductId(i) === productId)?.quantity || 1;

    if (currentQty <= 1) {
      try {
        const token = await getToken();
        await axios_api.delete("/api/cart/delete", {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId },
        });
        setCartItems((prev) =>
          prev.filter((i) => extractProductId(i) !== productId)
        );
        setStockWarnings((prev) => {
          const updated = { ...prev };
          delete updated[productId];
          return updated;
        });
      } catch (error) {
        console.error("Error removing item:", error.response ?? error.message);
      }
    } else {
      setCartItems((prev) =>
        prev.map((i) => {
          if (extractProductId(i) === productId) {
            const newQty = (i.quantity || 1) - 1;
            setStockWarnings((prevW) => {
              const updated = { ...prevW };
              if (newQty <= (i.stock ?? 10)) delete updated[productId];
              return updated;
            });
            return { ...i, quantity: newQty };
          }
          return i;
        })
      );
    }
  };

  // 💰 Price calculations
  const subtotal = cartItems.reduce((acc, i) => {
    const price = i?.price ?? i?.productId?.price ?? 0;
    const qty = i?.quantity ?? 1;
    return acc + price * qty;
  }, 0);

  const deliveryFee =
    subtotal >= 100 ? 0 : cartItems.length > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart is empty", "Add some products to checkout!");
      return;
    }
    Alert.alert(
      "Checkout",
      `Your total payable amount is ₹${total} (including delivery fee ₹${deliveryFee}).`
    );
  };

  // 🏪 Group by store
  const groupByStore = (items) => {
    const grouped = {};
    items.forEach((item) => {
      const storeName = item.shopName || "Other Store";
      if (!grouped[storeName]) grouped[storeName] = [];
      grouped[storeName].push(item);
    });
    return grouped;
  };

  const groupedStores = groupByStore(cartItems);

  const renderItem = ({ item }) => {
    const product = item?.productId || item?.product || {};
    const name = product?.name || item?.name || "Unnamed Product";
    const price = item?.price ?? product?.price ?? 0;
    const quantity = item?.quantity ?? 1;
    const totalPrice = price * quantity;
    const stock = item?.stock ?? 10;
    const productId = extractProductId(item);

    let imageUri =
      product?.image &&
      (typeof product.image === "string"
        ? product.image
        : Array.isArray(product.image)
        ? product.image[0]
        : null);
    if (!imageUri)
      imageUri = "https://cdn-icons-png.flaticon.com/512/3081/3081559.png";

    return (
      <View style={styles.itemContainer}>
        <Image source={{ uri: imageUri }} style={styles.itemImage} />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{name}</Text>
          <Text style={styles.itemPrice}>₹{price}</Text>
          {stock === 0 && (
            <Text style={{ color: "red", fontSize: 12, fontWeight: "600" }}>
              Out of Stock
            </Text>
          )}
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleDecrease(item)}
            >
              <Text style={styles.qtySymbol}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleIncrease(item)}
            >
              <Text style={styles.qtySymbol}>＋</Text>
            </TouchableOpacity>
          </View>
          {stockWarnings[productId] && (
            <Text style={styles.warningText}>{stockWarnings[productId]}</Text>
          )}
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity
            onPress={() => handleDeleteItem(item)}
            style={styles.deleteButton}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.itemTotal}>₹{totalPrice}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View
      style={[
        globalStyles.container,
        {
          backgroundColor: COLORS.white,
          paddingTop:
            Platform.OS === "android" ? StatusBar.currentHeight + 10 : 40,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty 🛒</Text>
      ) : (
        <>
          <FlatList
            data={Object.entries(groupedStores)}
            keyExtractor={([storeName]) => storeName}
            renderItem={({ item: [storeName, items], index }) => (
              <View>
                <Text style={styles.storeTitle}>{storeName}</Text>
                {items.map((item, idx) => (
                  <View key={idx}>{renderItem({ item })}</View>
                ))}
                {index !== Object.keys(groupedStores).length - 1 && (
                  <View style={styles.storeDivider} />
                )}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.bottomSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              {subtotal >= 100 ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      color: COLORS.gray,
                      textDecorationLine: "line-through",
                      fontSize: 16,
                    }}
                  >
                    ₹{DELIVERY_FEE}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: 12,
                      fontWeight: "bold",
                      marginLeft: 6,
                    }}
                  >
                    Free Delivery
                  </Text>
                </View>
              ) : (
                <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
              )}
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>

            {subtotal >= 100 && (
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: 14,
                  textAlign: "right",
                  marginTop: 4,
                }}
              >
                🎉 Free delivery unlocked!
              </Text>
            )}

            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={globalStyles.buttonText}>Go to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.black,
  },
  clearAllText: {
    color: COLORS.danger,
    fontSize: 15,
    fontWeight: "bold",
  },
  storeTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.black,
    marginBottom: 5,
    marginTop: 10,
  },
  storeDivider: {
    height: 1,
    backgroundColor: COLORS.gray,
    opacity: 0.3,
    marginVertical: 10,
  },
  itemContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.lightGray,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  itemImage: {
    width: 72,
    height: 72,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 12, fontWeight: "bold", color: COLORS.black },
  itemPrice: { fontSize: 14, color: COLORS.gray, marginBottom: 8 },
  warningText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "bold",
  },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  qtyButton: {
    backgroundColor: COLORS.white,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.gray,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  qtySymbol: { fontSize: 18, fontWeight: "bold", color: COLORS.primary },
  qtyText: { marginHorizontal: 10, fontSize: 16, color: COLORS.black },
  rightSection: { alignItems: "flex-end" },
  itemTotal: {
    fontWeight: "bold",
    fontSize: 15,
    color: COLORS.black,
    marginBottom: 8,
  },
  deleteButton: { padding: 5 },
  deleteText: {
    color: COLORS.gray,
    fontSize: 14,
    paddingBottom: 15,
    fontWeight: "bold",
  },
  bottomSummary: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  summaryLabel: { color: COLORS.black, fontSize: 12 },
  summaryValue: { color: COLORS.black, fontSize: 12 },
  totalValue: { color: COLORS.black, fontWeight: "bold", fontSize: 15 },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 1,
    marginBottom: 20,
    alignItems: "center",
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 16,
    marginTop: 30,
  },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default CartScreen;
