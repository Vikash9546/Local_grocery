import React, { useState } from "react";
import { StyleSheet, Text, View, SectionList, TextInput, Image, TouchableOpacity, ScrollView, Animated, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import OrderHistory from '../components/OrderHistory';
import Heart from './Heart';
import Cart from './Cart';
import Profile from './Profile';

import { CATEGORIES } from "../data/categories";
import { fruitsData } from "../data/fruits";
import { vegetablesData } from "../data/vegetables";
import { dairyData } from "../data/dairy";
import { bakeryData } from "../data/bakery";
import { snacksData } from "../data/snacks";
import { beveragesData } from "../data/beverages";
import { meatData } from "../data/meat";

import { CartService } from "../services/CartService";
import { FavoritesService } from "../services/FavoritesService";

// Construct GROCERY_DATA from imported files
const GROCERY_DATA = [
    {
        title: "Popular",
        data: [
            ...fruitsData.slice(0, 2),
            ...vegetablesData.slice(0, 2),
            ...dairyData.slice(0, 2),
        ],
    },
    {
        title: "All",
        data: [
            ...fruitsData,
            ...vegetablesData,
            ...dairyData,
            ...bakeryData,
            ...snacksData,
            ...beveragesData,
            ...meatData,
        ],
    },
    {
        title: "Fruits",
        data: fruitsData,
    },
    {
        title: "Vegetables",
        data: vegetablesData,
    },
    {
        title: "Dairy", // Matches "Dairy" in categories.js (was "Dairy & Eggs")
        data: dairyData,
    },
    {
        title: "Bakery",
        data: bakeryData,
    },
    {
        title: "Snacks",
        data: snacksData,
    },
    {
        title: "Beverages",
        data: beveragesData,
    },
    {
        title: "Meat",
        data: meatData,
    },
];

export default function MainPage() {
    const [searchText, setSearchText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showOrderHistory, setShowOrderHistory] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [activeTab, setActiveTab] = useState("Home");
    const [favorites, setFavorites] = useState([]);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success"); // success or error
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(100)).current;

    const showToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setToastVisible(true);

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                useNativeDriver: true,
            })
        ]).start();

        setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 100,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start(() => setToastVisible(false));
        }, 2000);
    };

    // Subscribe to cart and favorites changes
    React.useEffect(() => {
        const unsubscribeCart = CartService.subscribe((cart) => {
            setCartItemCount(CartService.getItemCount());
        });
        const unsubscribeFav = FavoritesService.subscribe((favs) => {
            setFavorites(favs);
        });
        return () => {
            unsubscribeCart();
            unsubscribeFav();
        };
    }, []);

    const handleRepeatOrder = (items) => {
        CartService.addItems(items);
        setShowOrderHistory(false); // Go back to main page to see the cart update
    };

    if (showOrderHistory) {
        return (
            <OrderHistory
                onRepeatOrder={handleRepeatOrder}
                onBack={() => setShowOrderHistory(false)}
            />
        );
    }

    if (activeTab === "Cart") {
        return <Cart onBack={() => setActiveTab("Home")} />;
    }

    if (activeTab === "Profile") {
        return <Profile onBack={() => setActiveTab("Home")} />;
    }

    if (activeTab === "Favorites") {
        return (
            <Heart
                favorites={favorites}
                onRemove={(item) => FavoritesService.removeItem(item)}
                onAddToCart={(item) => CartService.addItem(item)}
                onBack={() => setActiveTab("Home")}
            />
        );
    }

    const filteredData = GROCERY_DATA.map((section) => {
        // Filter by selected category first
        if (selectedCategory !== "All" && section.title !== selectedCategory) {
            return null;
        }

        // Then filter by search text within the selected category's data
        const filteredItems = section.data.filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        );

        if (filteredItems.length === 0) return null;

        return { ...section, data: filteredItems };
    }).filter((section) => section !== null);

    const renderItem = (item) => {
        const isFavorite = favorites.some(fav => fav.name === item.name);
        return (
            <View key={item.name} style={styles.itemCard}>
                <View style={styles.cardHeader}>
                    {item.discount && (
                        <View style={styles.discountBadge}>
                            <Text style={styles.discountText}>{item.discount}</Text>
                        </View>
                    )}
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => {
                        const isAdded = FavoritesService.toggleFavorite(item);
                        if (isAdded) {
                            showToast("Added to favorites", "success");
                        } else {
                            showToast("Removed from favorites", "error");
                        }
                    }}>
                        <Ionicons
                            name={isFavorite ? "heart" : "heart-outline"}
                            size={20}
                            color="#FF6B6B"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.itemImageContainer}>
                    <Image source={{ uri: item.image }} style={styles.itemImage} />
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.itemPrice}>{item.price}</Text>
                        <Text style={styles.itemWeight}>for {item.weight}</Text>
                    </View>
                    <TouchableOpacity style={styles.addButton} onPress={() => CartService.addItem(item)}>
                        <Ionicons name="add" size={24} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const BottomNavBar = () => {
        const tabs = [
            { name: 'Cart', icon: 'cart', id: 'Cart', badge: cartItemCount },
            { name: 'Profile', icon: 'person', id: 'Profile' },
            { name: 'Home', icon: 'home', id: 'Home' },
            { name: 'Favorites', icon: 'heart', id: 'Favorites' },
            { name: 'Menu', icon: 'menu', id: 'Menu' },
        ];

        return (
            <View style={styles.bottomNavContainer}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            style={[styles.navItem, isActive && styles.activeNavItem]}
                            onPress={() => setActiveTab(tab.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.navItemContent}>
                                <Ionicons
                                    name={isActive ? tab.icon : `${tab.icon}-outline`}
                                    size={28}
                                    color={isActive ? "#4CAF50" : "#000"}
                                />
                                {tab.badge > 0 && (
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>{tab.badge}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const ListHeader = () => (
        <View>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
            >
                {CATEGORIES.map((cat, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.categoryCard,
                            { backgroundColor: cat.color },
                            selectedCategory === cat.name && styles.selectedCategoryCard,
                        ]}
                        onPress={() => setSelectedCategory(cat.name)}
                    >
                        <Ionicons name={cat.icon} size={24} color="#1A1A1A" style={{ marginBottom: 8 }} />
                        <Text style={styles.categoryName}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View >
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Header */}
            <View style={styles.topHeader}>
                <Text style={styles.topHeaderTitle}>Grocery Shopping</Text>
                <TouchableOpacity
                    style={styles.ordersButton}
                    onPress={() => setShowOrderHistory(true)}
                >
                    <Ionicons name="receipt-outline" size={24} color="#2c3e50" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search items..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
                {selectedCategory === "All" ? (
                    <>
                        {/* Banner */}
                        <View style={styles.bannerContainer}>
                            <Image
                                source={{ uri: "https://img.freepik.com/free-photo/shopping-basket-with-grocery-products_23-2148102377.jpg" }}
                                style={styles.bannerImage}
                            />
                            <View style={styles.bannerOverlay}>
                                <Text style={styles.bannerText}>Fresh Groceries</Text>
                                <Text style={styles.bannerSubtext}>Delivered in 10 mins</Text>
                            </View>
                        </View>

                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>Grocery & Kitchen</Text>
                            <View style={styles.categoryGrid}>
                                {CATEGORIES.map((cat, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.gridCategoryCard}
                                        onPress={() => setSelectedCategory(cat.name)}
                                    >
                                        <View style={[styles.gridIconContainer, { backgroundColor: cat.color }]}>
                                            <Ionicons name={cat.icon} size={30} color="#1A1A1A" />
                                        </View>
                                        <Text style={styles.gridCategoryName}>{cat.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Show Popular items or other sections for "All" view if desired, 
                            or just the categories as the main entry point. 
                            Let's show "Popular" below the categories for quick access. */}
                        {GROCERY_DATA.map((section) => (
                            <View key={section.title} style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <View style={styles.gridContainer}>
                                    {section.data.map((item) => renderItem(item))}
                                </View>
                            </View>
                        ))}
                    </>
                ) : (
                    <>
                        <ListHeader />
                        {filteredData.map((section) => (
                            <View key={section.title} style={styles.sectionContainer}>
                                <Text style={styles.sectionTitle}>{section.title}</Text>
                                <View style={styles.gridContainer}>
                                    {section.data.map((item) => renderItem(item))}
                                </View>
                            </View>
                        ))}
                        {filteredData.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyStateText}>No items found in {selectedCategory}</Text>
                                <TouchableOpacity onPress={() => setSelectedCategory("All")} style={styles.backButton}>
                                    <Text style={styles.backButtonText}>Browse all categories</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            {/* Bottom Navigation */}
            {/* Bottom Navigation */}
            <BottomNavBar />

            {/* Toast Notification */}
            {toastVisible && (
                <Animated.View
                    style={[
                        styles.toastContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={[styles.toastIconContainer, toastType === "error" ? styles.toastError : styles.toastSuccess]}>
                        <Ionicons
                            name={toastType === "error" ? "heart-dislike" : "heart"}
                            size={20}
                            color={toastType === "error" ? "#fff" : "#FF6B6B"}
                        />
                    </View>
                    <View style={styles.toastContent}>
                        <Text style={styles.toastTitle}>
                            {toastType === "error" ? "Removed" : "Success"}
                        </Text>
                        <Text style={styles.toastText}>{toastMessage}</Text>
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    topHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    topHeaderTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1A1A1A",
        letterSpacing: -0.5,
    },
    ordersButton: {
        padding: 10,
        borderRadius: 12,
        backgroundColor: "#F5F5F5",
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    searchInput: {
        height: 50,
        backgroundColor: "#F3F4F6",
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 16,
        color: "#1A1A1A",
        borderWidth: 0,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Extra padding for bottom nav
    },
    sectionContainer: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 15,
    },
    categoriesScroll: {
        marginBottom: 20,
    },
    categoryCard: {
        width: 80,
        height: 90,
        marginRight: 12,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    selectedCategoryCard: {
        borderWidth: 2,
        borderColor: "#4CAF50",
    },
    categoryImage: {
        width: 40,
        height: 40,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 11,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    itemCard: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    itemImageContainer: {
        width: "100%",
        height: 120,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 12,
    },
    itemImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
        borderRadius: 12,
    },
    itemName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1A1A1A",
        flex: 1,
        marginRight: 4,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1A1A1A",
    },
    itemWeight: {
        fontSize: 12,
        color: "#888",
        fontWeight: "500",
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 10,
        backgroundColor: "#F0F9F4", // Light green background
        justifyContent: "center",
        alignItems: "center",
    },
    bottomNavContainer: {
        position: "absolute",
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: "#fff",
        borderRadius: 30,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    navItem: {
        alignItems: "center",
        justifyContent: "center",
        padding: 8,
    },
    activeNavItem: {
        backgroundColor: "#E8F5E9",
        borderRadius: 30, // Circular when no text
        width: 50,
        height: 50,
        paddingHorizontal: 0,
        paddingVertical: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navItemContent: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#FF3B30',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    gridCategoryCard: {
        width: "23%", // 4 items per row approx
        alignItems: "center",
        marginBottom: 20,
    },
    gridIconContainer: {
        width: 70,
        height: 70,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    gridIcon: {
        width: 40,
        height: 40,
        resizeMode: "contain",
    },
    gridCategoryName: {
        fontSize: 12,
        fontWeight: "600",
        color: "#333",
        textAlign: "center",
        lineHeight: 16,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 50,
    },
    emptyStateText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 20,
    },
    backButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#4CAF50",
        borderRadius: 20,
    },
    backButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    bannerContainer: {
        marginVertical: 20,
        borderRadius: 20,
        overflow: 'hidden',
        height: 180,
        backgroundColor: '#FFF0F0',
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    bannerOverlay: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
    },
    bannerText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1A1A1A',
    },
    bannerSubtext: {
        fontSize: 12,
        color: '#4CAF50',
        fontWeight: '600',
    },
    toastContainer: {
        position: 'absolute',
        bottom: 110,
        left: 20,
        right: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 1000,
        borderLeftWidth: 4,
        borderLeftColor: '#4CAF50',
    },
    toastIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    toastSuccess: {
        backgroundColor: '#FFF0F0',
    },
    toastError: {
        backgroundColor: '#FF6B6B',
    },
    toastContent: {
        flex: 1,
    },
    toastTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 2,
    },
    toastText: {
        color: '#666',
        fontSize: 13,
        fontWeight: '500',
    },
});