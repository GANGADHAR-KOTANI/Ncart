import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../redux/slices/cartSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../config/constants";

// Components
import EnterNameScreen from "./EnterNameScreen";
import HeaderSection from "../components/HeaderSection";
import HeaderSearch from "../components/HeaderSearch";
import CategoriesSection from "../components/CategoriesSection";
import ExclusiveOffers from "../components/ExclusiveOffers";
import BestSelling from "../components/BestSelling";
import SellersList from "../components/SellersList";
import CartBubble from "../components/CartBubble";

export default function HomeScreen({ route, navigation }) {
  const { phone, isNewUser } = route.params || {};
  const dispatch = useDispatch();

  // Overlay for new users
  const [showOverlay, setShowOverlay] = useState(isNewUser || false);

  // Store coords and location name
  const [coords, setCoords] = useState({
    latitude: null,
    longitude: null,
    locationName: "",
  });

  // FIX: Correct token selector (iOS needed this!)
  const user = useSelector((s) => s.profile.user);
  const reduxToken = user?.token;

  // iOS needed to load token from storage too
  useEffect(() => {
    const loadToken = async () => {
      const stored = await AsyncStorage.getItem("token");
      if (stored && !reduxToken) dispatch(fetchCart());
    };
    loadToken();
  }, []);

  useEffect(() => {
    if (reduxToken) {
      dispatch(fetchCart());
    }
  }, [reduxToken]);

  // Updated ― receives NAME + COORDS
  const handleLocationUpdate = useCallback(
    ({ locationName, latitude, longitude }) => {
      setCoords({ locationName, latitude, longitude });
    },
    []
  );

  return (
  <SafeAreaView edges={["top"]} style={styles.safeArea}>
    
    {/* 🌿 GREEN TOP BACKGROUND WRAPPER */}
    <View style={styles.greenTopArea}>
      <HeaderSection
        onOpenProfile={() => navigation.navigate("Account")}
        onLocationUpdate={handleLocationUpdate}
      />

      {/* Add small padding to keep search bar aligned */}
      <View style={{ paddingHorizontal: 10 }}>
        <HeaderSearch
          onFilterPress={() => navigation.navigate("FilterScreen")}
        />
      </View>
    </View>

    {/* WHITE body */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
      alwaysBounceVertical={false}
    >
      <View style={styles.sectionWrapper}>
        <CategoriesSection />
      </View>

      <View style={styles.sectionWrapper}>
        <ExclusiveOffers />
      </View>

      <View style={styles.sectionWrapper}>
        <BestSelling />
      </View>

      <View style={[styles.sectionWrapper, { marginTop: 6 }]}>
        <SellersList
          lat={coords.latitude}
          lng={coords.longitude}
          navigation={navigation}
        />
      </View>
    </ScrollView>

    <CartBubble navigation={navigation} />

    {/* New User Overlay */}
    {showOverlay && (
      <EnterNameScreen
        phone={phone}
        onComplete={() => setShowOverlay(false)}
      />
    )}
  </SafeAreaView>
);

}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionWrapper: {
    marginTop: 1,
    paddingHorizontal: 10,
  },
  greenTopArea: {
  backgroundColor: COLORS.primary, // 🌿 green
  paddingBottom: 10,
                // space below header but above search bar
},

});
