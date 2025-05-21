import { Stack } from "expo-router";
import React from "react";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Principal" }} />
      <Stack.Screen name="favoritos" options={{ title: "Favoritos" }} />
    </Stack>
  );
}
