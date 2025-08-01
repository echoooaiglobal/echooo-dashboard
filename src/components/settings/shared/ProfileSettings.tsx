// ============================================
// 9. src/components/settings/shared/ProfileSettings.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import SettingsCard from './SettingsCard';
import { User, Home, Globe, Camera } from 'react-feather';

export default function ProfileSettings() {
  const { user, getPrimaryRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const role = getPrimaryRole() as DetailedRole;

  const [formData, setFormData] = useState({
    // Universal fields
    firstName: '',
    lastName: '', 
    email: '',
    phone: '',
    avatar: '',
    
    // Company-specific fields
    companyName: '',
    industry: '',
    website: '',
    companySize: '',
    
    // Influencer-specific fields
    socialHandles: {
      instagram: '',
      tiktok: '',
      youtube: '',
      twitter: ''
    },
    
    // Platform-specific fields
    department: '',
    employeeId: ''
  });

  // Show different field groups based on role
  const isCompanyUser = role?.startsWith('b2c_');
  const isInfluencer = role === 'influencer';
  const isPlatformUser = role?.startsWith('platform_');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API call to update profile
      const response = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to update profile');
      
      // Show success message
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingsCard
        title="Personal Information"
        description="Update your personal details and contact information"
        icon={<User className="w-5 h-5" />}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Universal Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Company-specific fields */}
          {isCompanyUser && (
            <>
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Company Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select Industry</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="retail">Retail</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Influencer-specific fields */}
          {isInfluencer && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Social Media Handles
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formData.socialHandles.instagram}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialHandles: {...formData.socialHandles, instagram: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TikTok
                  </label>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formData.socialHandles.tiktok}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialHandles: {...formData.socialHandles, tiktok: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </SettingsCard>
    </div>
  );
}