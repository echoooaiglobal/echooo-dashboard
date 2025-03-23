'use client';

import { useRouter } from 'next/navigation';
import EditClientForm from '@/components/forms/Client/EditClientForm';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = parseInt(params.id, 10);

  const handleSuccess = () => {
    router.push('/clients');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Client</h1>
      <EditClientForm id={id} onSuccess={handleSuccess} />
    </div>
  );
}