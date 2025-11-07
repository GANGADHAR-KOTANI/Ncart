// src/screens/HomeScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { setLocation } from "../redux/slices/locationSlice";
import { addToCart, removeFromCart, fetchCart } from "../redux/slices/cartSlice";
import { fetchOffers } from "../redux/slices/offersSlice";
import { fetchBestSelling } from "../redux/slices/bestSellingSlice";
import { fetchCategories } from "../redux/slices/categoriesSlice";
import { fetchStores } from "../redux/slices/storesSlice";
import { fetchUserProfile } from "../redux/slices/userSlice";
import { COLORS, SIZES } from "../config/constants";
import { Ionicons, Feather, Entypo } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // ✅ Added

const { width } = Dimensions.get("window");

const banners = [
  require("../../assets/freshfruits.png"),
  require("../../assets/freshveggies.png"),
  require("../../assets/softdrinks.png"),
];

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { address } = useSelector((state) => state.location);
  const user = useSelector((state) => state.user.profile);
  const cartItems = useSelector((state) => state.cart.items);
  const offers = useSelector((state) => state.offers.list);
  const bestSelling = useSelector((state) => state.bestSelling.list);
  const categories = useSelector((state) => state.categories.list);
  const stores = useSelector((state) => state.stores.list);

  const bannerRef = useRef(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [cartLoaded, setCartLoaded] = useState(false);

  // ✅ Load cart data once when app starts
  useEffect(() => {
    const loadCartData = async () => {
      await dispatch(fetchCart());
      setCartLoaded(true);
    };
    loadCartData();
  }, [dispatch]);

  // ✅ Track and persist cart count
 useEffect(() => {
  // ✅ Use actual quantity from backend, fallback to 0 (not 1)
  const count = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  setTotalItems(count);

  // Save synced total to AsyncStorage
  AsyncStorage.setItem("cartCount", String(count));
}, [cartItems]);

  // ✅ Restore persisted cart count (for UI during early load)
  useEffect(() => {
    const restoreCartCount = async () => {
      const savedCount = await AsyncStorage.getItem("cartCount");
      if (savedCount && parseInt(savedCount) > 0) {
        setTotalItems(parseInt(savedCount));
      } else {
        setTotalItems(0);
      }
    };
    restoreCartCount();
  }, []);

  // ✅ Initial data load
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchUserProfile()),
          dispatch(fetchOffers()),
          dispatch(fetchBestSelling()),
          dispatch(fetchCategories()),
          dispatch(fetchStores()),
        ]);
        if (isMounted) fetchUserLocation();
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % banners.length;
      bannerRef.current?.scrollToOffset({
        offset: i * (width - 60),
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserLocation = async () => {
    try {
      setLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is needed to show nearby stores.");
        dispatch(setLocation({ address: "Permission denied" }));
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = pos.coords;

      const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
      const locationName = geo?.[0]
        ? `${geo[0].name || ""}, ${geo[0].city || ""}, ${geo[0].region || ""}`
        : "Unknown Location";

      dispatch(setLocation({ address: locationName, latitude, longitude }));
    } catch (err) {
      console.error("Location error:", err);
      dispatch(setLocation({ address: "Unable to fetch address" }));
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleAdd = (id) => {
    dispatch(addToCart(id));
  };

  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  const getQty = (id) => {
    const found = cartItems.find((i) => i.productId === id || i._id === id);
    return found ? found.quantity ?? 1 : 0;
  };

  const renderProduct = (item, type) => {
    const qty = getQty(item._id);
    const originalPrice = item.originalPrice ?? item.price ?? 0;
    const discountedPrice = item.discountedPrice ?? item.price ?? 0;
    const discountPercent = item.sellerDiscount ?? 0;

    return (
      <View style={styles.offerCard}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: String(item.image?.[0]) }} style={styles.offerImage} />
          {/* ✅ Always show +/– if item already in cart after reload */}
          {cartLoaded && qty > 0 ? (
            <View style={styles.qtyContainer}>
              <TouchableOpacity onPress={() => handleRemove(item._id)}>
                <Text style={styles.qtyBtn}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity onPress={() => handleAdd(item._id)}>
                <Text style={styles.qtyBtn}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addBtn} onPress={() => handleAdd(item._id)}>
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.offerName} numberOfLines={2}>
          {item.name ?? "Unnamed Product"}
        </Text>

        {type === "exclusive" && discountPercent > 0 ? (
          <>
            <View style={styles.priceRow}>
              <Text style={styles.discountTag}>-{discountPercent}% OFF</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              {discountedPrice !== originalPrice && (
                <Text style={styles.strikePrice}>₹{originalPrice}</Text>
              )}
              <Text style={styles.offerPrice}>₹{discountedPrice}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.offerPrice}>₹{item.price ?? 0}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.greenHeader}>
        <View style={styles.header}>
          <View>
            <Text style={styles.userName}>Hello, {user?.name ? user.name : "User"} 👋</Text>

            <TouchableOpacity style={styles.locationRow} onPress={fetchUserLocation} activeOpacity={0.8}>
              <Entypo name="location-pin" size={18} color="#fff" />
              {loadingLocation ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.locationText} numberOfLines={1}>
                  {address || "Fetching location..."}
                </Text>
              )}
            </TouchableOpacity>
          </View>
          <Ionicons name="person-circle-outline" size={45} color="#fff" />
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Feather name="search" size={20} color={COLORS.gray} />
            <TextInput
              placeholder="Search grocery items..."
              placeholderTextColor="#999"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            style={styles.filterBtn}
            onPress={() => navigation.navigate("FilterScreen")}
          >
            <Ionicons name="options-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollArea}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Animated.FlatList
          ref={bannerRef}
          data={banners}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width - 60}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <View style={{ width: width - 60 }}>
              <Image source={item} style={styles.banner} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        />

        <Section
          title="Exclusive Offers"
          data={offers}
          render={(item) => renderProduct(item, "exclusive")}
          onSeeAll={() => navigation.navigate("OffersScreen")}
        />
        <Section
          title="Best Selling"
          data={bestSelling}
          render={(item) => renderProduct(item, "bestselling")}
          onSeeAll={() => navigation.navigate("BestSellingScreen")}
        />
        <CategorySection data={categories} />
        <StoreSection stores={stores} />
      </ScrollView>

      {/* ✅ Show cart only when 1 or more items exist */}
      {totalItems > 0 && (
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => navigation.navigate("CartScreen")}
          activeOpacity={0.9}
        >
          <Ionicons name="cart-outline" size={18} color="#fff" />
          <Text style={styles.cartText}>View Cart • {totalItems} items</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

/* ---------- Reusable Components ---------- */
const Section = ({ title, data, render, onSeeAll }) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onSeeAll}>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => render(item)}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ paddingVertical: 6 }}
    />
  </>
);

const CategorySection = ({ data }) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Categories</Text>
      <TouchableOpacity>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity activeOpacity={0.8} style={styles.categoryCard}>
          <Image source={{ uri: String(item.image) }} style={styles.categoryImage} />
          <Text style={styles.categoryText}>{item.name ?? "Unknown"}</Text>
        </TouchableOpacity>
      )}
    />
  </>
);

const StoreSection = ({ stores }) => (
  <>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Nearby Stores</Text>
      <TouchableOpacity>
        <Text style={styles.seeAll}>See All</Text>
      </TouchableOpacity>
    </View>
    {stores.map((s, i) => (
      <TouchableOpacity key={i} style={styles.storeCard}>
        <Image source={{ uri: String(s.shopImage) }} style={styles.storeImage} />
        <Text style={styles.storeName}>{s.shopName ?? "Unnamed Store"}</Text>
        <View style={styles.storeLocationRow}>
          <Entypo name="location-pin" size={13} color={COLORS.primary} />
          <Text style={styles.storeLocation}>{s.location ?? "Unknown"}</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
          <Text style={styles.storeStar}>★</Text>
          <Text style={styles.storeRating}>{s.rating ?? "4.2"}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </>
);



/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#22C55E" },
  greenHeader: {
    backgroundColor: "#22C55E",
    paddingHorizontal: SIZES.medium,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { fontSize: 20, fontWeight: "700", color: "#fff" },
  locationRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { marginLeft: 4, color: "#fff", maxWidth: 230, fontSize: 13 },
  searchRow: { flexDirection: "row", marginTop: 12 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 6, color: "#000" },
  filterBtn: {
    backgroundColor: "#15803D",
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  scrollArea: { backgroundColor: "#fff", paddingHorizontal: SIZES.medium },
  banner: { width: "100%", height: 165, borderRadius: 14, marginVertical: 16 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 13, color: COLORS.primary },
  offerCard: {
    width: 150,
    padding: 10,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  imageWrapper: { position: "relative" },
  offerImage: { width: "100%", height: 100, borderRadius: 10 },
  offerName: { fontWeight: "600", marginTop: 6, fontSize: 14 },
  offerPrice: { color: COLORS.primary, fontWeight: "700", fontSize: 16 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  discountTag: {
    backgroundColor: "#F87171",
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  strikePrice: {
    textDecorationLine: "line-through",
    color: "#9CA3AF",
    marginRight: 6,
    fontSize: 13,
  },
  addBtn: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  qtyContainer: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  qtyBtn: { color: "#fff", fontSize: 16, fontWeight: "700", paddingHorizontal: 6 },
  qtyText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  categoryCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 18,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  categoryImage: { width: 60, height: 60, borderRadius: 12, resizeMode: "contain" },
  categoryText: { fontSize: 15, fontWeight: "700", marginLeft: 10 },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginVertical: 8,
    padding: 10,
    borderWidth: 0.3,
    borderColor: "#E5E7EB",
  },
  storeImage: {
    width: "100%",
    height: 145,
    borderRadius: 12,
    resizeMode: "cover",
    marginBottom: 6,
  },
  storeName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  storeLocationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  storeLocation: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 2,
    flexShrink: 1,
    maxWidth: "90%",
  },
  storeStar: { fontSize: 13, color: "#F59E0B", marginRight: 3 },
  storeRating: { fontSize: 13, color: "#111827", fontWeight: "600" },
  cartBtn: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    elevation: 4,
  },
  cartText: { color: "#fff", fontWeight: "700", marginLeft: 6, fontSize: 14 },
});
