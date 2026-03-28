import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

class CartServiceImpl {
    constructor() {
        this.cart = [];
        this.listeners = [];
        this.userId = null;

        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.userId = user.uid;
                this.loadCartFromFirebase();
            } else {
                this.userId = null;
                this.cart = [];
                this.notifyListeners();
            }
        });
    }

    async saveCartToFirebase() {
        if (!this.userId) return;
        try {
            await setDoc(doc(db, 'carts', this.userId), { items: this.cart });
        } catch (e) {
            console.error("Error saving cart", e);
        }
    }

    async loadCartFromFirebase() {
        if (!this.userId) return;
        try {
            const docRef = doc(db, 'carts', this.userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().items) {
                this.cart = docSnap.data().items;
                this.notifyListeners();
            }
        } catch (e) {
            console.error("Error loading cart", e);
        }
    }

    // Add items to cart (for repeat orders)
    addItems(items) {
        items.forEach(item => {
            const existingItem = this.cart.find(cartItem => cartItem.name === item.name);
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                this.cart.push({ ...item });
            }
        });
        this.notifyListeners();
        this.saveCartToFirebase();
    }

    // Add single item to cart
    addItem(item) {
        const existingItem = this.cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }
        this.notifyListeners();
        this.saveCartToFirebase();
    }

    // Remove single item from cart
    removeItem(item) {
        const existingItem = this.cart.find(cartItem => cartItem.name === item.name);
        if (existingItem) {
            if (existingItem.quantity > 1) {
                existingItem.quantity -= 1;
            } else {
                this.cart = this.cart.filter(cartItem => cartItem.name !== item.name);
            }
        }
        this.notifyListeners();
        this.saveCartToFirebase();
    }

    // Get cart items
    getCart() {
        return this.cart;
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace('$', ''));
            return total + (price * item.quantity);
        }, 0);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.notifyListeners();
        this.saveCartToFirebase();
    }

    // Subscribe to cart changes
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    // Notify all listeners of cart changes
    notifyListeners() {
        this.listeners.forEach(listener => listener([...this.cart]));
    }

    // Get cart item count
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }
}

export const CartService = new CartServiceImpl();
