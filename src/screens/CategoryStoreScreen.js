import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { fetchStoresByCategory } from "../redux/slices/storeSlice";
import { Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function CategoryStoreScreen() {
  const dispatch = useDispatch();
  const { selectedCategory, stores, loading, error } = useSelector(
    (state) => state.stores
  );

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchStoresByCategory(selectedCategory));
    }
  }, [selectedCategory]);

  if (loading)
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007BFF" />
      </SafeAreaView>
    );

  if (error)
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Near By Stores</Text>

        <FlatList
          data={stores}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {/* Top section: store info and image */}
              <View style={styles.topRow}>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{item.shopName}</Text>

                  {/* Address Section (Replacing Coordinates) */}
                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={14} color="#FF4D4D" />
                    <Text style={styles.location}>
                      {item.address || "No address available"}
                    </Text>
                  </View>
                </View>

                <Image
                  source={{
                    uri:
                      item?.shopImage && item.shopImage.startsWith("http")
                        ? item.shopImage
                        : "https://via.placeholder.com/150x150.png?text=Shop",
                  }}
                  style={styles.shopImage}
                />
              </View>

              {/* Products Section */}
              <View style={styles.productContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productRow}
                >
                  {item.products?.slice(0, 4).map((product, index) => (
                    <View key={index} style={styles.productBox}>
                      <Image
                        source={{
                          uri:
                            product?.image?.[0] &&
                            product.image[0].startsWith("http")
                              ? product.image[0]
                              : "https://via.placeholder.com/100x100.png?text=Item",
                        }}
                        style={styles.productImage}
                      />
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <Text style={styles.productPrice}>
                        ₹{product.price || "—"}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* See all button */}
                <TouchableOpacity style={styles.seeAllBox}>
                  <Text style={styles.seeAllText}>See all →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 18,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1.3,
    borderColor: "#00B050",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  storeInfo: {
    flex: 1,
    paddingRight: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  shopImage: {
    width: width * 0.38,
    height: width * 0.24,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  productContainer: {
    marginTop: 12,
  },
  productRow: {
    paddingHorizontal: 8,
    alignItems: "center",
  },
  productBox: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    width: 90,
    height: 115,
    backgroundColor: "#F4F8F4",
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: "#E0E0E0",
    shadowColor: "transparent",
    elevation: 0,
    paddingVertical: 5,
  },
  productImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    resizeMode: "cover",
  },
  productName: {
    fontSize: 12,
    color: "#333",
    marginTop: 4,
    textAlign: "center",
    width: 70,
  },
  productPrice: {
    fontSize: 13,
    color: "#00B050",
    fontWeight: "600",
    marginTop: 2,
  },
  seeAllBox: {
    marginTop: 10,
    alignItems: "flex-end",
    paddingRight: 10,
  },
  seeAllText: {
    fontSize: 14,
    color: "#00B050",
    fontWeight: "600",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  location: {
    fontSize: 13,
    color: "#555",
    marginLeft: 4,
  },
});
