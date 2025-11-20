// src/components/ExclusiveOffers.js
import React, { useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "./ProductCard";
import { fetchOffers } from "../redux/slices/offersSlice";
import { COLORS } from "../config/constants";
import { useNavigation } from "@react-navigation/native";

export default function ExclusiveOffers() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const offers = useSelector((s) => s.offers.list || []);
  const status = useSelector((s) => s.offers.status);

  useEffect(() => {
    if (status === "idle") dispatch(fetchOffers());
  }, [status, dispatch]);

  const openProduct = (id) => {
    navigation.navigate("SingleProduct", {
      id,
      context: "exclusive",
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Exclusive Offers</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SeeAllProductsScreen", { type: "exclusive" })}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={offers}
        keyExtractor={(i) => i._id}
        contentContainerStyle={{ paddingLeft: 12, paddingRight: 12 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openProduct(item._id)}>
            <ProductCard product={item} variant="offer" />
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
