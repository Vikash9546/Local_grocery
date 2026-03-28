class FavoritesServiceImpl {
    constructor() {
        this.favorites = [];
        this.listeners = [];
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
        return added;
    }

    removeItem(item) {
        const index = this.favorites.findIndex(fav => fav.name === item.name);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.notifyListeners();
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
