import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

class FavoritesServiceImpl {
    constructor() {
        this.favorites = [];
        this.listeners = [];
        this.userId = null;

        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.userId = user.uid;
                this.loadFavoritesFromFirebase();
            } else {
                this.userId = null;
                this.favorites = [];
                this.notifyListeners();
            }
        });
    }

    async saveFavoritesToFirebase() {
        if (!this.userId) return;
        try {
            await setDoc(doc(db, 'favorites', this.userId), { items: this.favorites });
        } catch (e) {
            console.error("Error saving favorites", e);
        }
    }

    async loadFavoritesFromFirebase() {
        if (!this.userId) return;
        try {
            const docRef = doc(db, 'favorites', this.userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().items) {
                this.favorites = docSnap.data().items;
                this.notifyListeners();
            }
        } catch (e) {
            console.error("Error loading favorites", e);
        }
    }

    toggleFavorite(item) {
        const index = this.favorites.findIndex(fav => fav.name === item.name);
        let added = false;
        if (index > -1) {
            this.favorites.splice(index, 1);
            added = false;
        } else {
            this.favorites.push(item);
            added = true;
        }
        this.notifyListeners();
        this.saveFavoritesToFirebase();
        return added;
    }

    removeItem(item) {
        const index = this.favorites.findIndex(fav => fav.name === item.name);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.notifyListeners();
            this.saveFavoritesToFirebase();
        }
    }

    getFavorites() {
        return this.favorites;
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notifyListeners() {
        this.listeners.forEach(listener => listener([...this.favorites]));
    }
}

export const FavoritesService = new FavoritesServiceImpl();

