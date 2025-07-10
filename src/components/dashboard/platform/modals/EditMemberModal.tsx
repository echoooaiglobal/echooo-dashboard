// src/components/dashboard/platform/modals/EditMemberModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Save, AlertCircle } from 'react-feather';
import { AssignmentMember } from '@/types/assignment-members';
import { Status, getStatusDisplayConfig } from '@/types/statuses';
import { updateCampaignListMember } from '@/services/campaign-list-members';
import { UpdateCampaignListMemberRequest } from '@/types/campaign-list-members';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EditMemberModalProps {
  member: AssignmentMember | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedMember: AssignmentMember) => void;
  availableStatuses: Status[];
  statusesLoading: boolean;
}

export default function EditMemberModal({
  member,
  isOpen,
  onClose,
  onUpdate,
  availableStatuses,
  statusesLoading
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    status_id: '',
    contact_attempts: 0,
    last_contacted_at: '',
    next_contact_at: '',
    responded_at: '',
    collaboration_price: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        status_id: member.status_id || '',
        contact_attempts: member.contact_attempts || 0,
        last_contacted_at: member.last_contacted_at ? 
          new Date(member.last_contacted_at).toISOString().slice(0, 16) : '',
        next_contact_at: member.next_contact_at ? 
          new Date(member.next_contact_at).toISOString().slice(0, 16) : '',
        responded_at: member.responded_at ? 
          new Date(member.responded_at).toISOString().slice(0, 16) : '',
        collaboration_price: member.collaboration_price?.toString() || '',
        notes: member.notes || ''
      });
      setError(null);
      setSuccess(false);
    }
  }, [member]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Prepare update data
      const updateData: UpdateCampaignListMemberRequest = {
        status_id: formData.status_id || undefined,
        contact_attempts: formData.contact_attempts || undefined,
        last_contacted_at: formData.last_contacted_at ? 
          new Date(formData.last_contacted_at).toISOString() : undefined,
        next_contact_at: formData.next_contact_at ? 
          new Date(formData.next_contact_at).toISOString() : undefined,
        responded_at: formData.responded_at ? 
          new Date(formData.responded_at).toISOString() : undefined,
        collaboration_price: formData.collaboration_price ? 
          parseFloat(formData.collaboration_price) : undefined,
        notes: formData.notes || undefined
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateCampaignListMemberRequest] === undefined) {
          delete updateData[key as keyof UpdateCampaignListMemberRequest];
        }
      });

      console.log('Updating member with data:', updateData);

      // Call API to update member
      const updatedMember = await updateCampaignListMember(member.id, updateData);
      
      // Create updated AssignmentMember object
      const updatedAssignmentMember: AssignmentMember = {
        ...member,
        status_id: updatedMember.status_id,
        contact_attempts: updatedMember.contact_attempts,
        last_contacted_at: updatedMember.last_contacted_at,
        next_contact_at: updatedMember.next_contact_at,
        responded_at: updatedMember.responded_at,
        collaboration_price: updatedMember.collaboration_price,
        notes: updatedMember.notes,
        updated_at: updatedMember.updated_at,
        status: updatedMember.status
      };

      setSuccess(true);
      
      // Call parent update handler
      onUpdate(updatedAssignmentMember);
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating member:', error);
      setError(error instanceof Error ? error.message : 'Failed to update member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }); 
  };
 
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Update Contact Status</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage outreach progress for {member.social_account.full_name}
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
              ✅ Member updated successfully!
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Status *
              </label>
              {statusesLoading ? (
                <div className="flex items-center p-3 border border-gray-300 rounded-md">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2 text-sm text-gray-500">Loading statuses...</span>
                </div>
              ) : (
                <select
                  name="status_id"
                  value={formData.status_id}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
                >
                  <option value="">Select Status</option>
                  {availableStatuses.map((status) => {
                    const config = getStatusDisplayConfig(status.name);
                    return (
                      <option key={status.id} value={status.id}>
                        {config.label}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Contact Attempts */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Attempts
              </label>
              <input
                type="number"
                name="contact_attempts"
                value={formData.contact_attempts}
                onChange={handleInputChange}
                min="0"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>

            {/* Last Contacted */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Last Contacted
              </label>
              <input
                type="datetime-local"
                name="last_contacted_at"
                value={formData.last_contacted_at}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>

            {/* Next Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Next Contact
              </label>
              <input
                type="datetime-local"
                name="next_contact_at"
                value={formData.next_contact_at}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>

            {/* Responded At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Responded At
              </label>
              <input
                type="datetime-local"
                name="responded_at"
                value={formData.responded_at}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>

            {/* Collaboration Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Collaboration Price ($)
              </label>
              <input
                type="number"
                name="collaboration_price"
                value={formData.collaboration_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              placeholder="Add notes about this contact..."
              disabled={isSubmitting}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-gray-100"
            />
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
              disabled={isSubmitting || statusesLoading}
              className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Member
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}