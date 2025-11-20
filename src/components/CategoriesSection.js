import React, { useEffect } from "react";
import {
  View,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Text,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "../redux/slices/categoriesSlice";
import {
  setSelectedCategory,
  fetchStoresByCategory,
} from "../redux/slices/categoryStoreSlice";
import { COLORS } from "../config/constants";
import { useNavigation } from "@react-navigation/native";

const CategoriesSection = ({ search = "" }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { items, status, error } = useSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories(search));
  }, [dispatch, search]);

  // 🔹 Render Each Category
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      activeOpacity={0.85}
      onPress={() => {
        dispatch(setSelectedCategory(item.name));
        dispatch(fetchStoresByCategory(item.name));
        navigation.navigate("CategoryStoreScreen", { category: item.name });
      }}
    >
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: item.image || "https://via.placeholder.com/100" }}
          style={styles.categoryImage}
        />
      </View>
      <Text style={styles.categoryName} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // 🔸 Loading State
  if (status === "loading") {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // 🔸 Error State
  if (status === "failed") {
    return (
      <Text style={styles.errorText}>
        ⚠️ {error || "Failed to load categories"}
      </Text>
    );
  }

  // 🔸 Empty State
  if (!items || items.length === 0) {
    return <Text style={styles.emptyText}>No categories found</Text>;
  }

  // 🔸 Main Category List
  return (
    <View style={styles.sectionContainer}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true} // ✅ enable scrolling
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: "#e7f7ed",
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginTop: -8,
    elevation: 2,
  },
  listContent: {
    paddingRight: 8,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: 85,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageWrapper: {
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: "#c9f1d5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 5,
  },
  categoryImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    resizeMode: "cover",
  },
  categoryName: {
    fontSize: 12,
    color: COLORS.black,
    textAlign: "center",
    width: 70,
    fontWeight: "500",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.gray,
    fontSize: 13,
  },
  errorText: {
    textAlign: "center",
    color: COLORS.danger,
    fontSize: 13,
  },
});

export default CategoriesSection;
