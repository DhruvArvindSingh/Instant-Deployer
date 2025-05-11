'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import axios from 'axios';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit");
    console.log("process.env.NEXT_PUBLIC_API_SERVER_URL = ", process.env);
    e.preventDefault();

    // Reset error messages
    setEmailError('');
    setPasswordError('');

    // Basic validation
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Invalid email format');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/signin`, {
        email: email,
        password: password
      }, {
        withCredentials: true // Add this to enable sending cookies
      });

      if (res.status === 200) {
        toast({
          title: "Signed in successfully",
          description: "Welcome back to your dashboard.",
        });

        // Set token in cookie if provided in response
        if (res.data.token) {
          document.cookie = `token=${res.data.token}; path=/; max-age=86400;`; // 24 hours
          console.log("Cookie set:", document.cookie);
        }

        router.push('/dashboard');
      } else {
        setIsLoading(false);
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
        });
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Error while login: ", error);

      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          setPasswordError('Invalid email or password');
        } else {
          toast({
            title: "Login failed",
            description: error.response.data.error || "An error occurred during login",
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: "Unable to connect to the server",
        });
      }
    }
  };

  return (
    <>
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-primary hover:text-primary/90 transition-colors">
        <Zap className="h-6 w-6" />
        <span className="font-bold text-lg">Deploy</span>
      </Link>

      <div className="mx-auto w-full max-w-md p-8 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-xl">
        <div className="space-y-2 text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`bg-background/50 ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`bg-background/50 ${passwordError ? 'border-red-500' : ''}`}
            />
            {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
}