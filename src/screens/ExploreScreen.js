// src/screens/ExploreScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import { fetchCategories } from "../redux/slices/categorySlice";
import { useNavigation } from "@react-navigation/native";
import { setSelectedCategory, fetchStoresByCategory } from "../redux/slices/storeSlice";


const { width } = Dimensions.get("window");

export default function ExploreScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items: categories, status } = useSelector((state) => state.categories);
  const [searchText, setSearchText] = useState("");

  // Fetch all categories once
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Local filtering (case-insensitive, starts with search letters)
  const filteredCategories = categories.filter((item) =>
    item.name?.toLowerCase().includes(searchText.toLowerCase())

  );

  const dataToShow =
    searchText.trim().length > 0 ? filteredCategories : categories;

  return (
    <SafeAreaView style={styles.container}>
      {/* Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Find Products</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#777" style={styles.searchIcon} />
        <TextInput
          placeholder="Search categories..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Categories */}
      <View style={{ flex: 1, marginTop: 25 }}>
        {status === "loading" ? (
          <Text style={styles.statusText}>Loading...</Text>
        ) : status === "failed" ? (
          <Text style={[styles.statusText, { color: "red" }]}>
            Failed to load categories
          </Text>
        ) : dataToShow.length === 0 ? (
          <Text style={styles.statusText}>No categories found</Text>
        ) : (
          <FlatList
            data={dataToShow}
            keyExtractor={(item) => item._id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: "space-between" }}
            contentContainerStyle={{ paddingBottom: 120 }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: cardColors[index % cardColors.length].bg,
                    borderColor: cardColors[index % cardColors.length].border,
                  },
                ]}
                onPress={async () => {
                  dispatch(setSelectedCategory(item.name));
                  await dispatch(fetchStoresByCategory(item.name));
                  navigation.navigate("CategoryStoreScreen");
                }}>
                  
                <Image source={{ uri: item.image }} style={styles.categoryImage} />
                <Text style={styles.categoryName}>{item.name}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const cardColors = [
  { bg: "#E9F9EB", border: "#8DD19A" },
  { bg: "#FFF6E9", border: "#E4B856" },
  { bg: "#FFEAEA", border: "#E78B8B" },
  { bg: "#F5ECFF", border: "#C29DEB" },
  { bg: "#FFFDE8", border: "#E6D168" },
  { bg: "#E9F5FF", border: "#7BB8E4" },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 12,
    paddingHorizontal: 12,
    width: width * 0.9,
    height: 45,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  statusText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  categoryCard: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 28,
    width: (width - 55) / 2,
    marginBottom: 18,
    borderWidth: 1.3,
  },
  categoryImage: {
    width: 90,
    height: 90,
    resizeMode: "contain",
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#000",
    textAlign: "center",
  },
});
