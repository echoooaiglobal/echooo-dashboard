'use client';

import { useState, useEffect } from 'react';
import { getInfluencers, deleteInfluencer } from '@/services/influencerService';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

interface Influencer {
  id: number;
  username: string;
  client_id: number;
  client_name?: string;
  message_status: boolean;
  error_code: string | null;
  error_reason: string | null;
}

interface TableInfluencer extends Omit<Influencer, 'message_status'> {
  status_display: React.ReactNode; // For the JSX status display
  message_status: string; // Keep original as string for sorting/filtering
}

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const limit = 10;

  // This must exactly match keys of TableInfluencer
  const headerMap: Record<string, keyof TableInfluencer> = {
    'ID': 'id',
    'Username': 'username',
    'Client Name': 'client_name',
    'Status': 'status_display', // Must match the property name exactly
  };

  const fetchInfluencers = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await getInfluencers(page, limit);
      setInfluencers(response.influencers || []);
      setTotalPages(Math.ceil(response.total_count / limit));
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfluencers(currentPage);
  }, [currentPage]);

  const prepareTableData = (data: Influencer[]): TableInfluencer[] => {
    return data.map(influencer => ({
      ...influencer,
      client_name: influencer.client_name || 'N/A',
      status_display: influencer.error_code ? (
        <span className="text-red-600 font-medium">{influencer.error_reason}</span>
      ) : influencer.message_status ? (
        <span className="text-green-600 font-medium">Sent</span>
      ) : (
        <span className="text-gray-500 font-medium">Pending</span>
      ),
      message_status: influencer.error_code 
        ? `Error: ${influencer.error_reason}`
        : influencer.message_status 
          ? 'Sent' 
          : 'Pending'
    }));
  };

  const tableData = prepareTableData(influencers);

  const handleEdit = (id: number) => {
    router.push(`/influencers/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteInfluencer(id);
      fetchInfluencers(currentPage);
    } catch (error) {
      console.error('Error deleting influencer:', error);
    }
  };

  const handleCreate = () => {
    router.push('/influencers/create');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Influencers</h1>
      <Button onClick={handleCreate} className="mb-6" variant="primary">
        Create Influencer
      </Button>
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="mt-6">
          <Table<TableInfluencer>
            headers={Object.keys(headerMap)}
            data={tableData}
            onEdit={handleEdit}
            onDelete={handleDelete}
            headerMap={headerMap}
          />
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}
    </div>
  );
}