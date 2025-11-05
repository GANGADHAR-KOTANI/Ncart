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
} from "react-native";
import { ShoppingCart } from "lucide-react-native";
import globalStyles from "../globalStyles";
import { COLORS } from "../config/constants";

const { width } = Dimensions.get("window");
const sellerId = "69059346541acd02982db4aa";

export default function SellerMainScreen() {
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [showCartBar, setShowCartBar] = useState(false);

  useEffect(() => {
    fetchSellerData();
  }, []);

  const fetchSellerData = async (category = "") => {
    try {
      setLoading(true);
      const url = category
        ? `https://selecto-project.onrender.com/apis/seller-page/${sellerId}?category=${category}`
        : `https://selecto-project.onrender.com/apis/seller-page/${sellerId}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setSeller(data.seller);
        setCategories(data.categories || []);
        setCategoryImages(data.category_img || []);
        setProducts(data.products || []);
        setSelectedCategory(category || (data.categories?.[0] || ""));
      } else {
        console.log(" Data fetch failed:", data);
      }
    } catch (error) {
      console.log("Error fetching seller data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchSellerData(category);
  };

  // ✅ Fixed cart logic
  const handleAddToCart = (productId) => {
    setCart((prev) => {
      const isNewItem = !prev[productId]; // first time adding this product
      const updated = {
        ...prev,
        [productId]: (prev[productId] || 0) + 1,
      };
      if (isNewItem) setShowCartBar(true);
      return updated;
    });
  };

  // ✅ Remove + hide cart bar if empty
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

  // ✅ Total number of unique items
  const totalCartCount = Object.keys(cart).length;

  /** Render single category item */
  const renderCategoryItem = ({ item }) => {
    const categoryData = categoryImages.find((cat) => cat.name === item);
    return (
      <TouchableOpacity
        style={[
          styles.categoryItem,
          selectedCategory === item && styles.activeCategory,
        ]}
        onPress={() => handleCategorySelect(item)}
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

        <Text
          style={[
            styles.categoryText,
            selectedCategory === item && styles.activeCategoryText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  /** Render single product card */
  const renderProductItem = ({ item }) => {
    const quantity = cart[item._id] || 0;

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
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>₹{item.price}</Text>
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, styles.container]}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={{ marginTop: 100 }}
        />
      ) : (
        <>
          {/* 🏪 Seller Header */}
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

          {/* 🧭 Main Content */}
          <View style={styles.contentRow}>
            {/* Categories */}
            <View style={styles.leftColumn}>
              <FlatList
                data={categories}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderCategoryItem}
                showsVerticalScrollIndicator={false} // ✅ no dark scrollbar
              />
            </View>

            {/* Products */}
            <View style={styles.rightColumn}>
              {products.length > 0 ? (
                <FlatList
                  data={products}
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

          {/* 🛒 Floating Cart */}
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

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flex: 1,
    paddingTop: 20,
  },
  sellerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    padding: 12,
  },
  sellerImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  sellerName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
  sellerAddress: {
    fontSize: 13,
    color: "#777",
  },
  contentRow: {
    flexDirection: "row",
    flex: 1,
  },
  // ✅ Removed dark scroll border
  leftColumn: {
    width: "25%",
    backgroundColor: "#f4f4f4",
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
    marginHorizontal: 6,
    backgroundColor: "#fff",
  },
  categoryImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginBottom: 5,
  },
  activeCategory: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 11,
    textAlign: "center",
    color: "#333",
  },
  activeCategoryText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 11,
  },
  rightColumn: {
    width: "75%",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    width: (width * 0.75 - 36) / 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
    padding: 8,
  },
  imageContainer: {
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  addContainer: {
    position: "absolute",
    bottom: 6,
    right: 6,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  addText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
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
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  productPrice: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  noProducts: {
    textAlign: "center",
    color: "#777",
    marginTop: 50,
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
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cartText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
  },
});
