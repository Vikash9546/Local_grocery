import { registerRootComponent } from "expo";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";
import HomePage from "./ComPages/HomePage";
import Login from "./ComPages/Login";
import MainPage from "./ComPages/MainPage";
import { ActivityIndicator, View } from "react-native";

function App() {
  const [currentScreen, setCurrentScreen] = useState("home"); // "home", "login", "main"
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) setInitializing(false);
      if (user) {
        setCurrentScreen("main");
      }
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  const renderScreen = () => {
    if (user) {
      return <MainPage />;
    }

    switch (currentScreen) {
      case "login":
        return <Login onCreateAccount={() => setCurrentScreen("main")} />;
      case "main":
        return <MainPage />;
      default:
        return <HomePage onGetStarted={() => setCurrentScreen("login")} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="auto" />
    </>
  );
}

export default App;
registerRootComponent(App);