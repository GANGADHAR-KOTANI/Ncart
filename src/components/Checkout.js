import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { fetchCart } from "../redux/slices/cartSlice";
import { useFocusEffect } from "@react-navigation/native";

// ⭐ ADDED IMPORT
import getToken from "../utils/getToken";

export default function Checkout({ navigation, route }) {
  const paymentMethodName =
    route?.params?.paymentMethodName || "Cash on Delivery";

  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();

  const { sellers, totalPrice, loading } = useSelector((state) => state.cart);

  const defaultAddress = useSelector((state) =>
    state.address.addresses.find((addr) => addr.isDefault)
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const deliveryCharge = sellers.length > 0 ? 30 : 0;
  const totalAmount = totalPrice + deliveryCharge;

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        navigation.navigate("MainTabs", { screen: "CartScreen" });
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => subscription.remove();
    }, [navigation])
  );

  // ------------------------------  
  // 🔥 ORDER SUBMIT FUNCTION UPDATED WITH TOKEN  
  // ------------------------------
  const submitOrder = async () => {
    try {
      const token = await getToken();

      if (!token) {
        alert("Authentication required. Please log in again.");
        return;
      }

      const items = sellers.flatMap((seller) =>
        seller.items.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        }))
      );

      const body = {
        items,
        address: `${defaultAddress.addressLine}, ${defaultAddress.city} - ${defaultAddress.pincode}`,
        phone: defaultAddress.phone || "",
        paymentMode:
          paymentMethodName === "Cash on Delivery"
            ? "COD"
            : paymentMethodName,
      };

      const response = await fetch(
        "https://selecto-project.onrender.com/api/seller/orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",

            // ⭐ TOKEN ADDED HERE
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("❌ ORDER API ERROR:", data);
        alert(data.message || "Order failed!");
        return;
      }

      console.log("✅ ORDER STORED", data);
      navigation.navigate("orderAccepted");
    } catch (error) {
      console.log("❌ ORDER ERROR:", error);
      alert("Something went wrong while placing your order.");
    }
  };

  const handlePlaceOrder = () => {
    if (!defaultAddress) {
      setShowModal(true);
      return;
    }

    if (!sellers?.length) {
      alert("Your cart is empty!");
      return;
    }

    submitOrder(); // 🔥 API call
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Checkout</Text>

        {/* ADDRESS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>

          {defaultAddress ? (
            <>
              <Text style={styles.subText}>
                {defaultAddress.name || "User"}
              </Text>
              <Text style={styles.subText}>
                {defaultAddress.addressLine}, {defaultAddress.city}
              </Text>
              <Text style={styles.subText}>{defaultAddress.pincode}</Text>
            </>
          ) : (
            <Text style={styles.subText}>No default address selected.</Text>
          )}

          <TouchableOpacity onPress={() => navigation.navigate("addressList")}>
            <Text style={styles.changeBtn}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* PAYMENT METHOD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <Text style={styles.subText}>{paymentMethodName}</Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("paymentSelection")}
          >
            <Text style={styles.changeBtn}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* SELLERS */}
        {loading ? (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>
            Loading cart...
          </Text>
        ) : sellers.length === 0 ? (
          <Text style={{ textAlign: "center", marginVertical: 20 }}>
            Your cart is empty.
          </Text>
        ) : (
          sellers.map((seller) => (
            <View key={seller.sellerId} style={styles.sellerCard}>
              <View style={styles.sellerHeader}>
                <Image
                  source={{ uri: seller.shopImage }}
                  style={styles.sellerImage}
                />
                <View>
                  <Text style={styles.sellerName}>
                    {seller.shopName}
                  </Text>
                  <Text style={styles.sellerInfo}>{seller.address}</Text>
                </View>
              </View>

              {seller.items.map((item) => (
                <View
                  key={item.productId._id}
                  style={styles.itemRow}
                >
                  <Image
                    source={{ uri: item.productId.image[0] }}
                    style={styles.itemImage}
                  />
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>
                      {item.productId.name}
                    </Text>
                    <Text style={styles.itemQty}>
                      Qty: {item.quantity}
                    </Text>
                  </View>
                  <Text style={styles.itemPrice}>₹{item.total}</Text>
                </View>
              ))}

              <View style={styles.sellerTotalRow}>
                <Text style={styles.sellerTotalLabel}>Subtotal:</Text>
                <Text style={styles.sellerTotalValue}>
                  ₹{seller.sellerTotal}
                </Text>
              </View>
            </View>
          ))
        )}

        {/* SUMMARY */}
        {sellers.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Summary</Text>

            <View style={styles.row}>
              <Text style={styles.itemText}>Subtotal</Text>
              <Text style={styles.itemText}>₹{totalPrice}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.itemText}>Delivery</Text>
              <Text style={styles.itemText}>₹{deliveryCharge}</Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.total}>Total</Text>
              <Text style={styles.total}>₹{totalAmount}</Text>
            </View>
          </View>
        )}

        {/* BUTTON */}
        {sellers.length > 0 && (
          <TouchableOpacity
            style={styles.orderButton}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.orderBtnText}>Place Order</Text>
          </TouchableOpacity>
        )}

        {/* MODAL */}
        <Modal transparent visible={showModal} animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>
                Please add a default address first.
              </Text>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowModal(false);
                  navigation.navigate("addressList");
                }}
              >
                <Text style={styles.modalButtonText}>Add Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F2F2F2" },
  container: { padding: 20, flex: 1 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 15 },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  subText: { fontSize: 15, color: "#555", marginBottom: 3 },
  changeBtn: { marginTop: 5, color: "#007AFF", fontWeight: "600" },
  sellerCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },
  sellerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  sellerImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  sellerName: { fontSize: 17, fontWeight: "700" },
  sellerInfo: { fontSize: 13, color: "#666" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  itemImage: { width: 50, height: 50, borderRadius: 10, marginRight: 10 },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: "600" },
  itemQty: { fontSize: 14, color: "#777" },
  itemPrice: { fontSize: 16, fontWeight: "600" },
  sellerTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 8,
    marginTop: 8,
  },
  sellerTotalLabel: { fontSize: 16, fontWeight: "600" },
  sellerTotalValue: { fontSize: 16, fontWeight: "600" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  itemText: { fontSize: 16 },
  totalRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  total: { fontSize: 20, fontWeight: "bold" },
  orderButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  orderBtnText: { fontSize: 18, color: "#fff", fontWeight: "700" },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#28A745",
    padding: 12,
    borderRadius: 10,
    width: "60%",
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
