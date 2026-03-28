import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { auth } from "../firebase/config";
import FirebaseService from "../firebase/FirebaseService";

export default function OrderHistory({ onRepeatOrder, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const history = await FirebaseService.getOrderHistory(user.uid);
          setOrders(history);
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusDetails = (status) => {
    switch (status) {
      case "Delivered":
        return {
          bg: "#E8F5E9",
          text: "#2E7D32",
          icon: "check-circle"
        };
      case "Cancelled":
        return {
          bg: "#FFEBEE",
          text: "#C62828",
          icon: "cancel"
        };
      case "pending":
      case "Processing":
        return {
          bg: "#FFF3E0",
          text: "#EF6C00",
          icon: "schedule"
        };
      case "Shipped":
        return {
          bg: "#E3F2FD",
          text: "#1565C0",
          icon: "local-shipping"
        };
      default:
        return {
          bg: "#F5F5F5",
          text: "#616161",
          icon: "help"
        };
    }
  };

  const handleRepeatOrder = (order) => {
    Alert.alert(
      "Repeat Order",
      `Add ${order.items.length} items to cart?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Add to Cart",
          onPress: () => {
            if (onRepeatOrder) {
              onRepeatOrder(order.items);
            }
            Alert.alert("Success", "All items have been added to your cart!");
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getOrderSummary = (items) => {
    if (!items || items.length === 0) return "No items";
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const itemNames = items.slice(0, 3).map(item => item.name).join(", ");
    return `${totalItems} item${totalItems > 1 ? 's' : ''}: ${itemNames}${items.length > 3 ? '...' : ''}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Icon name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Order History</Text>
          <Text style={styles.headerSubtitle}>{orders.length} orders placed</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="receipt-long" size={64} color="#CCCCCC" />
            <Text style={styles.emptyStateTitle}>No orders yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Your order history will appear here
            </Text>
          </View>
        ) : (
          orders.map((order) => {
            const statusDetails = getStatusDetails(order.status || 'pending');
            const displayTotal = typeof order.total === 'number' ? `₹${order.total.toFixed(2)}` : order.total;
            
            return (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>Order #{order.id.substring(0, 8)}</Text>
                    <Text style={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusDetails.bg }]}>
                    <Icon
                      name={statusDetails.icon}
                      size={14}
                      color={statusDetails.text}
                      style={styles.statusIcon}
                    />
                    <Text style={[styles.statusText, { color: statusDetails.text }]}>
                      {(order.status || 'pending').toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.orderSummary}>
                  <Text style={styles.itemsSummary} numberOfLines={2}>
                    {getOrderSummary(order.items)}
                  </Text>
                  {order.deliveryAddress && (
                    <View style={styles.deliveryInfo}>
                      <Icon name="location-on" size={14} color="#666" />
                      <Text style={styles.deliveryText} numberOfLines={1}>
                        {order.deliveryAddress}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.divider} />

                <View style={styles.orderFooter}>
                  <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>{displayTotal}</Text>
                  </View>

                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.detailsButton}
                      onPress={() => Alert.alert("Order Details", `View details for order #${order.id.substring(0, 8)}`)}
                    >
                      <Text style={styles.detailsText}>Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.repeatButton}
                      onPress={() => handleRepeatOrder(order)}
                    >
                      <Icon name="refresh" size={16} color="#FFF" />
                      <Text style={styles.repeatText}>Repeat</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  orderDate: {
    fontSize: 13,
    color: "#888",
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },
  orderSummary: {
    marginVertical: 4,
  },
  itemsSummary: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 8,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  totalContainer: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  detailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  repeatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  repeatText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  bottomSpacer: {
    height: 20,
  },
});
