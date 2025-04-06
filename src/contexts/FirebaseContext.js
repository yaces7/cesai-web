import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import firebaseConfig from '../firebase/config';

// Firebase yapılandırmasını başlat
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app();
}

// Firebase servislerini al
const auth = firebase.auth();
const db = firebase.firestore();
const googleProvider = new firebase.auth.GoogleAuthProvider();

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
  
  // Kullanıcı oturum durumunu izle
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Kullanıcı verisini Firestore'dan al
        try {
          const userDoc = await db.collection('users').doc(authUser.uid).get();
          
          if (userDoc.exists) {
            // Kullanıcı verilerini güncelle
            setUser({
              uid: authUser.uid,
              email: authUser.email,
              emailVerified: authUser.emailVerified,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
              ...userDoc.data()
            });
            
            // Tema ayarını kontrol et
            if (userDoc.data().theme) {
              setTheme(userDoc.data().theme);
              document.documentElement.setAttribute('data-theme', userDoc.data().theme);
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
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            await db.collection('users').doc(authUser.uid).set(userData);
            setUser(userData);
          }
        } catch (error) {
          console.error('Kullanıcı verisi alınırken hata oluştu:', error);
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
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };
  
  // Google ile giriş
  const signInWithGoogle = async () => {
    try {
      const userCredential = await auth.signInWithPopup(googleProvider);
      const user = userCredential.user;
      
      // Kullanıcı verisini kontrol et
      const userDoc = await db.collection('users').doc(user.uid).get();
      
      if (!userDoc.exists) {
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
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('users').doc(user.uid).set(userData);
      }
      
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Kayıt işlemi
  const register = async (email, password, name) => {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // İsim ata
      await user.updateProfile({
        displayName: name
      });
      
      // E-posta doğrulama gönder
      await user.sendEmailVerification();
      
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
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      await db.collection('users').doc(user.uid).set(userData);
      
      return user;
    } catch (error) {
      throw error;
    }
  };
  
  // Çıkış işlemi
  const logout = async () => {
    try {
      await auth.signOut();
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Tema güncelleme
  const updateTheme = async (userId, newTheme) => {
    try {
      await db.collection('users').doc(userId).update({
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
      const userRef = db.collection('users').doc(userId);
      
      // Transaction kullanarak atomik güncelleştirme yap
      await db.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists) {
          throw new Error('Kullanıcı bulunamadı');
        }
        
        const userData = userDoc.data();
        
        // Kullanım limitini kontrol et
        if (userData.usageCount >= userData.usageLimit) {
          throw new Error('Günlük API kullanım limitine ulaştınız');
        }
        
        // Kullanım sayısını artır
        transaction.update(userRef, {
          usageCount: firebase.firestore.FieldValue.increment(1)
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
      
      const docRef = await db.collection('conversations').add(newConversation);
      return docRef.id;
    } catch (error) {
      throw error;
    }
  };
  
  // Sohbeti yeniden adlandır
  const renameConversation = async (conversationId, newTitle) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      await db.collection('conversations').doc(conversationId).update({
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
      await db.collection('conversations').doc(conversationId).update({
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
      await db.collection('conversations').doc(conversationId).delete();
      return true;
    } catch (error) {
      throw error;
    }
  };
  
  // Mesaj gönder
  const sendMessage = async (conversationId, text) => {
    if (!user) throw new Error('Kullanıcı giriş yapmamış');
    
    try {
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      
      if (!conversationDoc.exists) {
        throw new Error('Sohbet bulunamadı');
      }
      
      const conversationData = conversationDoc.data();
      
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
      
      await conversationRef.update({
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
      const conversationRef = db.collection('conversations').doc(conversationId);
      const conversationDoc = await conversationRef.get();
      
      if (!conversationDoc.exists) {
        throw new Error('Sohbet bulunamadı');
      }
      
      const conversationData = conversationDoc.data();
      
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
      
      await conversationRef.update({
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
        await auth.currentUser.updateProfile({
          displayName: updates.displayName
        });
      }
      
      if (updates.photoURL) {
        await auth.currentUser.updateProfile({
          photoURL: updates.photoURL
        });
      }
      
      // Firestore'daki kullanıcı verisini güncelle
      const userUpdates = {};
      
      if (updates.name) userUpdates.name = updates.name;
      if (updates.photoURL) userUpdates.photoURL = updates.photoURL;
      
      if (Object.keys(userUpdates).length > 0) {
        await db.collection('users').doc(user.uid).update(userUpdates);
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