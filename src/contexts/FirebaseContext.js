import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        setUser({ ...user, ...userData });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const initializeUserCollections = async (user, userData) => {
    try {
      // users koleksiyonu
      await setDoc(doc(db, 'users', user.uid), userData);

      // userPreferences koleksiyonu
      await setDoc(doc(db, 'userPreferences', user.uid), {
        theme: 'dark',
        language: 'tr',
        notifications: true,
        emailNotifications: true,
        lastUpdated: serverTimestamp()
      });

      // subscriptions koleksiyonu
      await setDoc(doc(db, 'subscriptions', user.uid), {
        planId: 'free',
        startDate: serverTimestamp(),
        endDate: null,
        status: 'active',
        autoRenew: false,
        paymentMethod: null,
        lastPayment: null,
        nextPayment: null
      });

      // apiUsage koleksiyonu
      await setDoc(doc(db, 'apiUsage', user.uid), {
        totalRequests: 0,
        monthlyRequests: 0,
        dailyRequests: 0,
        lastRequest: serverTimestamp(),
        resetDate: serverTimestamp(),
        limits: {
          daily: 100,
          monthly: 3000
        }
      });
    } catch (error) {
      console.error('Koleksiyon başlatma hatası:', error);
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Profil güncelleme
      await updateProfile(user, { displayName: name });
      
      // Email doğrulama gönder
      await sendEmailVerification(user);
      
      // Tüm koleksiyonları başlat
      const userData = {
        uid: user.uid,
        email: user.email,
        name: name,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        isActive: true,
        emailVerified: false,
        role: 'user',
        usageLimit: 100,
        theme: 'dark',
        isPlus: false,
        termsAccepted: false
      };

      await initializeUserCollections(user, userData);
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      if (!user.emailVerified) {
        throw new Error('Lütfen email adresinizi doğrulayın');
      }
      
      // Kullanıcı tercihlerini güncelle
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      });
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Firestore'da kullanıcı var mı kontrol et
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Yeni kullanıcı için tüm koleksiyonları başlat
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          isActive: true,
          emailVerified: true,
          role: 'user',
          usageLimit: 100,
          theme: 'dark',
          isPlus: false,
          termsAccepted: false
        };

        await initializeUserCollections(user, userData);
      }
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const acceptTerms = async (uid) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        termsAccepted: true,
        termsAcceptedAt: serverTimestamp()
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateTheme = async (uid, theme) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        theme: theme
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const updateApiUsage = async (userId) => {
    try {
      const apiUsageRef = doc(db, 'apiUsage', userId);
      const apiUsageDoc = await getDoc(apiUsageRef);

      if (!apiUsageDoc.exists()) {
        // İlk kullanımda doküman oluştur
        await setDoc(apiUsageRef, {
          totalRequests: 1,
          monthlyRequests: 1,
          dailyRequests: 1,
          lastRequest: serverTimestamp(),
          resetDate: serverTimestamp(),
          limits: {
            daily: 100,
            monthly: 3000
          }
        });
        return true;
      }

      const data = apiUsageDoc.data();
      const now = new Date();
      const lastRequest = data.lastRequest?.toDate() || now;
      const resetDate = data.resetDate?.toDate() || now;

      // Günlük limit kontrolü
      if (now.getDate() !== lastRequest.getDate()) {
        data.dailyRequests = 0;
      }

      // Aylık limit kontrolü
      if (now.getMonth() !== lastRequest.getMonth()) {
        data.monthlyRequests = 0;
      }

      // Limitleri kontrol et
      if (data.dailyRequests >= data.limits.daily) {
        throw new Error('Günlük API kullanım limitinize ulaştınız');
      }

      if (data.monthlyRequests >= data.limits.monthly) {
        throw new Error('Aylık API kullanım limitinize ulaştınız');
      }

      // Sayaçları güncelle
      await updateDoc(apiUsageRef, {
        totalRequests: increment(1),
        monthlyRequests: increment(1),
        dailyRequests: increment(1),
        lastRequest: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('API kullanım güncellemesi başarısız:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    signInWithGoogle,
    logout,
    acceptTerms,
    updateTheme,
    updateApiUsage
  };

  return (
    <FirebaseContext.Provider value={value}>
      {!loading && children}
    </FirebaseContext.Provider>
  );
}; 