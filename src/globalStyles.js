// src/globalStyles.js
import { StyleSheet } from "react-native";
import { COLORS, SIZES } from "./config/constants";

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: SIZES.medium,
  },
  titleText: {
    fontSize: SIZES.xLarge,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  paragraph: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
});

export default globalStyles;
