import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Button,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, router } from "expo-router";

const FAVORITES_KEY = "@favorite_universities";

interface Favorite {
  name: string;
  web_page: string;
}

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const favoritesStr = await AsyncStorage.getItem(FAVORITES_KEY);
      const favs = favoritesStr ? JSON.parse(favoritesStr) : [];
      setFavorites(favs);
    } catch (error) {
      Alert.alert("Error", "Could not load saved favorites.");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const removeFavorite = async (favoriteToRemove: Favorite) => {
    try {
      const currentFavoritesStr = await AsyncStorage.getItem(FAVORITES_KEY);
      let currentFavorites: Favorite[] = currentFavoritesStr
        ? JSON.parse(currentFavoritesStr)
        : [];

      const filteredFavorites = currentFavorites.filter(
        (fav) => fav.web_page !== favoriteToRemove.web_page
      );

      if (filteredFavorites.length !== currentFavorites.length) {
        await AsyncStorage.setItem(
          FAVORITES_KEY,
          JSON.stringify(filteredFavorites)
        );
        setFavorites(filteredFavorites);
        Alert.alert(
          "Removed",
          `"${favoriteToRemove.name}" was removed from favorites.`
        );
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {favorites.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>
              No universities have been favorited yet.
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.web_page}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => removeFavorite(item)}>
                <View style={styles.listItem}>
                  <Text style={styles.listItemTextUrl}>{item.web_page}</Text>
                  <Text style={styles.listItemTextName}>({item.name})</Text>
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={() => (
              <Text style={styles.footerText}>
                Tap an item to remove it.
              </Text>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <View style={styles.buttonContainer}>
          <Button
            title="Back to Search"
            onPress={handleGoBack}
            color="#007AFF"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
  listItem: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemTextUrl: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    marginBottom: 4,
  },
  listItemTextName: {
    fontSize: 14,
    color: "#555",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 18,
    color: "#888",
  },
  footerText: {
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    fontSize: 14,
    color: "#AAA",
  },
  buttonContainer: {
    marginTop: 15,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});
