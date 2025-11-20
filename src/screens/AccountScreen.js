import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { fetchProfile, clearProfile } from "../redux/slices/profileSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../config/constants";

function AccountScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
  const load = async () => {
    const t = await AsyncStorage.getItem("token");
    if (t) {
      dispatch(fetchProfile());
    }
  };
  load();
}, []);


  const logout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
  await AsyncStorage.removeItem("token");
  dispatch(clearProfile());

  navigation.getParent()?.reset({
    index: 0,
    routes: [{ name: "EnterMobile" }],
  });
}

      },
    ]);
  };

  /* ---------------------------- UI STATES ---------------------------- */

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: COLORS.gray }}>Loading Profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>
          Error: {String(error)}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => dispatch(fetchProfile())}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: COLORS.gray, textAlign: "center" }}>
          No user data available. Please log in again.
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={logout}>
          <Text style={styles.retryText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* --------------------------- MAIN SCREEN --------------------------- */

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: user?.profilePic || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
              }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name || "User"}</Text>
              <Text style={styles.email}>{user?.email || "email@example.com"}</Text>
              <Text style={styles.phone}>{user?.phone || "Phone not available"}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("EditProfile")}>
              <Ionicons name="pencil-outline" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          <MenuItem icon="receipt-outline" label="Orders" onPress={() => navigation.navigate("Orders")} />
          <MenuItem icon="person-outline" label="My Details" onPress={() => navigation.navigate("EditProfile")} />
          <MenuItem icon="location-outline" label="Delivery Address" onPress={() => navigation.navigate("Addresses")} />
          <MenuItem icon="card-outline" label="Payment Methods" onPress={() => Alert.alert("Coming soon")} />
          <MenuItem icon="notifications-outline" label="Notifications" onPress={() => navigation.navigate("Notifications")} />
          <MenuItem icon="help-circle-outline" label="Help" onPress={() => navigation.navigate("HelpChatbot")} />
          <MenuItem icon="information-circle-outline" label="About" onPress={() => navigation.navigate("About")} />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#E53935" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <>
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons name={icon} size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#999" />
    </TouchableOpacity>
    <View></View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  retryBtn: {
    marginTop: 10,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  profileRow: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  name: { fontSize: 18, fontWeight: "700" },
  email: { fontSize: 14, color: "#666" },
  phone: { fontSize: 13, color: "#888" },
  menu: { marginTop: 20 },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuLabel: { fontSize: 16, fontWeight: "500" },
  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF0F0",
    margin: 20,
    borderRadius: 10,
    paddingVertical: 12,
  },
  logoutText: {
    color: "#E53935",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 15,
  },
});

export default AccountScreen;