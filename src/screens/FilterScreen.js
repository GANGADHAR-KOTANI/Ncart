// src/screens/FilterScreen.js
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import globalStyles from "../globalStyles";
import { COLORS, SIZES } from "../config/constants";
import CategoryCheckbox from "../components/CategoryCheckbox";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCategories,
  setSelectedCategory,
  setPrice,
} from "../redux/slices/filterSlice";

export default function FilterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { categories, selectedCategory, price, loading } = useSelector(
    (state) => state.filter
  );

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <SafeAreaView
      style={[
        globalStyles.container,
        {
          backgroundColor: COLORS.white,
          flex: 1,
          paddingTop: StatusBar.currentHeight || 16,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={26} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Filter</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      {loading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id || item.name || item}
          renderItem={({ item }) => {
            const name = typeof item === "string" ? item : item.name;
            return (
              <CategoryCheckbox
                label={name}
                selected={selectedCategory === name}
                onPress={() => dispatch(setSelectedCategory(name))}
              />
            );
          }}
          style={{ maxHeight: 450 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Price Filter */}
      <Text style={[styles.sectionTitle, { marginTop: 5 }]}>Price</Text>
      <View style={styles.sliderContainer}>
        <Slider
          minimumValue={0}
          maximumValue={1000}
          step={10}
          value={price}
          onValueChange={(value) => dispatch(setPrice(value))}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.lightGray}
          thumbTintColor={COLORS.primary}
        />
        <Text style={[styles.priceValue, { marginTop: 14 }]}>₹{price}</Text>
      </View>

      {/* Apply Button */}
      <TouchableOpacity
  style={styles.applyButton}
  onPress={() =>
    navigation.navigate("CategoryStoreScreen", {
      filters: {
        category: selectedCategory,
        maxPrice: price,
      },
    })
  }
>
  <Text style={styles.applyButtonText}>Apply Filter</Text>
</TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.medium,
    paddingHorizontal: 10,
  },
  headerText: {
    fontSize: SIZES.large,
    fontWeight: "bold",
    color: COLORS.black,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 15,
    color: COLORS.black,
    paddingHorizontal: 10,
  },
  sliderContainer: {
    marginVertical: 1,
    paddingHorizontal: 10,
  },
  priceValue: {
    textAlign: "center",
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  applyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
});
