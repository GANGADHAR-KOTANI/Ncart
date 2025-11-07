import React, { useEffect, useState } from "react";
import { COLORS } from "../config/constants";
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
import getToken from "../utils/getToken";
import axios_api from "../config/axiosConfig";
import { useNavigation } from "@react-navigation/native";

const FavouritesScreen = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const response = await axios_api.get("/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const favs = response?.data?.favorites || [];
      setFavourites(favs);
    } catch (error) {
      console.error("Error fetching favourites:", error.message);
    }
  };

  const handleToggleFavourite = async (itemId) => {
    try {
      const token = await getToken();
      await axios_api.post(
        "/api/user/toggle",
        { productId: itemId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchFavourites();
    } catch (error) {
      console.error("Error toggling favourite:", error.message);
    }
  };

  const handleProductClick = (item) => {
    navigation.navigate("ProductDetails", { product: item });
  };

  const handleAddAllToCart = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      await axios_api.post(
        "/api/cart/favorites/add-all-to-cart",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "All favourites added to cart!");
      setFavourites([]);
    } catch (error) {
      console.error("Error adding all to cart:", error.message);
      Alert.alert("Error", "Something went wrong while adding to cart.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingleToCart = async (item) => {
    try {
      const token = await getToken();
      if (!token) return;

      await axios_api.post(
        "/api/cart/add",
        { productId: item._id || item.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", `${item.name} added to cart!`);
      handleToggleFavourite(item._id || item.id);
    } catch (error) {
      console.error("Error adding single item:", error.message);
      Alert.alert("Error", "Something went wrong while adding to cart.");
    }
  };

  const renderItem = ({ item }) => {
    const itemId = item._id || item.id;

    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => handleProductClick(item)}
      >
        <View style={styles.row}>
          {item.image ? (
            <Image source={{ uri: item.image?.[0] }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.noImage]}>
              <Text style={{ color: "gray", fontSize: 12 }}>No Image</Text>
            </View>
          )}

          <View style={styles.textContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{item.name}</Text>

              <View style={styles.iconRow}>
                <TouchableOpacity onPress={() => handleAddSingleToCart(item)}>
                  <Ionicons name="cart-outline" size={22} color="black" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginLeft: 10 }}
                  onPress={() => handleToggleFavourite(itemId)}
                >
                  <Ionicons name="heart" size={22} color="red" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.price}>Rs {item.price?.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Favourites</Text>

        <FlatList
          data={favourites}
          renderItem={renderItem}
          keyExtractor={(item, index) =>
            (item._id || item.id || index).toString()
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: favourites.length > 0 ? 120 : 20,
          }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40, color: "gray" }}>
              No favourites found.
            </Text>
          }
        />

        {favourites.length > 0 && (
          <View style={styles.bottomButtonWrapper}>
            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.6 }]}
              onPress={handleAddAllToCart}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Adding..." : "Add All To Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default FavouritesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 10,
  },
  itemContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 80,
    resizeMode: "contain",
    borderRadius: 6,
  },
  noImage: {
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: { flex: 1, marginLeft: 10 },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginTop: 2,
  },

  
  bottomButtonWrapper: {
    position: "absolute",
    bottom: -20,        
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 2,   
  },

  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    elevation: 4,         
  },


  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});



