import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native"; // ✅ added navigation
import { ShoppingCart, Heart, ArrowLeft } from "lucide-react-native"; // ✅ added ArrowLeft icon
import { LinearGradient } from "expo-linear-gradient";
import globalStyles from "../globalStyles";
import { COLORS } from "../config/constants";

const { width } = Dimensions.get("window");

export default function SellerMainScreen() {
  const route = useRoute();
  const navigation = useNavigation(); // ✅ for back navigation
  const { sellerId } = route.params || {};

  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [showCartBar, setShowCartBar] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [likedItems, setLikedItems] = useState({});

  useEffect(() => {
    if (sellerId) fetchSellerData();
  }, [sellerId]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const url = `https://selecto-project.onrender.com/apis/seller-page/${sellerId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSeller(data.seller);
        setCategories(data.categories || []);
        setCategoryImages(data.category_img || []);
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
        setSelectedCategory(data.categories?.[0] || "");
      }
    } catch (error) {
      console.log("Error fetching seller data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (category) => {
    try {
      setProductLoading(true);
      const url = `https://selecto-project.onrender.com/apis/seller-page/${sellerId}?category=${category}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      }
    } catch (error) {
      console.log("Error fetching products:", error);
    } finally {
      setProductLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchProductsByCategory(category);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((item) =>
        item.name?.toLowerCase().startsWith(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleAddToCart = (productId) => {
    setCart((prev) => {
      const isNewItem = !prev[productId];
      const updated = {
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      };
      if (isNewItem) setShowCartBar(true);
      return updated;
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      if (Object.keys(updated).length === 0) setShowCartBar(false);
      return updated;
    });
  };

  const handleLike = (productId, productName) => {
    setLikedItems((prev) => {
      const updated = { ...prev };
      if (updated[productId]) {
        delete updated[productId];
        Alert.alert("Removed from Favorites 💔", `${productName} was removed`);
      } else {
        updated[productId] = true;
        Alert.alert("Added to Favorites ❤️", `${productName} was added`);
      }
      return updated;
    });
  };

  const totalCartCount = Object.keys(cart).length;

  const renderCategoryItem = ({ item }) => {
    const categoryData = categoryImages.find((cat) => cat.name === item);
    const isSelected = selectedCategory === item;

    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && { padding: 0 }]}
        onPress={() => handleCategorySelect(item)}
      >
        {isSelected ? (
          <LinearGradient
            colors={["#ffffff", COLORS.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientWrapper}
          >
            {categoryData && (
              <Image
                source={{
                  uri: Array.isArray(categoryData.image)
                    ? categoryData.image[0]
                    : categoryData.image,
                }}
                style={styles.categoryImage}
                resizeMode="cover"
              />
            )}
            <Text style={[styles.categoryText, styles.activeCategoryText]}>
              {item}
            </Text>
          </LinearGradient>
        ) : (
          <>
            {categoryData && (
              <Image
                source={{
                  uri: Array.isArray(categoryData.image)
                    ? categoryData.image[0]
                    : categoryData.image,
                }}
                style={styles.categoryImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.categoryText}>{item}</Text>
          </>
        )}
      </TouchableOpacity>
    );
  };

  const renderProductItem = ({ item }) => {
    const quantity = cart[item._id] || 0;
    const isLiked = likedItems[item._id];

    return (
      <View style={styles.productCard}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: Array.isArray(item.image) ? item.image[0] : item.image,
            }}
            style={styles.productImage}
            resizeMode="cover"
          />

          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => handleLike(item._id, item.name)}
          >
            <Heart
              color={isLiked ? "red" : COLORS.primary}
              fill={isLiked ? "red" : "none"}
              size={20}
            />
          </TouchableOpacity>

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

        <Text style={styles.productName} numberOfLines={2} ellipsizeMode="tail">
          {item.name}
        </Text>

        <Text style={styles.productPrice}>₹{item.price}</Text>
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* ✅ Back Arrow Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft color={COLORS.primary} size={26} />
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 100 }}
        />
      ) : (
        <>
          {seller && (
            <View style={styles.sellerHeader}>
              <Image
                source={{
                  uri: Array.isArray(seller.shopImage)
                    ? seller.shopImage[0]
                    : seller.shopImage,
                }}
                style={styles.sellerImage}
                resizeMode="cover"
              />
              <View>
                <Text style={styles.sellerName}>{seller.shopName}</Text>
                <Text style={styles.sellerAddress}>{seller.address}</Text>
              </View>
            </View>
          )}

          <View style={styles.contentRow}>
            <View style={styles.leftColumn}>
              <FlatList
                data={categories}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderCategoryItem}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={styles.rightColumn}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search product..."
                value={searchText}
                onChangeText={handleSearch}
                placeholderTextColor="#888"
              />

              {productLoading ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={{ marginTop: 50 }}
                />
              ) : filteredProducts.length > 0 ? (
                <FlatList
                  data={filteredProducts}
                  keyExtractor={(item) => item._id}
                  renderItem={renderProductItem}
                  numColumns={2}
                  columnWrapperStyle={styles.row}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Text style={styles.noProducts}>No products found</Text>
              )}
            </View>
          </View>

          {showCartBar && totalCartCount > 0 && (
            <TouchableOpacity style={styles.cartBar}>
              <ShoppingCart color={COLORS.white} size={20} />
              <Text style={styles.cartText}>View Cart ({totalCartCount})</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1, paddingTop: 20 },
  backButton: {
    position: "absolute",
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    elevation: 4,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginTop: 40, // spacing below back arrow
  },
  sellerImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  sellerName: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
  sellerAddress: { fontSize: 13, color: "#777" },
  contentRow: { flexDirection: "row", flex: 1 },
  leftColumn: {
    width: "25%",
    backgroundColor: "#f4f4f4",
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 6,
    borderWidth: 0,
  },
  gradientWrapper: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  categoryImage: { width: 50, height: 50, borderRadius: 8, marginBottom: 5 },
  categoryText: { fontSize: 11, textAlign: "center", color: "#333" },
  activeCategoryText: { color: "#fff", fontWeight: "600", fontSize: 11 },
  rightColumn: { width: "75%", paddingHorizontal: 10, paddingVertical: 5 },
  row: { justifyContent: "space-between", marginBottom: 15 },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: (width * 0.75 - 36) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    padding: 8,
    minHeight: 210,
    justifyContent: "space-between",
  },
  imageContainer: { position: "relative" },
  productImage: { width: "100%", height: 100, borderRadius: 10, marginBottom: 8 },
  likeButton: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#fff",
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
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    marginTop: 4,
    height: 42,
    lineHeight: 18,
    overflow: "hidden",
  },
  productPrice: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  noProducts: { textAlign: "center", color: "#777", marginTop: 50 },
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
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cartText: { color: "#fff", fontWeight: "600", marginLeft: 8 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 0,
    color: "#333",
  },
});
