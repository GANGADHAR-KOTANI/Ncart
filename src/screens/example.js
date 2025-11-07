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
} from "react-native";
import {
  fetchProfile,
  fetchOffers,
  fetchBestSelling,
  fetchCategories,
  fetchStores,
} from "../redux/slices/universalSlice";

import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { setLocation } from "../redux/slices/locationSlice";

import { addItem, incrementQty, decrementQty } from "../redux/slices/cartSlice";

import { COLORS, SIZES } from "../config/constants";
import { Ionicons, Feather, Entypo } from "@expo/vector-icons";
import EnterNameScreen from "./EnterNameScreen";
import { useRoute, useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const banners = [
  require("../../assets/freshfruits.png"),
  require("../../assets/freshveggies.png"),
  require("../../assets/softdrinks.png"),
];

function StoreItem({ item, onPress }) {
  const distance = item.distance ?? "2 km";
  const eta = item.eta ?? "5-8 Min";
  const rating = typeof item.rating === "number" ? item.rating : 4.2;
  const status = (item.status ?? "OPEN").toUpperCase();

  return (
    <TouchableOpacity style={styles.storeCard} activeOpacity={0.9} onPress={() => onPress?.(item)}>
      <Image source={{ uri: item.shopImage }} style={styles.storeTopImage} />
      <View style={styles.storeDetails}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.storeName}>{item.shopName}</Text>
          <View
            style={[styles.statusBadge, status === "OPEN" ? styles.statusOpen : styles.statusClosed]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.storeAddress}>{item.address}</Text>

        <View style={styles.storeInfoRow}>
          <View style={styles.infoPill}>
            <Entypo name="location-pin" size={12} color={COLORS.primary} />
            <Text style={styles.infoText}>{distance}</Text>
          </View>
          <View style={styles.infoPill}>
            <Ionicons name="time-outline" size={12} color={COLORS.gray} />
            <Text style={styles.infoText}>{eta}</Text>
          </View>
          <View style={styles.infoPill}>
            <Text style={styles.ratingText}>★</Text>
            <Text style={styles.infoText}>{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const { phone, isNewUser } = route.params || {};

  const { address } = useSelector((state) => state.location || {});
  // safe selector so it won't crash if cart slice not available briefly
  const cart = useSelector((state) => state.cart?.items || {});

  // Count only unique products
  const totalItems = Object.keys(cart).length;

  const { offers, bestSelling, categories, stores, user, loading, error } = useSelector(
    (state) => state.universal || {}
  );

  const [showOverlay, setShowOverlay] = useState(isNewUser || false);

  const bannerRef = useRef(null);

  const addToCartHandler = (item) => dispatch(addItem(item));
  const increment = (id) => dispatch(incrementQty(id));
  const decrement = (id) => dispatch(decrementQty(id));

  // Location
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const pos = await Location.getCurrentPositionAsync({});
        const geo = await Location.reverseGeocodeAsync(pos.coords);

        if (geo.length > 0) {
          const a = geo[0];
          const fullAddress = [
            a.name,
            a.street,
            a.district,
            a.city,
            a.subregion,
            a.region,
            a.postalCode,
            a.country,
          ]
            .filter(Boolean)
            .join(", ");

          dispatch(setLocation(fullAddress));
        }
      } catch (err) {
        // silently ignore location errors for now
        console.warn("Location error:", err.message);
      }
    })();
  }, [dispatch]);

  // Fetch universal data
  useEffect(() => {
    if (phone) dispatch(fetchProfile(phone));
    dispatch(fetchOffers());
    dispatch(fetchBestSelling());
    dispatch(fetchCategories());
    dispatch(fetchStores());
  }, [dispatch, phone]);

  // Banner auto slide
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % banners.length;
      bannerRef.current?.scrollToOffset?.({ offset: i * (width - 60), animated: true });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const getRandomColor = () => {
    const arr = ["#FFF5E4", "#E8F8F5", "#FDEDEC", "#EBF5FB", "#FEF9E7", "#F4ECF7"];
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const renderProductCard = (item) => {
    const qty = cart[item._id]?.qty ?? 0;

    return (
      <View style={styles.offerCard}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: item.image?.[0] }} style={styles.offerImage} />
          {!qty ? (
            <TouchableOpacity style={styles.addBtnOverImg} onPress={() => addToCartHandler(item)}>
              <Text style={styles.addBtnOverImgText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyContainerOverImg}>
              <TouchableOpacity style={styles.qtyBtnSmall} onPress={() => decrement(item._id)}>
                <Text style={styles.qtyBtnTextSmall}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyTextSmall}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtnSmall} onPress={() => increment(item._id)}>
                <Text style={styles.qtyBtnTextSmall}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.offerName}>{item.name}</Text>
        {item.originalPrice ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
            <Text style={styles.offerPrice}>₹{item.price}</Text>
            <Text style={styles.strikePrice}>₹{item.originalPrice}</Text>
            {item.sellerDiscount > 0 && <Text style={styles.discountText}>{item.sellerDiscount}% OFF</Text>}
          </View>
        ) : (
          <Text style={styles.offerPrice}>₹{item.price}</Text>
        )}
      </View>
    );
  };

  // Loading / Error feedback
  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { justifyContent: "center", alignItems: "center" }]}>
        <Text>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.userName}>Hello, {user?.name || "Guest"} 👋</Text>

          <View style={styles.locationRow}>
            <Entypo name="location-pin" size={18} color={COLORS.primary} />
            <Text style={styles.locationText}>{address || "Fetching..."}</Text>
          </View>
        </View>
        <Ionicons name="person-circle-outline" size={45} color={COLORS.primary} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color={COLORS.gray} />
          <TextInput placeholder="Search grocery items..." style={styles.searchInput} />
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate("Filter")}>
          <Ionicons name="options-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Banners */}
        <Animated.FlatList
          ref={bannerRef}
          data={banners}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={width - 60}
          contentContainerStyle={{ paddingLeft: 10 }}
          ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          renderItem={({ item }) => (
            <View style={{ width: width - 60 }}>
              <Image source={item} style={styles.bannerImage} />
            </View>
          )}
        />

        {/* Exclusive */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Exclusive Offers</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SeeAll", { type: "offers" })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={offers || []}
          horizontal
          keyExtractor={(i) => i._id || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigation.navigate("ProductDetails", { product: item })}>
              {renderProductCard(item)}
            </TouchableOpacity>
          )}
        />

        {/* Best Selling */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Selling</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SeeAll", { type: "bestSelling" })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={bestSelling || []}
          horizontal
          keyExtractor={(i) => i._id || Math.random().toString()}
          renderItem={({ item }) => {
            const qty = cart[item._id]?.qty ?? 0;

            return (
              <View style={styles.offerCard}>
                <View style={{ position: "relative" }}>
                  <Image source={{ uri: item.image?.[0] }} style={styles.offerImage} />

                  {!qty ? (
                    <TouchableOpacity style={styles.addBtnOverImg} onPress={() => addToCartHandler(item)}>
                      <Text style={styles.addBtnOverImgText}>ADD</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyContainerOverImg}>
                      <TouchableOpacity style={styles.qtyBtnSmall} onPress={() => decrement(item._id)}>
                        <Text style={styles.qtyBtnTextSmall}>-</Text>
                      </TouchableOpacity>

                      <Text style={styles.qtyTextSmall}>{qty}</Text>

                      <TouchableOpacity style={styles.qtyBtnSmall} onPress={() => increment(item._id)}>
                        <Text style={styles.qtyBtnTextSmall}>+</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                <Text style={styles.offerName}>{item.name}</Text>
                <Text style={styles.offerPrice}>₹{item.price}</Text>
              </View>
            );
          }}
        />

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SeeAll", { type: "categories" })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories || []}
          horizontal
          keyExtractor={(i) => i._id || i.name || Math.random().toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryRowCard, { backgroundColor: getRandomColor() }]}
              onPress={() => navigation.navigate("CategoryProducts", { category: item })}
            >
              <Image source={{ uri: item.image }} style={styles.categoryRowImage} />
              <Text style={styles.categoryRowText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Stores */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Stores</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SeeAll", { type: "stores" })}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={stores || []}
          scrollEnabled={false}
          keyExtractor={(i) => i._id || i.shopName || Math.random().toString()}
          renderItem={({ item }) => (
            <StoreItem item={item} onPress={() => navigation.navigate("StoreDetails", { store: item })} />
          )}
        />
      </ScrollView>

      {/* Mini Cart Bubble */}
      {totalItems > 0 && (
        <TouchableOpacity style={styles.viewCartBar} onPress={() => navigation.navigate("Cart")}>
          <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.viewCartText}>View Cart • {totalItems} items</Text>
        </TouchableOpacity>
      )}

      {showOverlay && <EnterNameScreen phone={phone} onComplete={() => setShowOverlay(false)} />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: SIZES.medium,
    paddingTop: 10,
  },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { fontSize: SIZES.large, fontWeight: "700" },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: { marginLeft: 4, fontSize: 13, color: "#6B7280", flexShrink: 1 },
  searchContainer: { flexDirection: "row", marginTop: 12 },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    alignItems: "center",
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
  filterButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  bannerImage: {
    width: "100%",
    height: 165,
    borderRadius: 14,
    resizeMode: "cover",
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600", color: COLORS.primary },
  offerCard: {
    backgroundColor: "#fff",
    width: 150,
    borderRadius: 14,
    padding: 10,
    marginRight: 12,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  offerImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  offerName: { fontSize: 14, fontWeight: "600", marginTop: 8 },
  offerPrice: { fontSize: 16, color: COLORS.primary, fontWeight: "700" },
  strikePrice: {
    fontSize: 12,
    color: "#8e8e8e",
    marginLeft: 6,
    textDecorationLine: "line-through",
  },
  discountText: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "600",
    color: "#10B981",
  },
  addBtnOverImg: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#09B44D",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    zIndex: 10,
  },
  addBtnOverImgText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  qtyContainerOverImg: {
    position: "absolute",
    bottom: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#09B44D",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 10,
  },
  qtyBtnSmall: {
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnTextSmall: {
    fontSize: 14,
    fontWeight: "700",
    color: "#09B44D",
  },
  qtyTextSmall: {
    paddingHorizontal: 6,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  categoryRowCard: {
    flexDirection: "row",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    width: 215,
    height: 100,
    alignItems: "center",
    justifyContent: "flex-start",
    overflow: "hidden",
    marginRight: 12,
  },
  categoryRowImage: {
    width: 72,
    height: 72,
    resizeMode: "contain",
    borderRadius: 12,
  },
  categoryRowText: {
    marginLeft: 14,
    fontWeight: "700",
    fontSize: 16,
    flexShrink: 1,
    color: "#000",
  },
  storeCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginBottom: 16,
    overflow: "hidden",
  },
  storeTopImage: { width: "100%", height: 145, resizeMode: "cover" },
  storeDetails: { padding: 10 },
  storeName: { fontSize: 15, fontWeight: "700" },
  storeAddress: { fontSize: 12, marginTop: 5, color: "#6B7280" },
  storeInfoRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  infoPill: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginRight: 6,
  },
  infoText: { fontSize: 11, marginLeft: 4, color: "#4B5563" },
  ratingText: { fontSize: 12, marginRight: 4, color: "#F59E0B" },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusOpen: { backgroundColor: "#DCFCE7" },
  statusClosed: { backgroundColor: "#FEE2E2" },
  statusText: { fontSize: 11, fontWeight: "700" },
  viewCartBar: {
    position: "absolute",
    bottom: 20,
    right: 100,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  viewCartText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  locationText: {
    marginLeft: 2,
    fontSize: 13,
    color: "#6B7280",
    flexShrink: 1,
    maxWidth: 200,
  },
});