// ✅ src/screens/OrdersScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios_api from "../config/axiosConfig";
import getToken from "../utils/getToken";
import { COLORS } from "../config/constants";

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios_api.get(
        "https://selecto-project.onrender.com/api/seller/orders/complete-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🧾 Orders API Response:", JSON.stringify(res.data, null, 2));

      if (res.data?.success && Array.isArray(res.data.completeOrders)) {
        setOrders(res.data.completeOrders);
      } else {
        throw new Error("Unexpected response format");
      }

      setError(null);
    } catch (err) {
      console.error("❌ fetchOrders error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🌀 Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching your orders...</Text>
      </View>
    );
  }

  // ❌ Error
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "red", textAlign: "center" }}>
          Error: {String(error)}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchOrders}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🛒 No orders
  if (!orders.length) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>

        <View style={styles.center}>
          <Ionicons name="cart-outline" size={60} color={COLORS.gray} />
          <Text style={styles.emptyText}>You have no completed orders yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ✅ Orders List
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item, idx) => item._id || idx.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Header */}
            <Text style={styles.orderId}>Order ID: {item._id}</Text>
            <Text style={styles.totalPrice}>
              Total: <Text style={{ color: COLORS.primary }}>₹{item.totalPrice}</Text>
            </Text>

            {/* Items */}
            {item.childOrders?.map((child, i) => (
              <View key={child._id || i}>
                {child.items?.map((p, j) => (
                  <View key={p._id || j} style={styles.productRow}>
                    <Image
                      source={{
                        uri:
                          p.productId?.image?.[0] ||
                          "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
                      }}
                      style={styles.image}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.productName}>{p.productId?.name}</Text>
                      <Text style={styles.shopName}>{p.sellerId?.shopName}</Text>

                      {/* ✅ Simplified quantity + amount */}
                      <Text style={styles.priceLine}>
                        Qty: {p.quantity} | ₹{p.subtotal}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}

            {/* Footer */}
            <View style={styles.footer}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={item.status === "completed" ? "green" : "orange"}
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      item.status === "completed"
                        ? "green"
                        : item.status === "pending"
                        ? "orange"
                        : "gray",
                  },
                ]}
              >
                {item.status?.toUpperCase() || "PENDING"}
              </Text>
              <Text style={styles.dateText}>
                {new Date(item?.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: { marginTop: 10, color: COLORS.gray },
  emptyText: { marginTop: 10, color: COLORS.gray, fontSize: 16 },
  retryBtn: {
    backgroundColor: COLORS.primary,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: "#fff", fontWeight: "600" },

  header: {
    padding: 14,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
  },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 12,
    marginBottom: 14,
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  orderId: { fontWeight: "700", fontSize: 14, marginBottom: 5 },
  totalPrice: { fontSize: 14, fontWeight: "600", marginBottom: 10 },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  image: { width: 50, height: 50, borderRadius: 8, marginRight: 10 },
  productName: { fontSize: 15, fontWeight: "600" },
  shopName: { color: COLORS.gray, fontSize: 13 },
  priceLine: { color: COLORS.black, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  statusText: { fontWeight: "700" },
  dateText: { color: COLORS.gray, fontSize: 12 },
});