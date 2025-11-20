// src/screens/SingleProductPage.js
import { useEffect, useState, useCallback } from "react";
import { useRoute } from "@react-navigation/native";
import {
  Text,
  View,
  Image,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import getToken from "../utils/getToken";

// Redux
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart, fetchCart } from "../redux/slices/cartSlice";

import CartBubble from "../components/CartBubble";

// ❤️ FAVOURITE HOOK
import useFavourite from "../hooks/useFavourite";

const { width } = Dimensions.get("window");

/* -------------------------------------------------------------
   ⭐ COMPONENT: Related / Exclusive / BestSelling PRODUCT CARD
   - Hooks are allowed because it's a top-level component
--------------------------------------------------------------*/
function RelatedProductCard({ item, onPress }) {
  const { isFav, toggleFav } = useFavourite(item.id);

  return (
    <TouchableOpacity style={styles.gridItemWrap} onPress={onPress}>
      <View style={styles.gridItem}>
        <Image source={{ uri: item.image }} style={styles.gridItemImage} />

        {/* ❤️ Favourite */}
        <TouchableOpacity style={styles.smallFavBtn} onPress={toggleFav}>
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={18}
            color={isFav ? "green" : "gray"}
          />
        </TouchableOpacity>

        <Text numberOfLines={1} style={styles.gridItemName}>
          {item.name}
        </Text>

        <Text style={styles.gridItemPrice}>₹{item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

/* -------------------------------------------------------------
   ⭐ MAIN SCREEN 
--------------------------------------------------------------*/
export default function SingleProductPage({ navigation }) {
  const route = useRoute();
  const { id, context, category, maxPrice } = route.params || {};
  console.log("🔥 ROUTE PARAMS:", route.params);




  const dispatch = useDispatch();
  const cart = useSelector((s) => s.cart);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const [imageError, setImageError] = useState(false);

  // ❤️ FAV for main product
  const { isFav, toggleFav } = useFavourite(id);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [exclusiveProducts, setExclusiveProducts] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);

  const [openDescription, setOpenDescription] = useState(true);
  const [openNutrition, setOpenNutrition] = useState(false);
  const [openReview, setOpenReview] = useState(false);

  const [cartLoading, setCartLoading] = useState(false);

  /* -------------------------------------------------------------
     ⭐ CART QUANTITY
  --------------------------------------------------------------*/
  const productQty = (() => {
    if (!product) return 0;

    let qty = 0;
    (cart.sellers || []).forEach((seller) => {
      (seller.items || []).forEach((item) => {
        if (item.productId?._id === product.id) qty = item.quantity;
      });
    });
    return qty;
  })();

  /* -------------------------------------------------------------
     ⭐ FETCH PRODUCT
  --------------------------------------------------------------*/
  const fetchProductEntry = useCallback(
  async (productId) => {
    if (!productId) return;
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      const headers = { Accept: "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      let mainProduct = null;
      let related = [];

      /* ---------------------------------------------------------
         ⭐ 1. BACHELOR FILTER CONTEXT
      ----------------------------------------------------------*/
      /* ---------------------------------------------------------
   ⭐ 1. BACHELOR FILTER CONTEXT
----------------------------------------------------------*/
if (context === "bachelor-filter") {

  const appliedMaxPrice = route.params?.maxPrice || "";
  const appliedCategory = route.params?.category || "";

  // Build URL properly
  let url = `https://selecto-project.onrender.com/api/user/products/bachelor-filter?productId=${productId}`;

  if (appliedMaxPrice) url += `&maxPrice=${appliedMaxPrice}`;
  if (appliedCategory) url += `&category=${appliedCategory}`;

  console.log("🔥 FINAL BACHELOR FILTER URL:", url);

  const res = await fetch(url, { headers });
  const data = await res.json();

  let mainProduct =
    data?.selectedProduct ||
    data?.product ||
    data?.productData ||
    (data?.relatedProducts?.length ? data.relatedProducts[0] : null);

  const related = data?.relatedProducts || [];

  setProduct(mainProduct ? mapServerProduct(mainProduct) : null);
  setRelatedProducts(related.map(mapServerProduct));

  return; // stop further API logic
}





      /* ---------------------------------------------------------
         ⭐ 2. EXCLUSIVE PRODUCT CONTEXT
      ----------------------------------------------------------*/
      if (context === "exclusive") {
        const res = await fetch(
          `https://selecto-project.onrender.com/api/user/products/offers/exclusive?productId=${productId}`,
          { headers }
        );
        const data = await res.json();

        mainProduct =
          data?.selectedProduct ||
          data?.product ||
          data?.productData;

        related = data?.relatedOffers || [];

        setProduct(mainProduct ? mapServerProduct(mainProduct) : null);
        setExclusiveProducts(related.map(mapServerProduct));
        return;
      }

      /* ---------------------------------------------------------
         ⭐ 3. BEST SELLING CONTEXT
      ----------------------------------------------------------*/
      if (context === "best-selling") {
        const res = await fetch(
          `https://selecto-project.onrender.com/api/seller/products/best-selling?productId=${productId}`,
          { headers }
        );
        const data = await res.json();

        mainProduct =
          data?.selectedProduct ||
          data?.product ||
          data?.productData;

        related = data?.relatedProducts || [];

        setProduct(mainProduct ? mapServerProduct(mainProduct) : null);
        setBestSellingProducts(related.map(mapServerProduct));
        return;
      }

      /* ---------------------------------------------------------
         ⭐ 4. DEFAULT SINGLE PRODUCT API
      ----------------------------------------------------------*/
      const res = await fetch(
        `https://selecto-project.onrender.com/api/user/singleproduct/${productId}`,
        { headers }
      );
      const data = await res.json();

      mainProduct =
        data?.product ||
        data?.selectedProduct ||
        data?.productData;

      setProduct(mainProduct ? mapServerProduct(mainProduct) : null);

      // Now fetch related (category based)
      const cat =
  mainProduct?.category ||
  route.params?.category ||     // from navigation
  category || "";               // fallback

if (cat) {
  const resp = await fetch(
    `https://selecto-project.onrender.com/apis/category/${cat}/sellers`
  );
  const rel = await resp.json();

  related =
    rel?.sellers
      ?.flatMap((s) => s.products || [])
      ?.filter((p) => p._id !== productId) || [];

  setRelatedProducts(related.map(mapServerProduct));
}

    } catch (err) {
      setError(err.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  },
  [context]
);

  const mapServerProduct = (raw = {}) => {
  if (!raw) return null;

  // Image can be array or string
  const rawImage = raw?.image ?? raw?.img ?? raw?.imgUrl;
  const firstImage = Array.isArray(rawImage) ? rawImage[0] : rawImage;

  return {
    id: raw._id,
    name: raw.name ?? "",
    price: Number(raw.price ?? raw.discountedPrice ?? 0),
    image: firstImage,
    description: raw.description ?? "",
    category: raw.category ?? "",
    sellerId: typeof raw.sellerId === "string" ? raw.sellerId : raw?.sellerId?._id,
    shopName: raw?.sellerId?.shopName ?? "",
    shopImage: raw?.sellerId?.shopImage ?? "",
    isDiscounted: raw.isDiscounted ?? false,
    sellerDiscount: raw.sellerDiscount ?? 0,
    stock: raw.stock ?? null,
    rating: raw.rating ?? null,
    raw, // keep original data
  };
};


  useEffect(() => {
    fetchProductEntry(id);
    dispatch(fetchCart());
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProductEntry(id);
    await dispatch(fetchCart());
    setRefreshing(false);
  };

  /* -------------------------------------------------------------
     ⭐ CART OPERATIONS
  --------------------------------------------------------------*/
  const handleAddToCart = async () => {
    if (!product?.id) return;

    try {
      setCartLoading(true);
      await dispatch(addToCart({ productId: product.id })).unwrap();
      await dispatch(fetchCart());
    } finally {
      setCartLoading(false);
    }
  };

  const increaseQuantity = async () => {
    try {
      setCartLoading(true);
      await dispatch(addToCart({ productId: product.id })).unwrap();
      await dispatch(fetchCart());
    } finally {
      setCartLoading(false);
    }
  };

  const decreaseQuantity = async () => {
    try {
      setCartLoading(true);
      await dispatch(removeFromCart({ productId: product.id })).unwrap();
      await dispatch(fetchCart());
    } finally {
      setCartLoading(false);
    }
  };

  /* -------------------------------------------------------------
     ⭐ RENDER RELATED LIST WITH FAV
  --------------------------------------------------------------*/
  const renderListGrid = (title, list, contextType) => {
    if (!list?.length) return null;

    return (
      <View style={styles.listSection}>
        <Text style={styles.listTitle}>{title}</Text>

        <View style={styles.grid}>
          {list.map((it) => (
            <RelatedProductCard
              key={it.id}
              item={it}
              onPress={() =>
                navigation.push("SingleProduct", {
                  id: it.id,
                  context: contextType,
                })
              }
            />
          ))}
        </View>
      </View>
    );
  };

  /* -------------------------------------------------------------
     ⭐ RENDER MAIN PRODUCT
  --------------------------------------------------------------*/
  const renderProductHeader = () => {
    if (!product) return null;

    return (
      <View style={styles.headerBlock}>
        {/* IMAGE */}
        <View style={styles.imageWrap}>
          <Image
            source={{ uri: product.image }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        {/* ❤️ MAIN PRODUCT FAV */}
        <TouchableOpacity style={styles.favBtn} onPress={toggleFav}>
          <Ionicons
            name={isFav ? "heart" : "heart-outline"}
            size={22}
            color={isFav ? "green" : "gray"}
          />
        </TouchableOpacity>

        {/* INFO CARD */}
        <View style={styles.infoCard}>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.productPrice}>₹{product.price}</Text>

          {/* COLLAPSIBLES */}
          <View style={styles.collapsibleContainer}>
            {/* Description */}
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setOpenDescription(!openDescription)}
            >
              <Text style={styles.collapsibleTitle}>Description</Text>
              <Ionicons
                name={openDescription ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
              />
            </TouchableOpacity>
            {openDescription && (
              <View style={styles.collapsibleBody}>
                <Text style={styles.collapsibleText}>{product.description}</Text>
              </View>
            )}

            {/* Nutritions */}
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setOpenNutrition(!openNutrition)}
            >
              <Text style={styles.collapsibleTitle}>Nutritions</Text>
              <Ionicons
                name={openNutrition ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
              />
            </TouchableOpacity>

            {openNutrition && <View style={styles.collapsibleBody} />}

            {/* Review */}
            <TouchableOpacity
              style={styles.collapsibleHeader}
              onPress={() => setOpenReview(!openReview)}
            >
              <Text style={styles.collapsibleTitle}>Review</Text>
              <Ionicons
                name={openReview ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
              />
            </TouchableOpacity>

            {openReview && <View style={styles.collapsibleBody} />}
          </View>

          {/* CART */}
          <View style={styles.cartRow}>
            {productQty === 0 ? (
              <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
                <Text style={styles.addCartText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.counter}>
                <TouchableOpacity onPress={decreaseQuantity} style={styles.qtyBtn}>
                  <Ionicons name="remove-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.qtyText}>{productQty}</Text>

                <TouchableOpacity onPress={increaseQuantity} style={styles.qtyBtn}>
                  <Ionicons name="add-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  /* -------------------------------------------------------------
     ⭐ RETURN PAGE UI
  --------------------------------------------------------------*/
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBack}>
            <Ionicons name="chevron-back-outline" size={26} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>{product?.shopName ?? ""}</Text>
          </View>

          <View style={styles.headerRight} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {loading && <ActivityIndicator style={styles.loading} size="large" />}
          {error && (
            <View style={styles.errorWrap}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {renderProductHeader()}

          {/* ⭐ Related Lists */}

{/* Exclusive */}
{context === "exclusive" &&
  renderListGrid("Exclusive Offers", exclusiveProducts, "exclusive")}

{/* Best Selling */}
{context === "best-selling" &&
  renderListGrid("Best Selling", bestSellingProducts, "best-selling")}

{/* Bachelor Filter */}
{context === "bachelor-filter" &&
  renderListGrid("Related Products", relatedProducts, "bachelor-filter")}

{/* Default / Category */}
{(!context || context === "category") &&
  renderListGrid("Related Products", relatedProducts, "category")}


          <View style={{ height: 120 }} />
        </ScrollView>

        <CartBubble navigation={navigation} />
      </View>
    </SafeAreaView>
  );
}

/* -------------------------------------------------------------
   ⭐ STYLES
--------------------------------------------------------------*/
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1 },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerBack: { padding: 6 },
  headerTitleWrap: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerRight: { width: 36 },

  /* Loading / Error */
  loading: { marginTop: 24 },
  errorWrap: { padding: 16 },
  errorText: { color: "red" },

  /* Main product */
  headerBlock: { alignItems: "center" },
  imageWrap: { marginTop: 8 },
  productImage: {
    width: Math.min(360, width - 40),
    height: 280,
    borderRadius: 10,
  },

  favBtn: {
    position: "absolute",
    right: 28,
    top: 24,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 6,
    elevation: 3,
  },

  infoCard: {
    width: "100%",
    backgroundColor: "#fff",
    marginTop: -26,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 18,
    elevation: 5,
  },

  productTitle: { fontSize: 24, fontWeight: "800" },
  productPrice: { marginTop: 8, fontSize: 16, fontWeight: "700", color: "#019344" },

  /* Collapsible */
  collapsibleContainer: { marginTop: 14 },
  collapsibleHeader: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  collapsibleTitle: { fontSize: 16, fontWeight: "700" },
  collapsibleBody: { paddingVertical: 12 },
  collapsibleText: { color: "#444", lineHeight: 20 },

  /* Cart Buttons */
  cartRow: { marginTop: 18 },
  addCartBtn: {
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 50,
    alignItems: "center",
  },
  addCartText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    paddingHorizontal: 14,
    marginHorizontal: 50,
    paddingVertical: 8,
    justifyContent: "center",
  },
  qtyBtn: { padding: 6 },
  qtyText: { color: "#fff", fontSize: 16, fontWeight: "700", marginHorizontal: 12 },

  /* Related product grid */
  listSection: { marginTop: 18, paddingHorizontal: 16 },
  listTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },

  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
  gridItemWrap: { width: "50%", padding: 8 },
  gridItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    elevation: 3,
    position: "relative",
  },
  gridItemImage: { height: 120, width: "100%", borderRadius: 8 },
  gridItemName: { marginTop: 8, fontWeight: "700", fontSize: 14 },
  gridItemPrice: { marginTop: 6, fontSize: 13, color: "#222" },

  smallFavBtn: {
    position: "absolute",
    right: 8,
    top: 8,
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 14,
    elevation: 3,
  },
});
