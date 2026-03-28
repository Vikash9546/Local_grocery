import { auth, db } from './config';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy 
} from 'firebase/firestore';

class FirebaseService {
  // Authentication
  async signUp(email, password, fullName, phone) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile
      await updateProfile(user, { displayName: fullName });
      
      // Save user profile to Firestore
      await this.saveUserProfile(user.uid, {
        fullName,
        email,
        phone,
        createdAt: new Date().toISOString()
      });
      
      return user;
    } catch (error) {
      console.error("Error in signUp:", error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error in signIn:", error);
      throw error;
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in logout:", error);
      throw error;
    }
  }

  // User Profile
  async saveUserProfile(uid, profileData) {
    try {
      await setDoc(doc(db, 'users', uid), profileData, { merge: true });
    } catch (error) {
      console.error("Error in saveUserProfile:", error);
      throw error;
    }
  }

  async getUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      throw error;
    }
  }

  // Orders
  async placeOrder(userId, orderData) {
    try {
      const orderRef = collection(db, 'orders');
      const docRef = await addDoc(orderRef, {
        ...orderData,
        userId,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      return docRef.id;
    } catch (error) {
      console.error("Error in placeOrder:", error);
      throw error;
    }
  }

  async getOrderHistory(userId) {
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error in getOrderHistory:", error);
      throw error;
    }
  }
}

export default new FirebaseService();
