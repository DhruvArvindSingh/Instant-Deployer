"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Globe, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Client component to handle authentication and UI
function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      const token = cookies.token;

      console.log('All cookies:', cookies);
      console.log('token:', token);
      if (token) {
        try {
          const res = await axios.post('http://localhost:9000/verify', {}, {
            headers: {
              'token': token
            }
          });
          console.log('res:', res);

          if (res.status === 200) {
            console.log('Token is valid');
            setIsAuthenticated(true);
            router.push('/dashboard');
            return;
          } else {
            console.log('Token is invalid');
            router.push('/signin');
          }
        } catch (error) {
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);
}

// Export the client component as the default export
export default HomePage;