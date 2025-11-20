import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PaymentSelection({ navigation }) {
  const [selected, setSelected] = useState("");
  const [cardData, setCardData] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [upiId, setUpiId] = useState("");

  const options = [
    { id: "COD", label: "Cash on Delivery", icon: "cash" },
    { id: "UPI", label: "UPI Payment", icon: "bank-transfer" },
    { id: "CARD", label: "Debit / Credit Card", icon: "credit-card" },
  ];

  const handleProceed = () => {
    if (!selected) return alert("Select payment method");

    if (selected === "CARD" && (!cardData.cardNumber || !cardData.expiry || !cardData.cvv)) {
      return alert("Enter full card details");
    }

    if (selected === "UPI" && !upiId) {
      return alert("Enter UPI ID");
    }

    const selectedOption = options.find((o) => o.id === selected);

    // ⭐ RESET NAVIGATION SO USER CANNOT COME BACK HERE
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "checkout",
          params: {
            paymentMethodId: selected,
            paymentMethodName: selectedOption.label,
            cardData,
            upiId,
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Payment Method</Text>

      {options.map((item) => (
        <View key={item.id}>
          <TouchableOpacity
            style={[
              styles.optionBox,
              selected === item.id && styles.selectedBox,
            ]}
            onPress={() => setSelected(item.id)}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={28}
              color={selected === item.id ? "#fff" : "#333"}
            />
            <Text
              style={[
                styles.optionText,
                selected === item.id && styles.selectedText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>

          {selected === "CARD" && item.id === "CARD" && (
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Card Number"
                keyboardType="numeric"
                value={cardData.cardNumber}
                onChangeText={(text) =>
                  setCardData({ ...cardData, cardNumber: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="MM/YY"
                keyboardType="numeric"
                value={cardData.expiry}
                onChangeText={(text) =>
                  setCardData({ ...cardData, expiry: text })
                }
              />
              <TextInput
                style={styles.input}
                placeholder="CVV"
                secureTextEntry
                maxLength={3}
                keyboardType="numeric"
                value={cardData.cvv}
                onChangeText={(text) =>
                  setCardData({ ...cardData, cvv: text })
                }
              />
            </View>
          )}

          {selected === "UPI" && item.id === "UPI" && (
            <View style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Enter UPI ID (e.g user@upi)"
                value={upiId}
                onChangeText={setUpiId}
              />
            </View>
          )}
        </View>
      ))}

      <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
        <Text style={styles.proceedText}>Proceed</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  heading: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  optionBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedBox: {
    backgroundColor: "#28A745",
    borderColor: "#28A745",
  },
  optionText: { marginLeft: 12, fontSize: 17, color: "#333", fontWeight: "500" },
  selectedText: { color: "#fff" },
  inputCard: {
    marginBottom: 12,
    paddingLeft: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  proceedBtn: {
    backgroundColor: "#28A745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: "auto",
  },
  proceedText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});