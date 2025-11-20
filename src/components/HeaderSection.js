import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile } from "../redux/slices/profileSlice"; // unified name
import { COLORS } from "../config/constants";

function HeaderSection({ onOpenProfile, onLocationUpdate }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.profile.user); // <-- unified selector
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);

  const lastCoordsRef = useRef(null);
  const intervalRef = useRef(null);
  const TEN_MINUTES = 10 * 60 * 1000;

  // ensure profile is loaded on mount (and whenever needed)
  useEffect(() => {
    dispatch(fetchProfile()).catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    let mounted = true;

    const fetchLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          maximumAge: 5 * 60 * 1000,
        });

        if (!pos?.coords || !mounted) return;

        const { latitude, longitude } = pos.coords;

        const changed =
          !lastCoordsRef.current ||
          lastCoordsRef.current.latitude !== latitude ||
          lastCoordsRef.current.longitude !== longitude;

        if (changed) {
          lastCoordsRef.current = { latitude, longitude };

          // report upward early (raw)
          onLocationUpdate?.({
            locationName: "",
            latitude,
            longitude,
          });

          let geo = [];
          try {
            geo = await Location.reverseGeocodeAsync({ latitude, longitude });
          } catch (e) {}

          const place = geo?.[0] || {};

          const locationName =
            place.name ||
            place.street ||
            place.district ||
            place.subregion ||
            place.city ||
            place.region ||
            "Your Location";

          const cityLine = [place.subregion, place.city, place.region]
            .filter(Boolean)
            .join(", ");

          const formatted = `${locationName}${cityLine ? ", " + cityLine : ""}`;
          setAddress(formatted);

          // send cleaned name upward
          onLocationUpdate?.({
            locationName,
            latitude,
            longitude,
          });
        }
      } catch (err) {
        console.log("Location Error:", err.message || err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLocation();
    intervalRef.current = setInterval(fetchLocation, TEN_MINUTES);

    return () => {
      mounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [onLocationUpdate]);

  const rawName = user?.name || "";
  const userInitial = rawName.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <View style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.leftContent}>
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.label}>📍 Your Location</Text>
              <Text style={styles.addressText} numberOfLines={2}>
                {address}
              </Text>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.profileButton} onPress={onOpenProfile}>
          <Text style={styles.profileInitial}>{userInitial}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default React.memo(HeaderSection);

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.primary,
    marginBottom: Platform.OS === "android" ? -1 : 0,
  },
  header: {
    paddingTop: 1,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  leftContent: { flex: 1, marginRight: 10 },
  label: {
    color: "#d1fae5",
    fontSize: 12,
    marginBottom: 2,
  },
  addressText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
});
