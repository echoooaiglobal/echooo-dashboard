'use client';

import { useState, useEffect } from 'react';
import { getClients, deleteClient } from '@/services/clientService';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const limit = 10;

  // Define the header map
  const headerMap = {
    'ID': 'id',
    'Name': 'name',
    'Company': 'company_name', // Map "Client Id" to "client_Id"
  };

  const fetchClients = async (page = 1) => {
    try {
      const response = await getClients(page);

      setClients(response);
      setTotalPages(Math.ceil(response.total_count / limit));
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients(currentPage);
  }, [currentPage]);

  const handleEdit = (id: number) => {
    router.push(`/clients/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteClient(id);
      fetchClients(currentPage); // Refresh the table
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleCreate = () => {
    console.log('Navigating to create page...');
    router.push('/clients/create'); // Navigate to the create page
  };
 
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Clients</h1>
      <Button onClick={handleCreate} className="mb-6 px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 shadow-lg rounded-md" variant="primary">
        Create Client
      </Button>


      


      <div className="mt-6">
        <Table
          headers={['ID', 'Name', 'Company']} // Use the desired header names
          data={clients}
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