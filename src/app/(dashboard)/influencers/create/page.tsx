'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InfluencerForm from '@/components/forms/Influencer/InfluencerForm';
import InfluencerBulkForm from '@/components/forms/Influencer/InfluencerBulkForm';
import Button from '@/components/ui/Button';

export default function CreateInfluencerPage() {
  const router = useRouter();
  const [showBulkImport, setShowBulkImport] = useState(false);

  const handleSuccess = () => {
    router.push('/influencers'); // Redirect to the influencers list page
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Influencer</h1>

      {/* Button to toggle between individual form and bulk import */}
      {!showBulkImport ? (
        <>
          <InfluencerForm onSuccess={handleSuccess} />
          <div className="mt-6">
            <Button 
              onClick={() => setShowBulkImport(true)} 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2 px-4 rounded-lg shadow-md"
            >
              Import Influencers in Bulk
            </Button>
          </div>
        </>
      ) : (
        <>
          <InfluencerBulkForm onSuccess={handleSuccess} />
          <div className="mt-6">
            <Button 
              onClick={() => setShowBulkImport(false)} 
              className="w-full bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg shadow-md"
            >
              Back to Individual Creation
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
