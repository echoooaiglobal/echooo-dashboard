// src/components/public/PublicReadyToOnboard.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';

interface Influencer {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  followers: string;
  engagements: string;
  avgLikes: string;
  viewsMultiplier: string;
  budget: string;
  cpv: string;
  engagementRate: string;
  platform: string;
  isSelected: boolean;
  status: 'approve' | 'hold' | 'drop' | 'choose';
  notes: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  width: string;
  defaultVisible: boolean;
}

const PublicReadyToOnboard: React.FC = () => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [influencers, setInfluencers] = useState<Influencer[]>([]);

  // All available columns configuration
  const allColumns: ColumnConfig[] = [
    { key: 'name', label: 'Influencer Name', width: 'w-64', defaultVisible: true },
    { key: 'followers', label: 'Followers', width: 'w-24', defaultVisible: true },
    { key: 'engagementRate', label: 'Engagement Rate', width: 'w-32', defaultVisible: true },
    { key: 'engagements', label: 'Engagements', width: 'w-28', defaultVisible: true },
    { key: 'avgLikes', label: 'Avg Likes', width: 'w-24', defaultVisible: true },
    { key: 'viewsMultiplier', label: 'Views Multiplier', width: 'w-32', defaultVisible: true },
    { key: 'budget', label: 'Budget', width: 'w-20', defaultVisible: true },
    { key: 'cpv', label: 'CPV', width: 'w-20', defaultVisible: true },
    { key: 'status', label: 'Status', width: 'w-32', defaultVisible: true },
    { key: 'notes', label: 'Notes', width: 'w-48', defaultVisible: true }
  ];

  // Column value getters for sorting
  const getColumnValue = (influencer: Influencer, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return influencer.name;
      case 'followers':
        const followersStr = influencer.followers.replace(/[^\d.]/g, '');
        const followersNum = parseFloat(followersStr);
        return influencer.followers.includes('M') ? followersNum * 1000000 : 
               influencer.followers.includes('K') ? followersNum * 1000 : followersNum;
      case 'engagementRate':
        return parseFloat(influencer.engagementRate.replace('%', ''));
      case 'engagements':
        const engagementsStr = influencer.engagements.replace(/[^\d.]/g, '');
        const engagementsNum = parseFloat(engagementsStr);
        return influencer.engagements.includes('M') ? engagementsNum * 1000000 : 
               influencer.engagements.includes('K') ? engagementsNum * 1000 : engagementsNum;
      case 'avgLikes':
        const avgLikesStr = influencer.avgLikes.replace(/[^\d.]/g, '');
        const avgLikesNum = parseFloat(avgLikesStr);
        return influencer.avgLikes.includes('M') ? avgLikesNum * 1000000 : 
               influencer.avgLikes.includes('K') ? avgLikesNum * 1000 : avgLikesNum;
      case 'viewsMultiplier':
        return parseFloat(influencer.viewsMultiplier.replace('%', ''));
      case 'budget':
        return parseFloat(influencer.budget.replace(/[^\d.]/g, ''));
      case 'cpv':
        return parseFloat(influencer.cpv.replace(/[^\d.]/g, ''));
      case 'status':
        const statusOrder = { 'choose': 0, 'approve': 1, 'hold': 2, 'drop': 3 };
        return statusOrder[influencer.status as keyof typeof statusOrder] || 0;
      case 'notes':
        return influencer.notes || '';
      default:
        return influencer[columnKey as keyof Influencer];
    }
  };

  // Sample influencer data
  const initialInfluencers: Influencer[] = [
    {
      id: 1,
      name: "Prestia Camira",
      handle: "@prestia",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "34%",
      budget: "$250",
      cpv: "$0.53%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "choose",
      notes: ""
    },
    {
      id: 2,
      name: "Hanna Baptista",
      handle: "@hanna",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "54%",
      budget: "$400",
      cpv: "$0.34%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "choose",
      notes: ""
    },
    {
      id: 3,
      name: "Miracle Geidt",
      handle: "@miracle",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "85%",
      budget: "$120",
      cpv: "$0.24%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "hold",
      notes: ""
    },
    {
      id: 4,
      name: "Rayna Torff",
      handle: "@rayna",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "47%",
      budget: "$800",
      cpv: "$0.64%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "approve",
      notes: ""
    },
    {
      id: 5,
      name: "Giana Lipshutz",
      handle: "@giana",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "85%",
      budget: "$100",
      cpv: "$0.24%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "choose",
      notes: ""
    },
    {
      id: 6,
      name: "James George",
      handle: "@james",
      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "46%",
      budget: "$50",
      cpv: "$2.53%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "drop",
      notes: ""
    },
    {
      id: 7,
      name: "James George",
      handle: "@james2",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "96%",
      budget: "$630",
      cpv: "$1.64%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "choose",
      notes: ""
    },
    {
      id: 8,
      name: "Jordyn George",
      handle: "@jordyn",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "75%",
      budget: "$400",
      cpv: "$0.86%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "approve",
      notes: ""
    },
    {
      id: 9,
      name: "Skylar Herwitz",
      handle: "@skylar",
      avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=48&h=48&fit=crop&crop=face",
      followers: "647.4M",
      engagements: "195.3K",
      avgLikes: "195.3K",
      viewsMultiplier: "25%",
      budget: "$230",
      cpv: "$3.55%",
      engagementRate: "0.03%",
      platform: "instagram",
      isSelected: false,
      status: "choose",
      notes: ""
    }
  ];

  // Initialize influencers state
  useEffect(() => {
    setInfluencers(initialInfluencers);
  }, []);

  // Initialize state from URL parameters
  useEffect(() => {
    const columnsParam = searchParams.get('columns');
    const searchParam = searchParams.get('search');
    const sortKeyParam = searchParams.get('sortKey');
    const sortDirectionParam = searchParams.get('sortDirection');

    // Set visible columns from URL or use defaults (including notes)
    if (columnsParam) {
      const columns = columnsParam.split(',');
      setVisibleColumns(new Set(columns));
    } else {
      // Use default visible columns including notes
      const defaultColumns = allColumns.filter(col => col.defaultVisible).map(col => col.key);
      setVisibleColumns(new Set(defaultColumns));
    }

    // Set search term from URL
    if (searchParam) {
      setSearchTerm(searchParam);
    }

    // Set sort configuration from URL
    if (sortKeyParam && sortDirectionParam) {
      setSortConfig({
        key: sortKeyParam,
        direction: sortDirectionParam as 'asc' | 'desc'
      });
    }
  }, [searchParams]);

  // Handle sorting
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig?.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  // Handle status change
  const handleStatusChange = (id: number, newStatus: 'approve' | 'hold' | 'drop' | 'choose') => {
    setInfluencers(prev => 
      prev.map(influencer => 
        influencer.id === id 
          ? { ...influencer, status: newStatus }
          : influencer
      )
    );
  };

  // Handle notes change
  const handleNotesChange = (id: number, newNotes: string) => {
    setInfluencers(prev => 
      prev.map(influencer => 
        influencer.id === id 
          ? { ...influencer, notes: newNotes }
          : influencer
      )
    );
  };

  // Get sort icon for column headers
  const getSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0.5">
          <svg className="w-3 h-3 text-gray-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-400 -mt-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3.5 h-3.5 text-purple-600 drop-shadow-md filter brightness-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-300 -mt-0.5 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3 h-3 text-gray-300 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3.5 h-3.5 text-purple-600 -mt-0.5 drop-shadow-md filter brightness-110" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'approve':
        return 'text-green-600';
      case 'hold':
        return 'text-yellow-600';
      case 'drop':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'instagram') {
      return (
        <div className="w-4 h-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded flex items-center justify-center ml-1">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        </div>
      );
    }
    return null;
  };

  const visibleColumnsData = allColumns.filter(column => visibleColumns.has(column.key));

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    influencer.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered influencers based on sort configuration
  const sortedInfluencers = useMemo(() => {
    if (!sortConfig?.key || !sortConfig.direction) {
      return filteredInfluencers;
    }

    return [...filteredInfluencers].sort((a, b) => {
      const aValue = getColumnValue(a, sortConfig.key);
      const bValue = getColumnValue(b, sortConfig.key);

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // String comparison (convert to string if needed)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredInfluencers, sortConfig]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ready to Onboard</h1>
            <p className="text-gray-600">Public view of influencer candidates</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search Influencer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white shadow-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1400px' }}>
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  {/* Dynamic Columns - NO PLUS ICON */}
                  {visibleColumnsData.map((column) => (
                    <th key={column.key} scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                        onClick={() => handleSort(column.key)}>
                      <div className="flex items-center justify-between">
                        <span className="group-hover:text-purple-700 transition-colors duration-200">
                          {column.label} {column.key === 'name' && '(823M)'}
                        </span>
                        <div className="transform group-hover:scale-110 transition-transform duration-200">
                          {getSortIcon(column.key)}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInfluencers.map((influencer) => (
                  <tr
                    key={influencer.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* Dynamic Columns */}
                    {visibleColumnsData.map((column) => (
                      <td key={column.key} className={`px-6 py-5 text-sm ${column.key === 'notes' ? '' : 'whitespace-nowrap'}`}>
                        {column.key === 'name' ? (
                          <div className="flex items-center">
                            <div className="relative mr-4">
                              <img
                                src={influencer.avatar}
                                alt={influencer.name}
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.name)}&background=6366f1&color=fff&size=48`;
                                }}
                                loading="lazy"
                              />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <p className="font-semibold text-gray-900 text-base">{influencer.name}</p>
                                {getPlatformIcon(influencer.platform)}
                              </div>
                              <p className="text-sm text-gray-500 font-medium">{influencer.handle}</p>
                            </div>
                          </div>
                        ) : column.key === 'status' ? (
                          <select
                            value={influencer.status}
                            onChange={(e) => handleStatusChange(influencer.id, e.target.value as 'approve' | 'hold' | 'drop' | 'choose')}
                            className={`text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 ${getStatusTextColor(influencer.status)}`}
                          >
                            <option value="choose">Choose</option>
                            <option value="approve">Approve</option>
                            <option value="hold">Hold</option>
                            <option value="drop">Drop</option>
                          </select>
                        ) : column.key === 'notes' ? (
                          <textarea
                            value={influencer.notes}
                            onChange={(e) => handleNotesChange(influencer.id, e.target.value)}
                            placeholder="Add notes about pricing, negotiations, etc..."
                            className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none min-w-[200px]"
                            rows={2}
                          />
                        ) : column.key === 'budget' ? (
                          <span className="font-semibold text-gray-900 text-base">{influencer.budget}</span>
                        ) : (
                          <span className="text-gray-700 font-medium">{influencer[column.key as keyof Influencer]}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="px-3 py-2 text-sm bg-purple-500 text-white rounded-lg shadow-md">1</button>
              <button className="px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-all duration-200">2</button>
              <button className="px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-all duration-200">3</button>
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
              <button className="px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-all duration-200">10</button>
              <button className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-all duration-200">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">Showing {sortedInfluencers.length} entries</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Powered by Influencer Management Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicReadyToOnboard;