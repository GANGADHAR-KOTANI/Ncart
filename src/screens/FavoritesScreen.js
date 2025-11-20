// Ncart/src/screens/FavouritesScreen.js

import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

import { COLORS } from "../config/constants";

import { useDispatch, useSelector } from "react-redux";

import { fetchFavorites } from "../redux/slices/favoritesSlice";
import { addToCart, fetchCart } from "../redux/slices/cartSlice";

import CartBubble from "../components/CartBubble";
import useFavourite from "../hooks/useFavourite"; // hook import

/* -------------------------------------------------------------
   FIXED: Separate component so the hook is valid!
--------------------------------------------------------------*/
const FavouriteItem = ({ item, navigation, handleAddSingleToCart }) => {
  const { isFav, toggleFav } = useFavourite(item._id); // SAFE

  return (
    
      <View style={styles.row} >
        {item.image?.length ? (
          <Image source={{ uri: item.image[0] }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.noImage]}>
            <Text style={{ color: "gray", fontSize: 12 }}>No Image</Text>
          </View>
        )}

        <View style={styles.textContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}
            </Text>

            <View style={styles.iconRow}>
              <TouchableOpacity
                onPress={() => handleAddSingleToCart(item, toggleFav)}
              >
                <Text style={{ fontSize: 20 }}>🛒</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ marginLeft: 10 }}
                onPress={toggleFav}
              >
                <Ionicons
                  name={isFav ? "heart" : "heart-outline"}
                  size={22}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.price}>Rs {item.price}</Text>
        </View>
      </View>
    
  );
};

/* -------------------------------------------------------------
   MAIN SCREEN
--------------------------------------------------------------*/
const FavouritesScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { items: favourites = [], loading } = useSelector(
    (state) => state.favorites
  );

  useEffect(() => {
    dispatch(fetchFavorites());
  }, []);

  const handleAddSingleToCart = async (item, toggleFav) => {
    try {
      await dispatch(addToCart({ productId: item._id })).unwrap();

      if (typeof toggleFav === "function") toggleFav();

      dispatch(fetchCart());
      dispatch(fetchFavorites());
    } catch {
      Alert.alert("Error", "Something went wrong while adding to cart.");
    }
  };

  const handleAddAllToCart = async () => {
    try {
      const allProducts = [];
      favourites.forEach((group) => {
        (group.products || []).forEach((p) => allProducts.push(p));
      });

      if (allProducts.length === 0) {
        Alert.alert("No items", "No favourites to add.");
        return;
      }

      const results = await Promise.all(
        allProducts.map((p) =>
          dispatch(addToCart({ productId: p._id }))
            .unwrap()
            .catch(() => ({ _error: true }))
        )
      );

      const failed = results.filter((r) => r._error);
      if (failed.length > 0)
        Alert.alert("Partial Success", "Some items failed to add.");
      else Alert.alert("Success", "All favourites added to cart!");

      dispatch(fetchCart());
      dispatch(fetchFavorites());
    } catch {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  const renderShopSection = ({ item }) => (
    <View style={styles.sellerBlock}>
      <Text style={styles.shopName}>{item.shopName}</Text>

      <FlatList
        data={item.products}
        keyExtractor={(p) => p._id}
        renderItem={({ item }) => (
          <FavouriteItem
            item={item}
            navigation={navigation}
            handleAddSingleToCart={handleAddSingleToCart}
          />
        )}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Favourites</Text>

        <FlatList
          data={favourites}
          renderItem={renderShopSection}
          keyExtractor={(seller, index) =>
            seller.sellerId || index.toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: favourites.length > 0 ? 120 : 20,
          }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              No favourites found.
            </Text>
          }
        />

        {favourites.length > 0 && (
          <View style={styles.bottomButtonWrapper}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleAddAllToCart}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Adding..." : "Add All To Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <CartBubble navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default FavouritesScreen;

/** Styles unchanged */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#fff", padding: 16, paddingBottom: 50 },
  header: { fontSize: 22, fontWeight: "600", textAlign: "center", marginVertical: -2 },
  sellerBlock: { marginBottom: 25, backgroundColor: "#fff", paddingVertical: 4 },
  shopName: { fontSize: 18, fontWeight: "600", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#eee" },
  itemContainer: {  },
  row: { flexDirection: "row", alignItems: "center",backgroundColor: "#f8f8f8", borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: "#e5e5e5" },
  image: { width: 65, height: 75, resizeMode: "contain", borderRadius: 6 },
  noImage: { backgroundColor: "#eee", justifyContent: "center", alignItems: "center" },
  textContainer: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  iconRow: { flexDirection: "row", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "500", flex: 1, marginRight: 4 },
  price: { fontSize: 15, fontWeight: "700", color: COLORS.primary },
  bottomButtonWrapper: { position: "absolute", bottom: 0, left: 0, right: 0, alignItems: "center" },
  button: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: "center", width: "50%" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
