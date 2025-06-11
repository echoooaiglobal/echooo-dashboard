// src/components/dashboard/platform/modals/ViewContactsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Mail, Phone, MessageSquare, Star, RefreshCw, Plus, ExternalLink } from 'react-feather';
import { AssignmentMember } from '@/types/assignment-members';
import { InfluencerContact, ContactType } from '@/types/influencer-contacts';
import { getInfluencerContacts } from '@/services/influencer-contacts/influencer-contacts.service';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ViewContactsModalProps {
  member: AssignmentMember | null;
  isOpen: boolean;
  onClose: () => void;
  onAddContact: () => void;
}

const getContactTypeIcon = (type: ContactType) => {
  switch (type) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'phone':
    case 'whatsapp':
      return <Phone className="w-4 h-4" />;
    default:
      return <MessageSquare className="w-4 h-4" />;
  }
};

const getContactTypeColor = (type: ContactType): string => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800';
    case 'phone':
      return 'bg-green-100 text-green-800';
    case 'whatsapp':
      return 'bg-green-100 text-green-800';
    case 'telegram':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatContactValue = (type: ContactType, value: string): string => {
  switch (type) {
    case 'email':
      return value;
    case 'phone':
    case 'whatsapp':
      return value;
    case 'telegram':
      return value.startsWith('@') ? value : `@${value}`;
    default:
      return value;
  }
};

const isClickableContact = (type: ContactType): boolean => {
  return ['email', 'phone', 'whatsapp', 'linkedin', 'facebook', 'youtube', 'instagram', 'twitter', 'tiktok'].includes(type);
};

const getContactLink = (type: ContactType, value: string): string => {
  switch (type) {
    case 'email':
      return `mailto:${value}`;
    case 'phone':
      return `tel:${value}`;
    case 'whatsapp':
      return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
    default:
      return '#';
  }
};

export default function ViewContactsModal({
  member,
  isOpen,
  onClose,
  onAddContact
}: ViewContactsModalProps) {
  const [contacts, setContacts] = useState<InfluencerContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch contacts when modal opens
  useEffect(() => {
    if (isOpen && member) {
      fetchContacts();
    }
  }, [isOpen, member]);

  const fetchContacts = async () => {
    if (!member) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedContacts = await getInfluencerContacts(member.social_account.id);
      setContacts(fetchedContacts);
      
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            <p className="text-sm text-gray-500 mt-1">
              Manage contacts for {member.social_account.full_name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchContacts}
              disabled={isLoading}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Refresh contacts"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Influencer Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
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
            <button
              onClick={onAddContact}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </button>
          </div>
        </div>

        {/* Contacts Content */}
        <div className="p-6">
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="md" />
              <span className="ml-3 text-gray-500">Loading contacts...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-600 text-sm font-medium">Error Loading Contacts</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={fetchContacts}
                className="text-sm text-teal-600 hover:text-teal-800 font-medium"
              >
                Try again
              </button>
            </div>
          )}

          {/* Contacts List */}
          {!isLoading && !error && (
            <>
              {contacts.length > 0 ? (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getContactTypeColor(contact.contact_type)}`}>
                              {getContactTypeIcon(contact.contact_type)}
                              <span className="ml-1 capitalize">{contact.contact_type}</span>
                            </span>
                            {contact.is_primary && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                <Star className="w-3 h-3 mr-1" />
                                Primary
                              </span>
                            )}
                            {contact.platform_specific && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Platform
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                              <div className="flex items-center mt-1">
                                {isClickableContact(contact.contact_type) ? (
                                  <a
                                    href={getContactLink(contact.contact_type, contact.contact_value)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                                  >
                                    {formatContactValue(contact.contact_type, contact.contact_value)}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                  </a>
                                ) : (
                                  <span className="text-sm text-gray-600">
                                    {formatContactValue(contact.contact_type, contact.contact_value)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Added {formatDate(contact.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No contacts found</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    No contact information has been added for this influencer yet.
                  </p>
                  <button
                    onClick={onAddContact}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Contact
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}