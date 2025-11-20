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
import { useRoute, useNavigation } from "@react-navigation/native";
import { Heart, ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import globalStyles from "../globalStyles";
import { COLORS } from "../config/constants";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  removeFromCart,
  fetchCart,
  localIncrement,
  localDecrement,
} from "../redux/slices/cartSlice";
import { fetchFavorites } from "../redux/slices/favoritesSlice";
import CartBubble from "../components/CartBubble";
import useFavourite from "../hooks/useFavourite";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const ProductCard = ({ item, quantity, onAdd, onRemove }) => {
  const { isFav, toggleFav } = useFavourite(item._id);

  return (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: Array.isArray(item.image) ? item.image[0] : item.image,
          }}
          style={styles.productImage}
        />

        <TouchableOpacity style={styles.likeButton} onPress={toggleFav}>
          <Heart
            color={COLORS.primary}
            fill={isFav ? COLORS.primary : "none"}
            size={20}
          />
        </TouchableOpacity>

        <View style={styles.addContainer}>
          {quantity === 0 ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAdd(item._id)}
            >
              <Text style={styles.addText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.counterContainer}>
              <TouchableOpacity onPress={() => onRemove(item._id)}>
                <Text style={styles.counterBtn}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{quantity}</Text>
              <TouchableOpacity onPress={() => onAdd(item._id)}>
                <Text style={styles.counterBtn}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>₹{item.price}</Text>
    </View>
  );
};

export default function SellerMainScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { sellers } = useSelector((s) => s.cart);

  const { sellerId, category, fromNearby } = route.params || {};

  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category || "");

  useEffect(() => {
    if (sellerId) fetchSellerData();
    dispatch(fetchCart());
    dispatch(fetchFavorites());

    // NOTE: removed early forcing of route.params.category here
    // to avoid setting category before seller/categories load.
  }, [sellerId, dispatch]);

  // ⭐ NEW: apply incoming category AFTER seller data is loaded
  useEffect(() => {
    if (
      seller && // seller data loaded
      route.params?.fromCategoryScreen &&
      route.params?.category
    ) {
      setSelectedCategory(route.params.category);
      fetchProductsByCategory(route.params.category);
    }
  }, [seller]); // runs after seller state updates

  useEffect(() => {
    if (category && !fromNearby) {
      setSelectedCategory(category);
      fetchProductsByCategory(category);
    }
  }, [category, fromNearby]);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://selecto-project.onrender.com/apis/seller-page/${sellerId}`
      );
      const data = await res.json();
      if (data.success) {
        setSeller(data.seller);
        setCategories(data.categories || []);
        setCategoryImages(data.category_img || []);
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);

        if (route.params?.category) {
          // keep this — we still want to respect category param if present
          setSelectedCategory(route.params.category);
          fetchProductsByCategory(route.params.category);
        } else {
          setSelectedCategory(data.categories?.[0] || "");
        }
      }
    } catch (err) {
      console.log("Error fetching seller data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByCategory = async (category) => {
    try {
      setProductLoading(true);
      const encoded = encodeURIComponent(category);
      const res = await fetch(
        `https://selecto-project.onrender.com/apis/sellers/${sellerId}/products/${encoded}`
      );
      const data = await res.json();
      if (data.success && data.products?.length) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (err) {
      console.log("Error fetching products:", err);
    } finally {
      setProductLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    fetchProductsByCategory(cat);
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (!text.trim()) return setFilteredProducts(products);

    const filtered = products.filter((p) =>
      p.name?.toLowerCase().startsWith(text.toLowerCase())
    );
    setFilteredProducts(filtered);
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

  const getProductQuantity = (productId) => {
    for (const seller of sellers) {
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

  const renderProductItem = ({ item }) => {
    const qty = getProductQuantity(item._id);

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("SingleProduct", {
            id: item._id,
            context: "category",
          })
        }
        activeOpacity={0.8}
      >
        <ProductCard
          item={item}
          quantity={qty}
          onAdd={handleAddToCart}
          onRemove={handleRemoveFromCart}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={[globalStyles.container, styles.container]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
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
                  keyExtractor={(item, i) => i.toString()}
                  renderItem={({ item }) => {
                    const catData = categoryImages.find(
                      (c) => c.name === item
                    );
                    const active = selectedCategory === item;

                    return (
                      <TouchableOpacity
                        style={[styles.categoryItem, active && { padding: 0 }]}
                        onPress={() => handleCategorySelect(item)}
                      >
                        {active ? (
                          <LinearGradient
                            colors={["#ffffff", COLORS.primary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.gradientWrapper}
                          >
                            {catData && (
                              <Image
                                source={{
                                  uri: Array.isArray(catData.image)
                                    ? catData.image[0]
                                    : catData.image,
                                }}
                                style={styles.categoryImage}
                              />
                            )}
                            <Text
                              style={[
                                styles.categoryText,
                                styles.activeCategoryText,
                              ]}
                            >
                              {item}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <>
                            {catData && (
                              <Image
                                source={{
                                  uri: Array.isArray(catData.image)
                                    ? catData.image[0]
                                    : catData.image,
                                }}
                                style={styles.categoryImage}
                              />
                            )}
                            <Text style={styles.categoryText}>{item}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    );
                  }}
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

            <CartBubble navigation={navigation} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", flex: 1, paddingTop: -5 },
  backButton: {
    position: "absolute",
    top: 5,
    left: 10,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 2,
    elevation: 4,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
  },
  sellerImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  sellerName: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
  sellerAddress: { fontSize: 13, color: "#777" },
  contentRow: { flexDirection: "row", flex: 1 },
  leftColumn: {
    width: "25%",
    backgroundColor: "#f4f4f4",
    paddingVertical: 10,
    elevation: 4,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 6,
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
  activeCategoryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
  rightColumn: { width: "75%", paddingHorizontal: 10, paddingVertical: 5 },
  row: { justifyContent: "space-between", marginBottom: 15 },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: (width * 0.75 - 36) / 2,
    elevation: 3,
    padding: 8,
    minHeight: 210,
  },
  imageContainer: { position: "relative" },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
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
  },
  productPrice: { fontSize: 13, color: COLORS.primary, fontWeight: "600" },
  noProducts: { textAlign: "center", color: "#777", marginTop: 50 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    elevation: 3,
    color: "#333",
  },
});
