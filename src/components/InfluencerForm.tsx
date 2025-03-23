'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  platform: z.string().min(1),
});

export default function InfluencerForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    // Connect to FastAPI POST /influencers
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('name')} className="input" />
      {errors.name && <p className="text-red-500">Name is required</p>}
      {/* Add other fields */}
      <button type="submit" className="btn-primary">Save</button>
    </form>
  );
}