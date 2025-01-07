'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '../components/LoadingSpinner';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import axios from 'axios';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateName = (value: string) => {
    if (value.length < 2 || value.length > 50) {
      setNameError('Name must be between 2 and 50 characters');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!executeRecaptcha) {
        setError('Failed to execute reCAPTCHA');
        setIsLoading(false);
        return;
      }

      const recaptchaToken = await executeRecaptcha('register');
      
      const recaptchaResponse = await axios.post('/api/recaptcha', {
        gRecaptchaToken: recaptchaToken
      });

      if (!recaptchaResponse.data.success || recaptchaResponse.data.score < 0.5) {
        throw new Error('reCAPTCHA verification failed');
      }

      console.log(recaptchaResponse.data);

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (res.ok) {
        router.push('/login');
      } else {
        const error = await res.text();
        throw new Error(error);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: '/home' });
    } catch (error) {
      setError('Failed to sign up with Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linkedin-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg border-2 border-black shadow-brutal">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <div className="mt-4 text-2xl font-bold text-blue-600 text-center">😽 KopyKat</div>
        </div>
        {error && (
          <p className="text-red-500 text-center">{error}</p>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                type="text"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                } text-black placeholder-gray-500 rounded-t-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Full Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  validateName(e.target.value);
                }}
                disabled={isLoading}
              />
              {nameError && (
                <p className="text-red-500 text-xs mt-1">{nameError}</p>
              )}
            </div>
            
            <div>
              <input
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                disabled={isLoading}
              />
              {emailError && (
                <p className="text-red-500 text-xs mt-1">{emailError}</p>
              )}
            </div>
            
            <div>
              <input
                type="password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                } text-black placeholder-gray-500 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                disabled={isLoading}
              />
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <h3 className="font-medium">Requirements:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li className={`${name.length >= 2 && name.length <= 50 ? 'text-green-600' : ''}`}>
                Name must be between 2 and 50 characters
              </li>
              <li className={`${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'text-green-600' : ''}`}>
                Valid email address required
              </li>
              <li className={`${password.length >= 8 ? 'text-green-600' : ''}`}>
                Password must be at least 8 characters
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading || isGoogleLoading}
            >
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                'Sign up'
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignUp}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading || isGoogleLoading}
            >
              {isGoogleLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <FcGoogle className="w-5 h-5" />
                  <span>Sign up with Google</span>
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link 
            href="/login" 
            className={`text-blue-600 hover:text-blue-500 ${(isLoading || isGoogleLoading) ? 'pointer-events-none opacity-50' : ''}`}
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
} 