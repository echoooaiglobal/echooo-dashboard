'use client';

import { useRouter } from 'next/navigation';
import EditInfluencerForm from '@/components/forms/Influencer/EditInfluencerForm';

export default function EditInfluencerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = parseInt(params.id, 10);

  const handleSuccess = () => {
    router.push('/influencers');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Influencer</h1>
      <EditInfluencerForm id={id} onSuccess={handleSuccess} />
    </div>
  );
}