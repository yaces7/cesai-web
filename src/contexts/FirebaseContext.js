import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  runTransaction,
  enableIndexedDbPersistence,
  initializeFirestore,
  persistentLocalCache,
  getFirestore as getExistingFirestore
} from 'firebase/firestore';
import firebaseConfig from '../firebase/config';

// Firebase yapılandırmasını başlat
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Firestore için tekil instance kontrolü
let db;
try {
  // Önce mevcut bir Firestore instance'ı var mı kontrol edelim
  db = getExistingFirestore();
  console.log("Mevcut Firestore instance'ı kullanılıyor.");
} catch (e) {
  // Yoksa yeni bir tane oluşturalım
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({})
  });
  console.log("Yeni Firestore instance'ı oluşturuldu ve persistentLocalCache etkinleştirildi.");
}

const googleProvider = new GoogleAuthProvider();

// Çevrimdışı veri desteği başarıyla etkinleştirildi bildirimi
console.log("Çevrimdışı depolama persistentLocalCache ile etkinleştirildi");

// Context oluştur
const FirebaseContext = createContext(null);

// Hook oluştur
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase hook must be used within a FirebaseProvider');
  }
  return context;
};

// Provider oluştur
export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark'); // Varsayılan tema
  const [firebaseError, setFirebaseError] = useState(null);
  
  // Kullanıcı oturum durumunu izle
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Kullanıcı verisini Firestore'dan al
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            // Kullanıcı verilerini güncelle
            const userData = userDocSnap.data();
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
              ...userData
            });
            
            // Tema ayarını kontrol et
            if (userData.theme) {
              setTheme(userData.theme);
              document.documentElement.setAttribute('data-theme', userData.theme);
            }
          } else {
            // Kullanıcı Firestore'da yoksa oluştur
            const userData = {
              uid: authUser.uid,
              email: authUser.email,
              name: authUser.displayName || '',
              photoURL: authUser.photoURL || '',
              emailVerified: authUser.emailVerified,
              theme: 'dark',
              usageLimit: 100,
              usageCount: 0,
              createdAt: serverTimestamp()
            };
            
            await setDoc(userDocRef, userData);
            setUser({
              ...userData,
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL
            });
          }
        } catch (error) {
          console.error('Kullanıcı verisi alınırken hata oluştu:', error);
          
          // Firebase yetkilendirme hatası kontrolü
          if (error.code === 'permission-denied') {
            setFirebaseError("Veritabanı izin hatası: Firebase güvenlik kurallarını kontrol edin.");
            console.error("Firebase yetkilendirme hatası:", error.message);
          }
          
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            emailVerified: authUser.emailVerified,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Giriş işlemi
  const login = async (email, password) => {
    try {
      console.log('Giriş işlemi başlatılıyor...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Giriş başarılı');
      return userCredential.user;
    } catch (error) {
      console.error('Giriş hatası:', error);
      
      // Daha açıklayıcı hata mesajları
      if (error.code === 'auth/user-not-found') {
        throw new Error('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı. Lütfen kayıt olun.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Hatalı şifre girdiniz. Lütfen tekrar deneyin.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Geçersiz e-posta formatı. Lütfen geçerli bir e-posta adresi girin.');
      } else if (error.code === 'auth/user-disabled') {
        throw new Error('Bu hesap devre dışı bırakılmıştır. Lütfen destek ekibiyle iletişime geçin.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin veya şifrenizi sıfırlayın.');
      }
      
      throw error;
    }
  };
  
  // Google ile giriş
  const signInWithGoogle = async () => {
    try {
      console.log('Google ile giriş başlatılıyor...');
      
      // Daha fazla OAuth kapsam ekleyelim
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      
      // Kimlik doğrulama tercihlerini ayarlayalım 
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      
      console.log('Google kimlik doğrulama başarılı:', user.displayName);
      
      // Kullanıcı verisini kontrol et
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        console.log('Yeni Google kullanıcısı, Firestore\'a kaydediliyor...');
        // Kullanıcı Firestore'da yoksa oluştur
        const userData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || '',
          photoURL: user.photoURL || '',
          emailVerified: user.emailVerified,
          theme: 'dark',
          usageLimit: 100,
          usageCount: 0,
          createdAt: serverTimestamp()
        };
        
        await setDoc(userDocRef, userData);
        console.log('Kullanıcı Firestore\'a kaydedildi');
      } else {
        console.log('Mevcut Google kullanıcısı bulundu');
      }
      
      return user;
    } catch (error) {
      console.error('Google ile giriş hatası:', error);
      
      // Daha açıklayıcı hata mesajları
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Giriş penceresi kullanıcı tarafından kapatıldı. Lütfen tekrar deneyin.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Tarayıcınız açılır pencereyi engelledi. Lütfen izin verin ve tekrar deneyin.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Açılır pencere isteği iptal edildi. Lütfen tekrar deneyin.');
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error('Bu e-posta adresi başka bir sağlayıcıyla ilişkilendirilmiştir. Farklı bir giriş yöntemi deneyin.');
      }
      
      throw error;
    }
  };
  
  // Kayıt işlemi
  const register = async (email, password, name) => {
    try {
      console.log('Kullanıcı kaydı başlatılıyor...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Kullanıcı oluşturuldu, profil güncelleniyor...');
      // İsim ata
      await updateProfile(user, {
        displayName: name
      });
      
      console.log('E-posta doğrulama gönderiliyor...');
      // E-posta doğrulama gönder
      await sendEmailVerification(user);
      
      console.log('Kullanıcı Firestore\'a kaydediliyor...');
      // Kullanıcıyı Firestore'a ekle
      const userData = {
        uid: user.uid,
        email: user.email,
        name: name,
        photoURL: '',
        emailVerified: false,
        theme: 'dark',
        usageLimit: 100,
        usageCount: 0,
        createdAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      console.log('Kayıt işlemi tamamlandı');
      return user;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      
      // Daha açıklayıcı hata mesajları
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Bu e-posta adresi zaten kullanımda. Lütfen giriş yapın veya farklı bir e-posta kullanın.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Geçersiz e-posta formatı. Lütfen geçerli bir e-posta adresi girin.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Şifre çok zayıf. En az 6 karakter uzunluğunda bir şifre kullanın.');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('E-posta/şifre girişi bu proje için devre dışı bırakılmış. Firebase konsolunda etkinleştirin.');
      }
      
      throw error;
    }
  };
  
  // Çıkış işlemi
  const logout = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Tema güncelleme
  const updateTheme = async (userId, newTheme) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        theme: newTheme
      });
      
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // API kullanım limiti kontrolü
  const updateApiUsage = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      
      // Transaction kullanarak atomik güncelleştirme yap
      await runTransaction(db, async (transaction) => {
        const userDocSnap = await transaction.get(userDocRef);
        
        if (!userDocSnap.exists()) {
          throw new Error('Kullanıcı bulunamadı');
        }
        
        const userData = userDocSnap.data();
        
        // Kullanım limitini kontrol et
        if (userData.usageCount >= userData.usageLimit) {
          throw new Error('Günlük API kullanım limitine ulaştınız');
        }
        
        // Kullanım sayısını artır
        transaction.update(userDocRef, {
          usageCount: increment(1)
        });
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Sohbet oluşturma
  const createConversation = async (title = 'Yeni Sohbet') => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      const conversationsCol = collection(db, 'conversations');
      const newConversation = {
        title,
        userId: user.uid,
        messages: [{
          text: 'Merhaba! Size nasıl yardımcı olabilirim?',
          isUser: false,
          timestamp: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false
      };
      
      const docRef = await setDoc(doc(conversationsCol), newConversation);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  };
  
  // Sohbeti yeniden adlandır
  const renameConversation = async (conversationId, newTitle) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      const conversationDocRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationDocRef, {
        title: newTitle,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Sohbeti arşivle
  const archiveConversation = async (conversationId) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      const conversationDocRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationDocRef, {
        archived: true,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Sohbeti sil
  const deleteConversation = async (conversationId) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      const conversationDocRef = doc(db, 'conversations', conversationId);
      await deleteDoc(conversationDocRef);
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Mesaj gönder
  const sendMessage = async (conversationId, text) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      const conversationDocRef = doc(db, 'conversations', conversationId);
      const conversationDocSnap = await getDoc(conversationDocRef);
      
      if (!conversationDocSnap.exists()) {
        throw new Error('Sohbet bulunamadı');
      }
      
      const conversationData = conversationDocSnap.data();
      
      // Kullanıcıya ait sohbet mi kontrol et
      if (conversationData.userId !== user.uid) {
        throw new Error('Bu sohbete erişim izniniz yok');
      }
      
      // Kullanıcı mesajını ekle
      const userMessage = {
        text,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...(conversationData.messages || []), userMessage];
      
      await updateDoc(conversationDocRef, {
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      });
      
      // API kullanım limitini kontrol et ve güncelle
      await updateApiUsage(user.uid);
      
      return userMessage;
    } catch (error) {
      throw error;
    }
  };
  
  // AI cevabı ekle
  const addAiResponse = async (conversationId, text) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      const conversationDocRef = doc(db, 'conversations', conversationId);
      const conversationDocSnap = await getDoc(conversationDocRef);
      
      if (!conversationDocSnap.exists()) {
        throw new Error('Sohbet bulunamadı');
      }
      
      const conversationData = conversationDocSnap.data();
      
      // Kullanıcıya ait sohbet mi kontrol et
      if (conversationData.userId !== user.uid) {
        throw new Error('Bu sohbete erişim izniniz yok');
      }
      
      // AI cevabını ekle
      const aiMessage = {
        text,
        isUser: false,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...(conversationData.messages || []), aiMessage];
      
      await updateDoc(conversationDocRef, {
        messages: updatedMessages,
        updatedAt: new Date().toISOString()
      });
      
      return aiMessage;
    } catch (error) {
      throw error;
    }
  };
  
  // Kullanıcı verilerini güncelle
  const updateUserProfile = async (updates) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      // Auth profilini güncelle
      if (updates.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }
      
      if (updates.photoURL) {
        await updateProfile(auth.currentUser, {
          photoURL: updates.photoURL
        });
      }
      
      // Firestore'daki kullanıcı verisini güncelle
      const userUpdates = {};
      
      if (updates.name) userUpdates.name = updates.name;
      if (updates.photoURL) userUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(userUpdates).length > 0) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, userUpdates);
      }
      
      // Kullanıcı nesnesini güncelle
      setUser(prev => ({
        ...prev,
        ...userUpdates,
        displayName: updates.displayName || prev.displayName,
        photoURL: updates.photoURL || prev.photoURL
      }));
      
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Context değerini oluştur
  const value = {
    user,
    loading,
    theme,
    auth,
    db,
    firebaseError,
    login,
    signInWithGoogle,
    register,
    logout,
    updateTheme,
    updateApiUsage,
    createConversation,
    renameConversation,
    archiveConversation,
    deleteConversation,
    sendMessage,
    addAiResponse,
    updateUserProfile
  };
  
  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};

export default FirebaseContext; 