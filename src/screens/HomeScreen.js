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
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { setLocation } from "../redux/slices/locationSlice";
import { addItem, incrementQty, decrementQty } from "../redux/slices/cartSlice";
import { COLORS, SIZES, API_URL } from "../config/constants";
import { Ionicons, Feather, Entypo } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const banners = [
  require("../../assets/freshfruits.png"),
  require("../../assets/freshveggies.png"),
  require("../../assets/softdrinks.png"),
];

function StoreItem({ item }) {
  const distance = item.distance ?? "2 km";
  const eta = item.eta ?? "5-8 Min";
  const rating = typeof item.rating === "number" ? item.rating : 4.2;
  const status = (item.status ?? "OPEN").toUpperCase();

  return (
    <TouchableOpacity style={styles.storeCard} activeOpacity={0.9}>
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
  const { address } = useSelector((state) => state.location);
  const cart = useSelector((state) => state.cart.items);

  // ✅ Count only unique products, not qty sum
  const totalItems = Object.keys(cart).length;

  const [offers, setOffers] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);
  const bannerRef = useRef(null);

  const addToCart = (item) => dispatch(addItem(item));
  const increment = (id) => dispatch(incrementQty(id));
  const decrement = (id) => dispatch(decrementQty(id));

  // ✅ Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({});
      const geo = await Location.reverseGeocodeAsync(pos.coords);

      if (geo.length > 0) {
        const a = geo[0];
        const fullAddress = [
          a.name, a.street, a.district, a.city, a.subregion, a.region, a.postalCode, a.country
        ].filter(Boolean).join(", ");

        dispatch(setLocation(fullAddress));
      }
    })();
  }, []);

  // ✅ API calls
  useEffect(() => {
    fetch(`${API_URL}/api/user/products/offers/exclusive`)
      .then(res => res.json()).then(d => d.success && setOffers(d.offers));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/seller/products/best-selling`)
      .then(res => res.json()).then(d => d.success && setBestSelling(d.products));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/all`)
      .then(res => res.json()).then(d => d.success && setCategories(d.categories));
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/apis/sellers`)
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          const filtered = d.sellers.filter(
            s => !["lachi store", "lachi grocery"].includes(s.shopName?.toLowerCase())
          );
          setStores(filtered);
        }
      });
  }, []);

  // ✅ Banner Auto Slide
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % banners.length;
      bannerRef.current?.scrollToOffset({ offset: i * (width - 60), animated: true });
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
          <Image source={{ uri: item.image[0] }} style={styles.offerImage} />
          {!qty ? (
            <TouchableOpacity style={styles.addBtnOverImg} onPress={() => addToCart(item)}>
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
            {item.sellerDiscount > 0 && (
              <Text style={styles.discountText}>{item.sellerDiscount}% OFF</Text>
            )}
          </View>
        ) : (
          <Text style={styles.offerPrice}>₹{item.price}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.userName}>Hello, Jahnavi 👋</Text>
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
        <TouchableOpacity style={styles.filterButton}>
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
          <Text style={styles.seeAll}>See All</Text>
        </View>
        <FlatList data={offers} horizontal renderItem={({ item }) => renderProductCard(item)} />

        {/* Best Selling */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Best Selling</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        <FlatList
          data={bestSelling}
          horizontal
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => {
            const qty = cart[item._id]?.qty ?? 0;

            return (
              <View style={styles.offerCard}>
                <View style={{ position: "relative" }}>
                  <Image source={{ uri: item.image[0] }} style={styles.offerImage} />

                  {!qty ? (
                    <TouchableOpacity style={styles.addBtnOverImg} onPress={() => addToCart(item)}>
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
          <Text style={styles.seeAll}>See All</Text>
        </View>

        <FlatList
          data={categories}
          horizontal
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.categoryRowCard, { backgroundColor: getRandomColor() }]}>
              <Image source={{ uri: item.image }} style={styles.categoryRowImage} />
              <Text style={styles.categoryRowText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Stores */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Stores</Text>
          <Text style={styles.seeAll}>See All</Text>
        </View>

        <FlatList
          data={stores}
          scrollEnabled={false}
          renderItem={({ item }) => <StoreItem item={item} />}
        />
      </ScrollView>

      {/* ✅ Mini Cart Bubble */}
      {totalItems > 0 && (
        <TouchableOpacity style={styles.viewCartBar} onPress={() => console.log("GO TO CART")}>
          <Ionicons name="cart-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.viewCartText}>View Cart • {totalItems} items</Text>
        </TouchableOpacity>
      )}
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
