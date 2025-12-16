import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/authStore";

export default function Index() {
  const { user, isGuest } = useAuthStore();
  
  // If user is authenticated, redirect to tabs layout
  // Otherwise, redirect to auth screen
  return user || isGuest ? <Redirect href="/(tabs)" /> : <Redirect href="/auth" />;
}
