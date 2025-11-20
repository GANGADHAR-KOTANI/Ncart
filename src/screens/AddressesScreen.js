// ✅ src/screens/AddressesScreen.js
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import axios_api from "../config/axiosConfig";
import getToken from "../utils/getToken";
import AddressCard from "../components/AddressCard";
import { setAddresses } from "../redux/slices/profileSlice";
import { COLORS } from "../config/constants";

export default function AddressesScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { addresses = [] } = useSelector((state) => state.profile);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await axios_api.get(
        "https://selecto-project.onrender.com/api/user/address/list",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🏠 Address API Response:", JSON.stringify(res.data, null, 2));

      if (res.data?.success && Array.isArray(res.data.addresses)) {
        dispatch(setAddresses(res.data.addresses));
      } else if (res.data?.success && Array.isArray(res.data.data)) {
        dispatch(setAddresses(res.data.data));
      } else if (Array.isArray(res.data)) {
        dispatch(setAddresses(res.data));
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (err) {
      console.error("❌ Fetch Addresses Error:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to load addresses");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
    }, [])
  );

  const onDelete = async (addressId) => {
    Alert.alert("Delete Address", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            await axios_api.delete(
              `https://selecto-project.onrender.com/api/user/address/${addressId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert("Deleted", "Address removed successfully");
            fetchAddresses();
          } catch (err) {
            console.error("❌ Delete Address Error:", err.response?.data || err.message);
            Alert.alert("Error", "Could not delete address");
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAddresses();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
     
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Addresses</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.gray, marginTop: 10 }}>Loading addresses...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {!addresses?.length ? (
            <Text style={styles.emptyText}>No saved addresses yet.</Text>
          ) : (
            addresses.map((addr, index) => (
              <AddressCard
                key={addr._id || index}
                address={addr}
                primary={addr.isDefault || index === 0}
                onEdit={() => navigation.navigate("AddAddress", { address: addr })}
                onDelete={() => onDelete(addr._id)}
              />
            ))
          )}

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("AddAddress")}
          >
            <Text style={styles.addText}>+ Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>
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
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.black,
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 16, flexGrow: 1 },
  emptyText: { textAlign: "center", color: "#777", marginTop: 30, fontSize: 16 },
  addBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});