// src/components/BestSelling.js
import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "./ProductCard";
import { fetchBestSelling } from "../redux/slices/bestSellingSlice";
import { COLORS } from "../config/constants";
import { useNavigation } from "@react-navigation/native";

export default function BestSelling() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const products = useSelector((s) => s.bestSelling.list || []);
  const status = useSelector((s) => s.bestSelling.status);

  useEffect(() => {
    if (status === "idle") dispatch(fetchBestSelling());
  }, [status, dispatch]);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Best Selling</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SeeAllProductsScreen", { type: "best" })}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={products}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ paddingLeft: 12, paddingRight: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("SingleProduct", {
                id: item._id,
                context: "best-selling",
              })
            }
          >
            <ProductCard product={item} variant="product" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 12 },
  headerRow: {
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "800", color: "#111" },
  seeAll: { color: COLORS.primary, fontSize: 13 },
});
