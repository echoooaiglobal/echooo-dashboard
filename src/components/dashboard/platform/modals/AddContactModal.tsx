// src/components/dashboard/platform/modals/AddContactModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, User, Mail, Phone, MessageSquare } from 'react-feather';
import { AssignmentMember } from '@/types/assignment-members';
import { ContactType, CreateInfluencerContactRequest } from '@/types/influencer-contacts';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AddContactModalProps {
  member: AssignmentMember | null;
  isOpen: boolean;
  onClose: () => void;
  onContactAdded: () => void;
}

const CONTACT_TYPES: { value: ContactType; label: string; icon: React.ReactNode }[] = [
  { value: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
  { value: 'phone', label: 'Phone', icon: <Phone className="w-4 h-4" /> },
  { value: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'telegram', label: 'Telegram', icon: <MessageSquare className="w-4 h-4" /> },
  { value: 'other', label: 'Other', icon: <MessageSquare className="w-4 h-4" /> },
];

export default function AddContactModal({
  member,
  isOpen,
  onClose,
  onContactAdded
}: AddContactModalProps) {
  const [formData, setFormData] = useState({
    contact_type: 'email' as ContactType,
    contact_value: '',
    name: '',
    is_primary: false,
    platform_specific: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form data when member changes
  useEffect(() => {
    if (member && isOpen) {
      setFormData({
        contact_type: 'email',
        contact_value: '',
        name: '',
        is_primary: false,
        platform_specific: false
      });
      setError(null);
      setSuccess(false);
    }
  }, [member, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const validateContactValue = (type: ContactType, value: string): boolean => {
    switch (type) {
      case 'email':
        return validateEmail(value);
      case 'phone':
      case 'whatsapp':
        return validatePhone(value);
      default:
        return value.trim().length > 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate contact value based on type
      if (!validateContactValue(formData.contact_type, formData.contact_value)) {
        let errorMessage = 'Invalid contact value';
        if (formData.contact_type === 'email') {
          errorMessage = 'Please enter a valid email address';
        } else if (formData.contact_type === 'phone' || formData.contact_type === 'whatsapp') {
          errorMessage = 'Please enter a valid phone number';
        }
        throw new Error(errorMessage);
      }

      // Prepare create data
      const createData: CreateInfluencerContactRequest = {
        social_account_id: member.social_account.id,
        contact_type: formData.contact_type,
        contact_value: formData.contact_value.trim(),
        name: formData.name.trim() || `${formData.contact_type} contact`,
        is_primary: formData.is_primary,
        platform_specific: formData.platform_specific
      };

      console.log('Creating contact with data:', createData);

      // Call API to create contact
      await createInfluencerContact(createData);
      
      setSuccess(true);
      
      // Call parent handler
      onContactAdded();
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error creating contact:', error);
      setError(error instanceof Error ? error.message : 'Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContactTypeIcon = (type: ContactType) => {
    const contactType = CONTACT_TYPES.find(ct => ct.value === type);
    return contactType?.icon || <MessageSquare className="w-4 h-4" />;
  };

  const getPlaceholder = (type: ContactType): string => {
    switch (type) {
      case 'email':
        return 'manager@influencer.com';
      case 'phone':
      case 'whatsapp':
        return '+1234567890';
      case 'telegram':
        return '@username';
      default:
        return 'Contact information';
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Add Contact Information</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add contact details for {member.social_account.full_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm font-medium">
              ✅ Contact added successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Influencer Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <img 
                className="h-12 w-12 rounded-full object-cover" 
                src={member.social_account.profile_pic_url} 
                alt={member.social_account.full_name}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.social_account.full_name)}&background=random`;
                }}
              />
              <div className="ml-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  {member.social_account.full_name}
                  {member.social_account.is_verified && (
                    <svg className="w-4 h-4 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </h4>
                <p className="text-sm text-gray-500">@{member.social_account.account_handle}</p>
                <p className="text-xs text-gray-400">
                  {(member.social_account.followers_count / 1000000).toFixed(1)}M followers • {member.platform.name}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Contact Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Type *
              </label>
              <select
                name="contact_type"
                value={formData.contact_type}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              >
                {CONTACT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Information *
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {getContactTypeIcon(formData.contact_type)}
                </div>
                <input
                  type="text"
                  name="contact_value"
                  value={formData.contact_value}
                  onChange={handleInputChange}
                  placeholder={getPlaceholder(formData.contact_type)}
                  required
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Contact Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Business Manager, Agent, Personal"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional - Leave empty to auto-generate from contact type
              </p>
            </div>

            {/* Primary Contact */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Mark as primary contact
              </label>
            </div>

            {/* Platform Specific */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="platform_specific"
                checked={formData.platform_specific}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Platform-specific contact
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Adding...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Add Contact
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}