import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";

const FAVORITES_KEY = "@favorite_universities";

interface University {
  name: string;
  country: string;
  alpha_two_code: string;
  "state-province": string | null;
  domains: string[];
  web_pages: string[];
}

interface Favorite {
  name: string;
  web_page: string;
}

export default function MainScreen() {
  const [country, setCountry] = useState<string>("");
  const [university, setUniversity] = useState<string>("");
  const [results, setResults] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchDone, setSearchDone] = useState<boolean>(false);

  const handleSearch = async () => {
    Keyboard.dismiss();
    if (!country.trim() && !university.trim()) {
      Alert.alert(
        "Attention",
        "Please provide at least the Country or University to search."
      );
      return;
    }

    setIsLoading(true);
    setResults([]);
    setSearchDone(false);

    let url = "http://universities.hipolabs.com/search?";
    const params: string[] = [];
    if (country.trim()) {
      params.push(`country=${encodeURIComponent(country.trim())}`);
    }
    if (university.trim()) {
      params.push(`name=${encodeURIComponent(university.trim())}`);
    }
    url += params.join("&");

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      const data: University[] = await response.json();

      setResults(data);
      setSearchDone(true);

      if (data.length === 0) {
      }
    } catch (error: any) {
      const errorMessage =
        error.message ||
        "Unable to fetch universities. Check your connection or the URL.";
      Alert.alert("Search Error", errorMessage);
      setResults([]);
      setSearchDone(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async (item: University) => {
    if (!item.web_pages || item.web_pages.length === 0 || !item.web_pages[0]) {
      Alert.alert(
        "Favorite Failed",
        `"${item.name}" does not have a valid web page to add to favorites.`
      );
      return;
    }

    const newFavorite: Favorite = {
      name: item.name,
      web_page: item.web_pages[0],
    };

    try {
      const currentFavoritesStr = await AsyncStorage.getItem(FAVORITES_KEY);
      let currentFavorites: Favorite[] = currentFavoritesStr
        ? JSON.parse(currentFavoritesStr)
        : [];

      const alreadyExists = currentFavorites.some(
        (fav) => fav.web_page === newFavorite.web_page
      );

      if (alreadyExists) {
        Alert.alert(
          "Already Exists",
          `"${newFavorite.name}" is already in your favorites.`
        );
        router.push("/favoritos");
        return;
      }

      currentFavorites.push(newFavorite);
      await AsyncStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(currentFavorites)
      );
      Alert.alert(
        "Favorited!",
        `"${newFavorite.name}" added to favorites.`
      );
      router.push("/favoritos");
    } catch (error) {
      Alert.alert("Save Error", "Could not save the favorite.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Country Name (Ex: Brazil)"
        value={country}
        onChangeText={setCountry}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="University Name (Ex: Paulista)"
        value={university}
        onChangeText={setUniversity}
        autoCapitalize="words"
      />
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Search"
            onPress={handleSearch}
            disabled={isLoading}
            color="#007AFF"
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Link href="/favoritos" asChild>
            <Button title="Favorites" color="#007AFF" />
          </Link>
        </View>
      </View>

      {isLoading && (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      )}

      {!isLoading && !searchDone && (
        <Text style={styles.infoText}>
          Enter a country and/or university to search.
        </Text>
      )}

      {!isLoading && searchDone && results.length === 0 && (
        <Text style={styles.infoText}>
          No universities found for the given criteria.
        </Text>
      )}

      {!isLoading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item, index) =>
            `${item.country}-${item.name}-${index}`
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleFavorite(item)}>
              <View style={styles.listItem}>
                <Text style={styles.listItemText}>{item.name}</Text>
                <Text style={styles.listItemSubText}>{item.country}</Text>
              </View>
            </TouchableOpacity>
          )}
          style={styles.list}
          ListFooterComponent={() => <View style={{ height: 20 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F8F8F8",
  },
  input: {
    height: 50,
    borderColor: "#D0D0D0",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  buttonWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  loader: {
    marginTop: 30,
  },
  list: {
    marginTop: 10,
  },
  listItem: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#333",
  },
  listItemSubText: {
    fontSize: 14,
    color: "#666",
    marginTop: 3,
  },
  infoText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
});
