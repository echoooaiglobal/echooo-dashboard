'use client';

import AddClientForm from '@/components/forms/Client/AddClientForm';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Optional: Using Heroicons

export default function CreateClientPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/clients');
  };

  const goBack = () => {
    router.push('/clients');
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50 flex flex-col items-center justify-center animate-fade-in">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-8 transition-transform duration-300 hover:shadow-2xl hover:scale-[1.01]">
        {/* Go Back Button */}
        <button
          onClick={goBack}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 transition duration-200 ease-in-out group"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2 group-hover:-translate-x-1 transform transition" />
          Back to Clients
        </button>

        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 text-center">
          Create Client
        </h1>

        <AddClientForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
