import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Text,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, API_URL } from "../config/constants";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

export default function HeaderSearch({ onFilterPress }) {
  const navigation = useNavigation();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      setQuery("");
      setSuggestions([]);
      setShowDropdown(false);
    }, [])
  );

  const fetchSuggestions = async (q) => {
    if (!q || q.trim().length === 0) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/search/suggestions?q=${encodeURIComponent(q)}`
      );

      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : data.suggestions || data.results || [];

      setSuggestions(list);
    } catch (err) {
      console.warn("⚠️ Suggestion fetch error:", err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query.trim());
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // ⭐ NEW → fetch category from universalSearch before navigating
  const fetchCategoryForQuery = async (text) => {
    try {
      const res = await fetch(
        `${API_URL}/api/search/universalSearch?q=${encodeURIComponent(text)}`
      );
      const data = await res.json();

      const firstCategory =
        data?.stores?.[0]?.products?.[0]?.category || null;

      return firstCategory;
    } catch (e) {
      return null;
    }
  };

  const goToCategoryScreen = async (text) => {
    if (!text) return;

    setQuery(text);
    setShowDropdown(false);
    Keyboard.dismiss();

    // ⭐ Fetch actual category for See All screen
    const detectedCategory = await fetchCategoryForQuery(text);

    navigation.navigate("CategoryStoreScreen", {
      searchQuery: text,
      fromSearch: true,

      // ⭐ ADDED CATEGORY
      category: detectedCategory,
    });
  };

  const onSelectSuggestion = (text) => {
    goToCategoryScreen(text);
  };

  const onSubmitSearch = () => {
    goToCategoryScreen(query.trim());
  };

  const renderSuggestion = ({ item }) => {
    const text =
      typeof item === "string"
        ? item
        : item.name || item.title || item.query || "";

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => onSelectSuggestion(text)}
        activeOpacity={0.7}
      >
        <Ionicons name="search-outline" size={16} color={COLORS.gray} />
        <Text numberOfLines={1} style={styles.suggestionText}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#6B7280"
            style={{ marginLeft: 8 }}
          />

          <TextInput
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search grocery items..."
            placeholderTextColor="#9CA3AF"
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={onSubmitSearch}
            onFocus={() => query && setShowDropdown(true)}
          />

          {loading && (
            <ActivityIndicator
              style={{ marginRight: 10 }}
              size="small"
              color={COLORS.primary}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.filterBtn}
          onPress={onFilterPress}
          activeOpacity={0.8}
        >
          <Ionicons name="options-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) =>
              typeof item === "string"
                ? item + index
                : item._id || item.id || index.toString()
            }
            renderItem={renderSuggestion}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 13,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginRight: 10,
    elevation: 4,
  },
  input: {
    flex: 1,
    paddingHorizontal: 8,
    color: "#111",
    fontSize: 14,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    elevation: 4,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 6,
    elevation: 3,
    maxHeight: 200,
    paddingVertical: 4,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomColor: "#f3f4f6",
    borderBottomWidth: 1,
  },
  suggestionText: {
    color: COLORS.black,
    fontSize: 14,
    flex: 1,
  },
});
