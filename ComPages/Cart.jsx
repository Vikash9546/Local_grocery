import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartService } from "../services/CartService";
import FirebaseService from "../firebase/FirebaseService";
import { auth } from "../firebase/config";

export default function Cart({ onBack }) {
    const [cartItems, setCartItems] = useState(CartService.getCart());
    const [loading, setLoading] = useState(false);
    const [ordered, setOrdered] = useState(false);

    useEffect(() => {
        const unsubscribe = CartService.subscribe((cart) => {
            setCartItems(cart);
        });
        return () => unsubscribe();
    }, []);

    const total = CartService.getTotal();

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        
        setLoading(true);
        try {
            const user = auth.currentUser;
            if (user) {
                const orderData = {
                    items: cartItems,
                    total: total,
                    userEmail: user.email,
                };
                await FirebaseService.placeOrder(user.uid, orderData);
                CartService.clearCart();
                setOrdered(true);
            } else {
                alert("Please login to place an order");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (ordered) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.successContainer}>
                    <Ionicons name="checkmark-circle" size={100} color="#4CAF50" />
                    <Text style={styles.successTitle}>Order Placed!</Text>
                    <Text style={styles.successSubtitle}>Your groceries are on the way.</Text>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Text style={styles.backButtonText}>Continue Shopping</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Cart</Text>
                <View style={{ width: 40 }} />
            </View>

            {cartItems.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={100} color="#DDD" />
                    <Text style={styles.emptyText}>Your cart is empty</Text>
                    <TouchableOpacity style={styles.shopButton} onPress={onBack}>
                        <Text style={styles.shopButtonText}>Shop Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={cartItems}
                        keyExtractor={(item) => item.name}
                        renderItem={({ item }) => (
                            <View style={styles.cartItem}>
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>{item.price} x {item.quantity}</Text>
                                </View>
                                <View style={styles.quantityContainer}>
                                    <TouchableOpacity 
                                        style={styles.quantityButton}
                                        onPress={() => CartService.removeItem(item)}
                                    >
                                        <Ionicons name="remove" size={18} color="#4CAF50" />
                                    </TouchableOpacity>
                                    <Text style={styles.quantityText}>{item.quantity}</Text>
                                    <TouchableOpacity 
                                        style={styles.quantityButton}
                                        onPress={() => CartService.addItem(item)}
                                    >
                                        <Ionicons name="add" size={18} color="#4CAF50" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={styles.listContent}
                    />

                    <View style={styles.footer}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.checkoutButton} 
                            onPress={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.checkoutButtonText}>Checkout</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    listContent: {
        padding: 16,
    },
    cartItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: "#f9f9f9",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    itemPrice: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    quantityContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F0F9F4",
        borderRadius: 20,
        padding: 4,
    },
    quantityButton: {
        width: 28,
        height: 28,
        justifyContent: "center",
        alignItems: "center",
    },
    quantityText: {
        marginHorizontal: 12,
        fontSize: 16,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
        backgroundColor: "#fff",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    totalLabel: {
        fontSize: 18,
        color: "#666",
    },
    totalValue: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1A1A1A",
    },
    checkoutButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 16,
        padding: 18,
        alignItems: "center",
    },
    checkoutButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 18,
        color: "#999",
        marginTop: 20,
        marginBottom: 30,
    },
    shopButton: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 12,
    },
    shopButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    successContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    successTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#1A1A1A",
        marginTop: 20,
    },
    successSubtitle: {
        fontSize: 16,
        color: "#666",
        marginTop: 10,
        marginBottom: 30,
        textAlign: "center",
    },
    backButton: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 12,
    },
    backButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
});
