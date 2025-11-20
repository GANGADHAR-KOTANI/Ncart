import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { COLORS } from "../config/constants";
import {
  addToCart,
  removeFromCart,
  fetchCart,
} from "../redux/slices/cartSlice";

export default function ProductCard({ product, variant = "product" }) {
  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart);
  const [quantity, setQuantity] = useState(0);

  // ✅ Sync local quantity with Redux
  useEffect(() => {
    if (!cart?.sellers?.length) {
      setQuantity(0);
      return;
    }

    let foundQty = 0;
    for (const seller of cart.sellers) {
      for (const item of seller.items || []) {
        const pid =
          typeof item.productId === "string"
            ? item.productId
            : item.productId?._id;
        if (String(pid) === String(product?._id)) {
          foundQty = item.quantity || 0;
          break;
        }
      }
    }
    setQuantity(foundQty);
  }, [cart.sellers, product]);

  // ✅ Handle Add
  const handleAdd = async () => {
    try {
      if (quantity === 0) {
        await dispatch(addToCart({ productId: product._id })).unwrap();
        await dispatch(fetchCart());
      } else {
        dispatch({ type: "cart/localIncrement", payload: { productId: product._id } });
        await dispatch(addToCart({ productId: product._id })).unwrap();
      }
    } catch (err) {
      console.log("Add to cart error:", err);
      dispatch(fetchCart());
    }
  };

  // ✅ Handle Decrease
  const handleDecrease = async () => {
    try {
      if (quantity > 1) {
        dispatch({ type: "cart/localDecrement", payload: { productId: product._id } });
        await dispatch(removeFromCart({ productId: product._id })).unwrap();
      } else if (quantity === 1) {
        // just remove from cart entirely
        await dispatch(removeFromCart({ productId: product._id })).unwrap();
        await dispatch(fetchCart());
      }
    } catch (err) {
      console.log("Remove from cart error:", err);
      dispatch(fetchCart());
    }
  };

  const originalPrice = product.originalPrice ?? product.price ?? 0;
  const discountedPrice =
    product.discountedPrice ?? product.price ?? originalPrice;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Image
          source={{ uri: product.image?.[0] || product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.addWrap}>
          {quantity > 0 ? (
            <View style={styles.qtyRow}>
              <TouchableOpacity onPress={handleDecrease} style={styles.qtyButton}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <View style={styles.qtyCount}>
                <Text style={styles.qtyText}>{quantity}</Text>
              </View>
              <TouchableOpacity onPress={handleAdd} style={styles.qtyButton}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleAdd} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>

        {variant === "offer" && product.sellerDiscount ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{product.sellerDiscount}% OFF</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.store} numberOfLines={1}>
          {product.sellerId?.shopName || product.sellerName || ""}
        </Text>
        <View style={styles.priceRow}>
          {variant === "offer" && originalPrice > discountedPrice ? (
            <>
              <Text style={styles.originalPrice}>₹{originalPrice}</Text>
              <Text style={styles.currentPrice}> ₹{discountedPrice}</Text>
            </>
          ) : (
            <Text style={styles.currentPrice}>
              ₹{product.price ?? discountedPrice}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    paddingBottom: 10,
    elevation: 2,
  },
  top: { height: 120, backgroundColor: "#f6f6f6", position: "relative" },
  image: { width: "100%", height: "100%" },
  addWrap: { position: "absolute", right: 8, bottom: 8 },
  actionBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    overflow: "hidden",
  },
  qtyButton: { paddingHorizontal: 8, paddingVertical: 6 },
  qtyBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  qtyCount: {
    minWidth: 30,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  qtyText: { color: "#fff", fontWeight: "700" },
  discountBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  bottom: { paddingHorizontal: 10, paddingTop: 8 },
  name: { fontSize: 14, fontWeight: "600", color: "#222" },
  store: { color: "#777", fontSize: 12, marginTop: 4 },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  originalPrice: {
    textDecorationLine: "line-through",
    color: "#999",
    fontSize: 12,
    marginRight: 6,
  },
  currentPrice: { color: "#111", fontWeight: "700", fontSize: 14 },
});
