import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Heart({ favorites, onRemove, onBack, onAddToCart }) {
    const renderItem = ({ item }) => (
        <View style={styles.itemCard}>
            <View style={styles.itemImageContainer}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
            </View>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemWeight}>{item.weight}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>{item.price}</Text>
                    {item.originalPrice && (
                        <Text style={styles.originalPrice}>{item.originalPrice}</Text>
                    )}
                </View>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => onAddToCart(item)}
                >
                    <Ionicons name="cart-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => onRemove(item)}
                >
                    <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Favorites</Text>
                <View style={{ width: 24 }} />
            </View>

            {favorites.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="heart-outline" size={80} color="#ddd" />
                    <Text style={styles.emptyText}>No favorites yet</Text>
                    <Text style={styles.emptySubtext}>Start adding items you love!</Text>
                    <TouchableOpacity style={styles.browseButton} onPress={onBack}>
                        <Text style={styles.browseButtonText}>Browse Products</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString() + item.name}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1A1A1A",
    },
    listContent: {
        padding: 20,
    },
    itemCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    itemImageContainer: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#f9f9f9",
    },
    itemImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    itemInfo: {
        flex: 1,
        marginLeft: 16,
    },
    itemName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    itemWeight: {
        fontSize: 12,
        color: "#888",
        marginBottom: 8,
    },
    priceRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: "700",
        color: "#4CAF50",
        marginRight: 8,
    },
    originalPrice: {
        fontSize: 12,
        color: "#999",
        textDecorationLine: "line-through",
    },
    actions: {
        flexDirection: "column",
        justifyContent: "space-between",
        height: 80,
        paddingVertical: 4,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F0F9F4",
        justifyContent: "center",
        alignItems: "center",
    },
    removeButton: {
        backgroundColor: "#FFF0F0",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#333",
        marginTop: 20,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        marginBottom: 30,
    },
    browseButton: {
        backgroundColor: "#4CAF50",
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 30,
        shadowColor: "#4CAF50",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    browseButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});