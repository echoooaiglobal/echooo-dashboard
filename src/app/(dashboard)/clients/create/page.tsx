'use client';

import AddClientForm from '@/components/forms/Client/AddClientForm';
import { useRouter } from 'next/navigation';

export default function CreateClientPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/clients'); // Redirect to the clients list page
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create Client</h1>
      <AddClientForm onSuccess={handleSuccess} />
    </div>
  );
}