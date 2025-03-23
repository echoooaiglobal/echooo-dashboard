'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/ui/Button';
import { createClient } from '@/services/clientService';

// Form schema using Zod
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  company_name: z.string().min(1, 'Company Name is required'),
  // name: z.string().min(1, 'Name is required'),
  // email: z.string().email('Invalid email address'),
  // platform: z.string().min(1, 'Platform is required'),
});

type FormData = z.infer<typeof schema>;

interface ClientFormProps {
  onSuccess: () => void; // Callback for successful form submission
}

export default function AddClientForm({ onSuccess }: ClientFormProps) {
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
      await createClient(data);
      onSuccess(); // Call the onSuccess callback
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to add client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          {...register('name')}
          id="name"
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
        />
        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
          Company Name
        </label>
        <input
          {...register('company_name')}
          id="company_name"
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
        />
        {errors.company_name && <p className="text-xs text-red-600 mt-1">{errors.company_name.message}</p>}
      </div>
      {/* <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          {...register('name')}
          id="name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          {...register('email')}
          id="email"
          type="email"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
          Platform
        </label>
        <input
          {...register('platform')}
          id="platform"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.platform && <p className="text-sm text-red-600">{errors.platform.message}</p>}
      </div> */}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Add Client'}
      </Button>
    </form>
  );
}