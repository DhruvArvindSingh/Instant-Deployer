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


export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset all error messages
    setNameError('');
    setEmailError('');
    setPasswordError('');

    // Basic validation
    let hasError = false;

    if (!name.trim()) {
      setNameError('Name is required');
      hasError = true;
    }

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
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);
    let res;
    try {

      res = await axios.post(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/signup`, {
        name: name,
        email: email,
        password: password
      })
    } catch (error) {
      console.log("Error while signup: ", error);
      setIsLoading(false);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data.error === 'Email already exists') {
          setEmailError('This email is already registered');
        } else {
          toast({
            title: "Signup failed",
            description: error.response.data.error || "An error occurred during signup",
          });
        }
      } else {
        toast({
          title: "Signup failed",
          description: "Unable to connect to the server",
        });
      }
      return;
    }

    if (res?.status === 200) {
      toast({
        title: "Account created successfully",
        description: "Welcome to Deploy. Your account has been created.",
      });
      router.push('/login');
    } else {
      setIsLoading(false);
      toast({
        title: "Account creation failed",
        description: "Please try again.",
      });
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
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">Join thousands of developers deploying with ease</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`bg-background/50 ${nameError ? 'border-red-500' : ''}`}
            />
            {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          </div>

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
            <Label htmlFor="password">Password</Label>
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
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </>
  );
}