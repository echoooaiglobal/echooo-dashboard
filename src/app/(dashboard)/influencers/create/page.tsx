'use client';

import InfluencerForm from '@/components/forms/Influencer/InfluencerForm';
import { useRouter } from 'next/navigation';

export default function CreateInfluencerPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/influencers'); // Redirect to the influencers list page
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Influencer</h1>
      <InfluencerForm onSuccess={handleSuccess} />
    </div>
  );
}