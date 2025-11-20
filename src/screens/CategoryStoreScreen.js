import React, { useEffect, useState } from "react";
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
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { fetchStoresByCategory } from "../redux/slices/categoryStoreSlice";
import { Feather } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { API_URL } from "../config/constants";

const { width } = Dimensions.get("window");

// ... all imports stay the same

export default function CategoryStoreScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const searchQuery = route.params?.searchQuery || null;
  const fromSearch = route.params?.fromSearch || false;

  const selectedCategoryFromRoute =
    route.params?.filters?.category || route.params?.category || null;

  const { selectedCategory, stores, loading, error } = useSelector(
    (state) => state.categoryStores
  );

  const [filteredStores, setFilteredStores] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // 🔥 Universal search mode
    if (route.params?.fromSearch && route.params?.searchQuery) {
      console.log("🔍 UNIVERSAL SEARCH:", route.params.searchQuery);

      fetch(
        `${API_URL}/api/search/universalSearch?q=${route.params.searchQuery}`
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("🔍 UNIVERSAL RESULT:", data);

          const storesWithCategory = (data.stores || []).map((store) => ({
            ...store,
            category:
              store.products?.[0]?.category ||
              route.params?.category ||
              null,
          }));

          setFilteredStores(storesWithCategory);
        })
        .catch((err) => console.log("❌ Universal search error:", err));

      return;
    }

    const categoryToFetch =
      route.params?.filters?.category ||
      route.params?.category ||
      selectedCategory ||
      "Fruits";

    dispatch(fetchStoresByCategory(categoryToFetch));
  }, [route.params, selectedCategory]);

  const fetchUniversalSearch = async (query) => {
    try {
      const res = await fetch(
        `${API_URL}/api/search/universalSearch?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      const storesWithCategory = (data.stores || []).map((store) => ({
        ...store,
        category:
          store.products?.[0]?.category ||
          route.params?.category ||
          null,
      }));

      setFilteredStores(storesWithCategory);
    } catch (err) {
      console.log("Search error:", err);
      setFilteredStores([]);
    }
  };

  useEffect(() => {
    if (fromSearch) return;

    if (!stores || stores.length === 0) return;

    const maxPrice = route.params?.filters?.maxPrice;

    if (maxPrice) {
      const filtered = stores.map((store) => ({
        ...store,
        products: store.products.filter(
          (p) => p.price && Number(p.price) <= maxPrice
        ),
      }));
      setFilteredStores(filtered);
    } else {
      setFilteredStores(stores);
    }
  }, [stores, route.params]);

  const handleRefresh = async () => {
    setRefreshing(true);

    if (fromSearch && searchQuery) {
      await fetchUniversalSearch(searchQuery);
      setRefreshing(false);
      return;
    }

    const categoryToFetch =
      route.params?.filters?.category ||
      selectedCategoryFromRoute ||
      selectedCategory ||
      "Fruits";

    await dispatch(fetchStoresByCategory(categoryToFetch));
    setRefreshing(false);
  };

  const handleSeeAll = (sellerId) => {

    // ⭐ 1) UNIVERSAL SEARCH MODE — FIXED sellerId detection
    if (fromSearch) {
      const storeCategory =
        filteredStores.find(
          (s) =>
            s.sellerId === sellerId ||
            s.seller_id === sellerId ||
            s._id === sellerId
        )?.category ||
        route.params?.category ||
        null;

      navigation.navigate("SellerMainScreen", {
        sellerId,
        category: storeCategory,
        fromCategoryScreen: true,
        fromSearch: true,
      });

      return;
    }

    // ⭐ 2) NORMAL CATEGORY MODE (unchanged)
    const category =
      route.params?.filters?.category ||
      selectedCategoryFromRoute ||
      selectedCategory ||
      "Fruits";

    navigation.navigate("SellerMainScreen", {
      sellerId,
      category,
      fromCategoryScreen: true,
    });
  };

  if (loading && !refreshing && !fromSearch)
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#00B050" />
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
        <Text style={styles.header}>
          {fromSearch ? `Results for "${searchQuery}"` : "Nearby Stores"}
        </Text>

        {route.params?.filters && !fromSearch && (
          <Text style={styles.filterText}>
            Showing {route.params.filters.category} items below ₹
            {route.params.filters.maxPrice}
          </Text>
        )}

        <FlatList
          data={filteredStores}
          keyExtractor={(item, index) => index.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#00B050"]}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{item.shopName}</Text>
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

              <View style={styles.productContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.productRow}
                >
                  {item.products?.slice(0, 4).map((product, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.productBox}
                      activeOpacity={0.8}
                      onPress={() => {
                        const isFilterFlow = !!route.params?.filters;

                        navigation.navigate("SingleProduct", {
                          id: product._id,
                          category: fromSearch
                            ? product.category
                            : item.category,
                          maxPrice: route.params?.filters?.maxPrice,
                          context: isFilterFlow
                            ? "bachelor-filter"
                            : "category",
                        });
                      }}
                    >
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
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* ⭐ FIXED sellerId detection */}
                <TouchableOpacity
                  style={styles.seeAllBox}
                  onPress={() =>
                    handleSeeAll(
                      item.sellerId || item.seller_id || item._id
                    )
                  }
                >
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

/* STYLES UNCHANGED */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    marginBottom: 18,
  },
  filterText: {
    textAlign: "center",
    color: "#555",
    marginBottom: 10,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1.3,
    borderColor: "#00B050",
    elevation: 3,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  storeInfo: { flex: 1, paddingRight: 10 },
  storeName: { fontSize: 18, fontWeight: "700", color: "#000" },
  shopImage: {
    width: width * 0.38,
    height: width * 0.24,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
  },
  productContainer: { marginTop: 12 },
  productRow: { paddingHorizontal: 8, alignItems: "center" },
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
    paddingVertical: 5,
  },
  productImage: {
    width: 65,
    height: 65,
    borderRadius: 8,
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
  seeAllBox: { marginTop: 10, alignItems: "flex-end", paddingRight: 10 },
  seeAllText: { fontSize: 14, color: "#00B050", fontWeight: "600" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  location: { fontSize: 13, color: "#555", marginLeft: 4 },
});
