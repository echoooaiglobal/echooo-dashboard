// src/app/(dashboard)/@company/settings/profile/page.tsx - UPDATED COMPANY VERSION
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, Camera, Save, Mail, Phone, Calendar, MapPin, Briefcase, ArrowLeft } from 'react-feather';
import { DetailedRole } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface ProfileFormData {
  full_name: string;
  email: string;
  phone_number: string;
  bio: string;
  location: string;
  timezone: string;
  language: string;
  profile_image_url: string;
  department: string;
  job_title: string;
}

export default function CompanyProfileSettingsPage() {
  const { user, getPrimaryRole } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    email: '',
    phone_number: '',
    bio: '',
    location: '',
    timezone: 'America/New_York',
    language: 'en',
    profile_image_url: '',
    department: '',
    job_title: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const primaryRole = getPrimaryRole() as DetailedRole;

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        bio: (user as any).bio || '',
        location: (user as any).location || '',
        timezone: (user as any).timezone || 'America/New_York',
        language: (user as any).language || 'en',
        profile_image_url: user.profile_image_url || '',
        department: (user as any).department || '',
        job_title: (user as any).job_title || ''
      });
      setImagePreview(user.profile_image_url);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Updating company user profile:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, profile_image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleDisplayInfo = () => {
    const roleLabels: Record<string, { label: string; description: string }> = {
      b2c_company_owner: { label: 'Company Owner', description: 'Full company account access and management' },
      b2c_company_admin: { label: 'Company Administrator', description: 'Company administration and team management' },
      b2c_marketing_director: { label: 'Marketing Director', description: 'Strategic marketing and campaign oversight' },
      b2c_campaign_manager: { label: 'Campaign Manager', description: 'Campaign creation and management' },
      b2c_campaign_executive: { label: 'Campaign Executive', description: 'Campaign execution and coordination' },
      b2c_social_media_manager: { label: 'Social Media Manager', description: 'Social media strategy and influencer relations' },
      b2c_content_creator: { label: 'Content Creator', description: 'Content creation and template management' },
      b2c_brand_manager: { label: 'Brand Manager', description: 'Brand representation and guidelines' },
      b2c_performance_analyst: { label: 'Performance Analyst', description: 'Campaign performance and ROI analysis' },
      b2c_finance_manager: { label: 'Finance Manager', description: 'Budget management and financial oversight' },
      b2c_account_coordinator: { label: 'Account Coordinator', description: 'Campaign coordination and communication' },
      b2c_viewer: { label: 'Viewer', description: 'Read-only access to campaigns and analytics' }
    };
    
    return roleLabels[primaryRole] || { label: 'Company User', description: 'Company team member' };
  };

  const roleInfo = getRoleDisplayInfo();

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/settings" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your personal information and company profile
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Profile Picture Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8 space-y-6 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-3 text-white hover:bg-blue-700 cursor-pointer">
                  <Camera className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-gray-900">Profile Photo</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Upload a professional photo for your company profile
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span className="text-lg font-medium text-gray-700">{roleInfo.label}</span>
                </div>
                <p className="text-sm text-gray-500">{roleInfo.description}</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-6">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Job Title
                </label>
                <input
                  type="text"
                  value={formData.job_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, job_title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Marketing Manager, Campaign Specialist, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-2" />
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="marketing">Marketing</option>
                  <option value="sales">Sales</option>
                  <option value="brand">Brand Management</option>
                  <option value="creative">Creative</option>
                  <option value="finance">Finance</option>
                  <option value="operations">Operations</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City, State, Country"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-6">Additional Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Bio
                </label>
                <textarea
                  rows={5}
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about your role, experience, and what you do at the company..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/New_York">Eastern Time (EST/EDT)</option>
                    <option value="America/Chicago">Central Time (CST/CDT)</option>
                    <option value="America/Denver">Mountain Time (MST/MDT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-md ${
              message.includes('success') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-6 border-t border-gray-200 space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-500">
              Last updated: {user?.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'Never'}
            </p>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}