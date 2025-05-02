"use client"
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Globe, Database } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// Client component to handle authentication and UI
export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        }, {} as Record<string, string>);

        const token = cookies.token;

        console.log('All cookies:', cookies);
        console.log('token:', token);

        if (!token) {
          setIsLoading(false);
          return; // Stay on the homepage if no token
        }

        const res = await axios.post('http://localhost:9000/verify', {}, {
          headers: {
            'token': token
          },
          withCredentials: true
        });

        console.log('Verification response:', res);

        if (res.status === 200) {
          console.log('Token is valid');
          setIsAuthenticated(true);
          router.push('/dashboard');
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Authentication error:', error);
        // Stay on homepage if verification fails
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl">Deploy</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Deploy Your Projects
            <br />
            With Confidence
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Zero configuration deployments with global CDN, serverless functions,
            and continuous integration.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-lg font-medium w-full sm:w-auto">
                Start Deploying <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2 text-lg font-medium w-full sm:w-auto">
                View Dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-4 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Instant Deployment</h3>
              <p className="text-muted-foreground">
                Deploy directly from Git with zero configuration and no vendor lock-in.
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-chart-2/5 hover:border-chart-2/20">
              <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center mb-6">
                <Globe className="h-6 w-6 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Global CDN</h3>
              <p className="text-muted-foreground">
                Your projects are automatically distributed to our global edge network.
              </p>
            </div>
            <div className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border/50 transition-all duration-300 hover:shadow-lg hover:shadow-chart-3/5 hover:border-chart-3/20">
              <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center mb-6">
                <Database className="h-6 w-6 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Serverless Functions</h3>
              <p className="text-muted-foreground">
                Deploy backend code without managing servers or infrastructure.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 py-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Deploy. All rights reserved.
      </footer>
    </div>
  );
}