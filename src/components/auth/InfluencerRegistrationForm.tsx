// src/components/auth/InfluencerRegistrationForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle } from 'react-feather';
import { registerUser, RegistrationData } from '@/services/auth/register.service';
import { validateEmail, validatePassword, validatePhoneNumber } from '@/utils/validation';
import SuccessMessage  from '@/components/ui/SuccessMessage';

interface InfluencerRegistrationFormProps {
  onSuccess?: (redirectPath: string) => void;
}

export default function InfluencerRegistrationForm({ onSuccess }: InfluencerRegistrationFormProps) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Email validation
    const emailValidation = validateEmail(form.email);
    if (!emailValidation.valid) {
        setError(emailValidation.message);
        setIsSubmitting(false);
        return;
    }
    
    // Password validation
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.valid) {
        setError(passwordValidation.message);
        setIsSubmitting(false);
        return;
    }
    
    // Phone validation (if provided)
    if (form.phone_number) {
        const phoneValidation = validatePhoneNumber(form.phone_number);
        if (!phoneValidation.valid) {
        setError(phoneValidation.message);
        setIsSubmitting(false);
        return;
        }
    }
    
    // Confirm password
    if (form.password !== form.confirmPassword) {
        setError("Passwords don't match");
        setIsSubmitting(false);
        return;
    }
    
    try {
        // Create registration data
        const registrationData: RegistrationData = {
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        phone_number: form.phone_number || undefined,
        user_type: 'influencer'
        };
        
        // Call the registration service
        await registerUser(registrationData);
        
        // Show success message
        setSuccess('Your account has been created successfully. You will be redirected to the login page.');

        // Delay redirect to show success message
        setTimeout(() => {
            if (onSuccess) {
            onSuccess('/login');
            } else {
            router.push('/login');
            }
        }, 3000);
    } catch (error) {
        if (error instanceof Error) {
        setError(error.message);
        } else {
        setError('An error occurred during registration.');
        }
    } finally {
        setIsSubmitting(false);
    }
};

  return (
    <div>
      {success && (
        <SuccessMessage 
            title="Registration Successful!" 
            message={success} 
        />
      )}


      {error && (
         <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
         </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="influencer-name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="influencer-name"
              type="text"
              name="full_name"
              placeholder="John Doe"
              value={form.full_name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="influencer-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="influencer-email"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <label htmlFor="influencer-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="influencer-phone"
              type="tel"
              name="phone_number"
              placeholder="+1234567890"
              value={form.phone_number}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Optional</p>
        </div>

        <div>
          <label htmlFor="influencer-password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="influencer-password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters with 1 uppercase, 1 number</p>
        </div>

        <div>
          <label htmlFor="influencer-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="influencer-confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition placeholder-gray-400"
            />
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:hover:shadow-none flex justify-center items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating account...
            </>
          ) : (
            'Create Influencer Account'
          )}
        </button>
      </form>
    </div>
  );
}