

import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function getToken() {
  try {
    const t = await AsyncStorage.getItem("authToken");
    return t;
  } catch (err) {
    console.warn("getToken error", err);
    return null;
  }
}
