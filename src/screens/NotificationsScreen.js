import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios_api from "../config/axiosConfig";
import getToken from "../utils/getToken";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../config/constants";

const FALLBACK = [
  { id: "n1", title: "Welcome to Selecto", body: "Thanks for joining Selecto!" },
  { id: "n2", title: "How it works", body: "Tap orders to view your completed orders." },
];

export default function NotificationsScreen() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      // Try fetching from API (in case added later)
      const res = await axios_api.get("https://selecto-project.onrender.com/api/user/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success && Array.isArray(res.data.notifications)) {
        setNotifs(res.data.notifications);
      } else if (Array.isArray(res.data)) {
        setNotifs(res.data);
      } else {
        setNotifs(FALLBACK);
      }
    } catch (err) {
      console.log("ℹ️ Notifications fallback mode (no API)");
      setNotifs(FALLBACK);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.gray }}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifs}
          keyExtractor={(i) => i.id ?? i._id ?? Math.random().toString()}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.title}>{item.title ?? "Notification"}</Text>
              <Text style={styles.body}>{item.body ?? ""}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={{ padding: 20 }}>
              <Text style={{ textAlign: "center", color: COLORS.gray }}>
                No notifications available.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#F3F3F3",
    backgroundColor: "#fff",
  },
  title: { fontWeight: "700", marginBottom: 6 },
  body: { color: "#666" },
});