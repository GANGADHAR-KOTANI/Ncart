import AsyncStorage from "@react-native-async-storage/async-storage";

const getToken = async () => {
  return await AsyncStorage.getItem("authToken");
};
 export default getToken;