import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { COLORS, API_URL } from "../config/constants";

export default function SellersList({ lat, lng, navigation }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      if (lat && lng) fetchNearby(lat, lng);
    }, [lat, lng])
  );

  const fetchNearby = async (latitude, longitude) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `${API_URL}/api/user/nearbyseller?lat=${encodeURIComponent(
          latitude
        )}&lng=${encodeURIComponent(longitude)}`
      );
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Failed to fetch nearby stores");
        setStores([]);
      } else {
        const normalized = (data.stores || []).map((s) => {
          const distMeters = typeof s.distance === "number" ? s.distance : 0;
          const km =
            distMeters >= 1000
              ? (distMeters / 1000).toFixed(1)
              : (distMeters / 1000).toFixed(2);
          return { ...s, distanceKm: Number(km) };
        });
        setStores(normalized);
      }
    } catch (err) {
      console.warn("Nearby sellers fetch error:", err);
      setError("Network error");
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const imageUri = item.shopImage || "https://via.placeholder.com/120";
    const distanceLabel =
      typeof item.distance === "number"
        ? item.distance >= 1000
          ? `${(item.distance / 1000).toFixed(1)} km`
          : `${item.distance.toFixed(0)} m`
        : item.distanceKm
        ? `${item.distanceKm} km`
        : "";

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("SellerMainScreen", {
            sellerId: item._id, // ✅ send seller id
            fromNearby: true, // ✅ indicates navigation source
          })
        }
      >
        <Image source={{ uri: imageUri }} style={styles.image} />
        <View style={styles.info}>
          <Text style={styles.shopName} numberOfLines={1}>
            {item.shopName}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {item.address || ""}
          </Text>
          <View style={styles.row}>
            <Text style={styles.rating}>★ 4.5</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.distance}>{distanceLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>No nearby shops found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nearby Shops</Text>
      <FlatList
        data={stores}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false}   // ✅ add this line

      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 3,
    paddingBottom: 16,
    paddingHorizontal: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: "100%",
    height: 160,
    resizeMode: "cover",
  },
  info: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  shopName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 3,
  },
  address: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    fontSize: 13,
    color: "#F59E0B",
    fontWeight: "700",
  },
  dot: {
    marginHorizontal: 8,
    color: "#9CA3AF",
  },
  distance: {
    fontSize: 13,
    color: "#374151",
  },
  loadingWrap: {
    paddingVertical: 18,
    alignItems: "center",
  },
  emptyWrap: {
    paddingVertical: 18,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 13,
  },
  errorWrap: {
    paddingVertical: 18,
    alignItems: "center",
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
  },
});
