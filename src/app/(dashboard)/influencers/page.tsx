'use client';

import { useState, useEffect } from 'react';
import { getInfluencers, deleteInfluencer } from '@/services/influencerService';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const limit = 10;

  // Define the header map
  const headerMap = {
    'ID': 'id',
    'Username': 'username',
    'Client Id': 'client_id', // Map "Client Id" to "client_Id"
  };

  const fetchInfluencers = async (page = 1) => {
    try {
      const response = await getInfluencers(page);
      setInfluencers(response.influencers);
      setTotalPages(Math.ceil(response.total_count / limit));
    } catch (error) {
      console.error('Error fetching influencers:', error);
    }
  };

  useEffect(() => {
    fetchInfluencers(currentPage);
  }, [currentPage]);

  const handleEdit = (id: number) => {
    router.push(`/influencers/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInfluencer(id);
      fetchInfluencers(currentPage); // Refresh the table
    } catch (error) {
      console.error('Error deleting influencer:', error);
    }
  };

  const handleCreate = () => {
    console.log('Navigating to create page...');
    router.push('/influencers/create'); // Navigate to the create page
  };
 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Influencers</h1>
      <Button onClick={handleCreate} className="mb-6" variant="primary">
        Create Influencer
      </Button>
      <div className="mt-6">
        <Table
          headers={['ID', 'Username', 'Client Id']} // Use the desired header names
          data={influencers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          headerMap={headerMap} // Pass the header map
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}