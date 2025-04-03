'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import { createInfluencer } from '@/services/influencerService';

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  client_id: z
    .string()
    .regex(/^\d+$/, 'Client ID must be a number')
    .transform((val) => Number(val)),
});

type FormData = z.infer<typeof schema>;

interface InfluencerFormProps {
  onSuccess: () => void;
}

export default function InfluencerForm({ onSuccess }: InfluencerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsSubmitting(true);
    try {
      await createInfluencer(data);
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add influencer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Influencer</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            {...register('username')}
            id="username"
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.username ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
            placeholder="e.g., johndoe"
          />
          {errors.username && (
            <p className="text-sm text-red-600 mt-1">{errors.username.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
            Client ID <span className="text-red-500">*</span>
          </label>
          <input
            {...register('client_id')}
            id="client_id"
            type="number"
            defaultValue={1}
            className={`w-full px-4 py-2 rounded-lg border ${
              errors.client_id ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
          />
          {errors.client_id && (
            <p className="text-sm text-red-600 mt-1">{errors.client_id.message}</p>
          )}
        </div>
        
        <div className="pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Add Influencer'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}