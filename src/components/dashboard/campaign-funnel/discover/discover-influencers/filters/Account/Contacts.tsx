import React, { useState, useEffect } from 'react';
import { IoMailOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';
import { CONTACT_TYPES } from '@/lib/influencercontacts';

interface ContactsProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Contacts: React.FC<ContactsProps> = ({ filters, onFilterChange, isOpen, onToggle }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>(filters.with_contact || []);

  useEffect(() => {
    const incoming = filters.with_contact || [];
    const areDifferent =
      incoming.length !== selectedContacts.length ||
      incoming.some(id => !selectedContacts.includes(id));

    if (areDifferent) {
      setSelectedContacts(incoming);
    }
  }, [filters.with_contact]);

  const filteredContacts = CONTACT_TYPES.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSelect = (contactId: string) => {
    const updated = selectedContacts.includes(contactId)
      ? selectedContacts.filter(id => id !== contactId)
      : [...selectedContacts, contactId];

    setSelectedContacts(updated);
    onFilterChange({ with_contact: updated.length > 0 ? updated : undefined });
  };

  const handleRemoveContact = (contactId: string) => {
    const updated = selectedContacts.filter(id => id !== contactId);
    setSelectedContacts(updated);
    onFilterChange({ with_contact: updated.length > 0 ? updated : undefined });
  };

  return (
    <FilterComponent
      icon={<IoMailOutline size={18} />}
      title="Contacts"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-3 relative">
        <h4 className="text-sm font-medium text-gray-600 mb-1">Influencer</h4>

        <div className="relative">
          <input
            type="text"
            placeholder="Add contacts"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />

          {/* Dropdown list (only visible if isOpen) */}
          {isOpen && filteredContacts.length > 0 && (
            <div
              className="absolute z-50 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60 mt-1"
            >
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm flex items-center"
                  onClick={() => {
                    handleContactSelect(contact.id);
                    setSearchQuery('');
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
                    readOnly
                    className="form-checkbox h-4 w-4 text-purple-600 mr-2"
                  />
                  {contact.name}
                </div>
              ))}
            </div>
          )}

          {/* Fallback if no matches */}
          {isOpen && filteredContacts.length === 0 && (
            <div className="absolute z-50 w-full bg-white shadow-md rounded-md py-2 px-3 text-sm text-gray-500 mt-1">
              No contacts found
            </div>
          )}
        </div>

        {/* Selected chips */}
        {selectedContacts.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {selectedContacts.map(contactId => {
                const contact = CONTACT_TYPES.find(c => c.id === contactId);
                return contact ? (
                  <div
                    key={contact.id}
                    className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center text-sm"
                  >
                    {contact.name}
                    <button
                      className="ml-2 text-purple-600 hover:text-purple-900"
                      onClick={() => handleRemoveContact(contact.id)}
                    >
                      ×
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default Contacts;
