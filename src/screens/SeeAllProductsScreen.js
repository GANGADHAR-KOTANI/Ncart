import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import Feather from "@expo/vector-icons/Feather";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRoute, useNavigation } from "@react-navigation/native";
import { COLORS } from "../config/constants";
import { useDispatch, useSelector } from "react-redux";

import axios_api from "../config/axiosConfig.js";

// ❤️ Hook
import useFavourite from "../hooks/useFavourite";

// 🛒 Cart Slice
import {
  addToCart,
  removeFromCart,
  fetchCart,
  localIncrement,
  localDecrement,
} from "../redux/slices/cartSlice";

const { width } = Dimensions.get("window");

/* ----------------------------------------------------------
    ⭐ COMPONENT FOR EACH PRODUCT ITEM  
------------------------------------------------------------*/
function ProductCardItem({
  item,
  type,
  getQuantity,
  handleAddToCart,
  handleRemoveFromCart,
}) {
  const { isFav, toggleFav } = useFavourite(item._id); // VALID HOOK USE

  const quantity = getQuantity(item._id);

  const isDiscounted = item.isDiscounted;
  const originalPrice = item.price;
  const offerPrice = isDiscounted
    ? (originalPrice - (originalPrice * item.sellerDiscount) / 100).toFixed(0)
    : originalPrice;

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: Array.isArray(item.image)
              ? item.image[0]
              : item.image || item.images?.[0],
          }}
          style={styles.image}
        />

        {/* ❤️ Favourite */}
        <TouchableOpacity style={styles.likeButton} onPress={toggleFav}>
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={COLORS.primary}
          />
        </TouchableOpacity>

        {/* 🛒 Cart Controls */}
        <View style={styles.addContainer}>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item._id)}
            >
              <Text style={styles.addText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => handleRemoveFromCart(item._id)}>
                <Text style={styles.counterBtn}>-</Text>
              </TouchableOpacity>

              <Text style={styles.counterValue}>{quantity}</Text>

              <TouchableOpacity onPress={() => handleAddToCart(item._id)}>
                <Text style={styles.counterBtn}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>

      {type === "exclusive" && isDiscounted ? (
        <>
          <View style={styles.priceRow}>
            <View style={styles.offerBox}>
              <Text style={styles.offerBoxText}>₹{offerPrice}</Text>
            </View>
            <Text style={styles.strikePrice}>₹{originalPrice}</Text>
          </View>
          <Text style={styles.discountText}>
            ₹{(originalPrice - offerPrice).toFixed(0)} OFF
          </Text>
        </>
      ) : (
        <Text style={styles.price}>₹{originalPrice}</Text>
      )}
    </View>
  );
}

/* ----------------------------------------------------------
    ⭐ MAIN SCREEN 
------------------------------------------------------------*/
export default function SeeAllProductsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { type } = route.params || {};

  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  const cartSellers = useSelector((s) => s.cart.sellers || []);

  useEffect(() => {
    fetchProducts();
    dispatch(fetchCart());
  }, [type]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const endpoint =
        type === "exclusive"
          ? "/api/user/products/offers/exclusive"
          : "/api/seller/products/best-selling";

      const res = await axios_api.get(endpoint);
      const data = res.data;

      setProducts(
        data.products || data.relatedOffers || data.relatedProducts || []
      );
    } catch (err) {
      console.log("❌ Error:", err.message);
      Alert.alert("Error", "Unable to fetch products.");
    } finally {
      setLoading(false);
    }
  };

  const getQuantity = (productId) => {
    for (const seller of cartSellers) {
      for (const item of seller.items || []) {
        const pid =
          typeof item.productId === "string"
            ? item.productId
            : item.productId?._id;

        if (String(pid) === String(productId)) return item.quantity || 0;
      }
    }
    return 0;
  };

  const handleAddToCart = async (productId) => {
    dispatch(localIncrement({ productId }));
    try {
      await dispatch(addToCart({ productId })).unwrap();
      dispatch(fetchCart());
    } catch {
      dispatch(fetchCart());
    }
  };

  const handleRemoveFromCart = async (productId) => {
    dispatch(localDecrement({ productId }));
    try {
      await dispatch(removeFromCart({ productId })).unwrap();
      dispatch(fetchCart());
    } catch {
      dispatch(fetchCart());
    }
  };

  const totalCartCount = cartSellers.reduce(
    (sum, seller) => sum + (seller.items?.length || 0),
    0
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={styles.container}>
        {/* Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={26} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.header}>
          {type === "exclusive" ? "Exclusive Offers" : "Best Selling"}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() =>
                  navigation.navigate("SingleProduct", {
                    id: item._id,
                    context: type === "exclusive" ? "exclusive" : "best-selling",
                  })
                }
              >
                <ProductCardItem
                  item={item}
                  type={type}
                  getQuantity={getQuantity}
                  handleAddToCart={handleAddToCart}
                  handleRemoveFromCart={handleRemoveFromCart}
                />
              </TouchableOpacity>
            )}
          />
        )}

        {totalCartCount > 0 && (
          <TouchableOpacity style={styles.cartBar}>
            <Feather name="shopping-cart" size={20} color={COLORS.white} />
            <Text style={styles.cartText}>View Cart ({totalCartCount})</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ----------------------------------------------------------
    ⭐ STYLES (unchanged)
------------------------------------------------------------*/
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
    paddingTop: 10,
  },

  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    zIndex: 10,
  },

  favButton: {
    position: "absolute",
    top: 40,
    right: 15,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 6,
    elevation: 3,
    zIndex: 10,
  },

  header: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 10,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    width: (width - 30) / 2,
    marginBottom: 15,
    elevation: 3,
    padding: 8,
  },

  imageContainer: { position: "relative" },
  image: { width: "100%", height: 120, borderRadius: 10 },

  likeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 4,
    elevation: 3,
  },

  addContainer: { position: "absolute", bottom: 6, right: 6 },

  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },

  addText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  counterBtn: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 6,
  },

  counterValue: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginHorizontal: 4,
  },

  name: { fontSize: 13, fontWeight: "600", color: "#333", marginTop: 4 },

  price: { color: COLORS.primary, fontWeight: "700", marginTop: 5 },

  strikePrice: {
    fontSize: 13,
    color: COLORS.gray,
    textDecorationLine: "line-through",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 5,
  },

  offerBox: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },

  offerBoxText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },

  discountText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
    marginTop: 3,
  },

  cartBar: {
    position: "absolute",
    bottom: 20,
    left: "25%",
    right: "25%",
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    elevation: 5,
  },

  cartText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
});
