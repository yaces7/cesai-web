import { createContext, useContext, useState, useEffect } from 'react';
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

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Firebase başlatma
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Firebase context
const FirebaseContext = createContext(null);

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Local storage'da kullanıcı verilerini kaydetme fonksiyonları
  const saveUserToLocalStorage = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  };

  // Authentication durumunu izle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          // localStorage'dan kullanıcı verilerini al
          const userData = getUserFromLocalStorage() || {};
          
          // Temel kullanıcı verilerini birleştir
          const mergedUser = {
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            emailVerified: authUser.emailVerified,
            ...userData
          };
          
          // Kullanıcı veri yapısı doğru değilse oluştur
          if (!userData || !userData.theme) {
            const defaultUserData = {
              uid: authUser.uid,
              email: authUser.email,
              name: authUser.displayName || '',
              photoURL: authUser.photoURL || '',
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              isActive: true,
              emailVerified: authUser.emailVerified,
              role: 'user',
              usageLimit: 100,
              theme: 'dark',
              isPlus: false,
              termsAccepted: false
            };
            
            saveUserToLocalStorage(defaultUserData);
            setUser(defaultUserData);
          } else {
            setUser(mergedUser);
          }
        } catch (error) {
          console.error("Kullanıcı bilgileri alınırken hata oluştu:", error);
          setUser(authUser);
        }
      } else {
        setUser(null);
        localStorage.removeItem('userData');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Kullanıcı kaydı
  const register = async (email, password, name) => {
    try {
      setError(null);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Profil güncelleme
      await updateProfile(user, { displayName: name });
      
      // Email doğrulama gönder
      await sendEmailVerification(user);
      
      // Varsayılan kullanıcı verilerini localStorage'a kaydet
      const userData = {
        uid: user.uid,
        email: user.email,
        name: name,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
        emailVerified: false,
        role: 'user',
        usageLimit: 100,
        theme: 'dark',
        isPlus: false,
        termsAccepted: false
      };
      
      saveUserToLocalStorage(userData);
      setUser({ ...user, ...userData });
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Kullanıcı girişi
  const login = async (email, password) => {
    try {
      setError(null);
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Mevcut kullanıcı verilerini al
      const storedUserData = getUserFromLocalStorage() || {};
      
      // Son giriş tarihini güncelle
      const updatedUserData = {
        ...storedUserData,
        lastLogin: new Date().toISOString()
      };
      
      saveUserToLocalStorage(updatedUserData);
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Google ile giriş
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Mevcut kullanıcı verilerini al veya yenisini oluştur
      const storedUserData = getUserFromLocalStorage();
      
      if (!storedUserData || storedUserData.uid !== user.uid) {
        // Yeni kullanıcı için verileri oluştur
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true,
          emailVerified: true,
          role: 'user',
          usageLimit: 100,
          theme: 'dark',
          isPlus: false,
          termsAccepted: false
        };
        
        saveUserToLocalStorage(userData);
      } else {
        // Son giriş tarihini güncelle
        const updatedUserData = {
          ...storedUserData,
          lastLogin: new Date().toISOString()
        };
        
        saveUserToLocalStorage(updatedUserData);
      }
      
      return user;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Çıkış yapma
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('userData');
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Kullanıcı tercihlerini güncelleme
  const updateTheme = async (uid, theme) => {
    try {
      const userData = getUserFromLocalStorage();
      if (!userData) return;
      
      const updatedUserData = {
        ...userData,
        theme: theme
      };
      
      saveUserToLocalStorage(updatedUserData);
      setUser(prev => ({ ...prev, ...updatedUserData }));
      
      return true;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // API kullanımını takip etme
  const updateApiUsage = async (userId) => {
    try {
      const userData = getUserFromLocalStorage();
      if (!userData) return false;
      
      // Basit API kullanım takibi
      const apiUsage = JSON.parse(localStorage.getItem('apiUsage') || '{}');
      const today = new Date().toISOString().split('T')[0];
      
      // Günlük kullanım
      if (!apiUsage[today]) {
        apiUsage[today] = 1;
      } else {
        apiUsage[today]++;
      }
      
      // Limiti kontrol et
      const dailyLimit = userData.usageLimit || 100;
      if (apiUsage[today] > dailyLimit) {
        throw new Error('Günlük API kullanım limitinize ulaştınız');
      }
      
      localStorage.setItem('apiUsage', JSON.stringify(apiUsage));
      
      return apiUsage[today];
    } catch (error) {
      console.error('API kullanım güncellemesi başarısız:', error);
      throw error;
    }
  };

  // Kullanıcı kabul şartlarını işaretleme
  const acceptTerms = async (uid) => {
    try {
      const userData = getUserFromLocalStorage();
      if (!userData) return;
      
      const updatedUserData = {
        ...userData,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString()
      };
      
      saveUserToLocalStorage(updatedUserData);
      setUser(prev => ({ ...prev, ...updatedUserData }));
      
      return true;
    } catch (error) {
      setError(error.message);
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