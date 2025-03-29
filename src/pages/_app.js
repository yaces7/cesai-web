import { FirebaseProvider } from '../contexts/FirebaseContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const publicPaths = ['/', '/login', '/register'];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isPublicPath = publicPaths.includes(router.pathname);

    if (!token && !isPublicPath) {
      router.push('/login');
    }
  }, [router.pathname]);

  return (
    <FirebaseProvider>
      <Component {...pageProps} />
    </FirebaseProvider>
  );
}

export default MyApp; 