// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Account/AccountType.tsx
import React, { useState, useEffect, useRef } from 'react';
import { IoPersonCircleOutline, IoInformationCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import type { AccountType } from '@/lib/creator-discovery-types';

interface AccountTypeProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
}

const AccountType: React.FC<AccountTypeProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter 
}) => {
  const accountTypeOptions: AccountType[] = ['PERSONAL', 'BUSINESS', 'CREATOR'];
  const [selectedTypes, setSelectedTypes] = useState<AccountType[]>(
    filters.creator_account_type || []
  );
  const [showTooltip, setShowTooltip] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const current = filters.creator_account_type || [];
    const areDifferent =
      current.length !== selectedTypes.length ||
      current.some((t) => !selectedTypes.includes(t));
    if (areDifferent) {
      setSelectedTypes(current);
    }
  }, [filters.creator_account_type]);

  const handleTypeToggle = (type: AccountType) => {
    const updatedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(updatedTypes);
    onFilterChange({ creator_account_type: updatedTypes.length > 0 ? updatedTypes : undefined });
  };

  // Format the account type for display
  const formatAccountType = (type: AccountType): string => {
    switch (type) {
      case 'PERSONAL':
        return 'Personal';
      case 'BUSINESS':
        return 'Business';
      case 'CREATOR':
        return 'Creator';
      default:
        return type;
    }
  };

  return (
    <FilterComponent
      hasActiveFilters={selectedTypes.length > 0}
      icon={<IoPersonCircleOutline size={18} />}
      title="Account Type"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=''
      selectedCount={selectedTypes.length}
    >
      <div className="space-y-4">
        {/* Header with Tooltip */}
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-600">Influencer</h4>
          
          {/* Info Icon with Tooltip */}
          <div className="relative" ref={tooltipRef}>
            <button
              type="button"
              className="text-gray-400 hover:text-purple-500 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <IoInformationCircleOutline size={14} />
            </button>
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute left-0 top-6 z-[200] w-56 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
                <div className="relative">
                  {/* Tooltip arrow */}
                  <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  
                  {/* Tooltip content */}
                  <div className="leading-relaxed">
                    Filter creators by account type.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {accountTypeOptions.map((type) => (
            <label key={type} className="flex items-center space-x-3 cursor-pointer hover:bg-purple-50 p-2 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
              />
              <span className="text-sm text-gray-700 font-medium">
                {formatAccountType(type)}
              </span>
            </label>
          ))}
        </div>

        {/* Selected Types Summary */}
        {selectedTypes.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <div className="text-xs font-medium text-gray-600 mb-2">
              Selected ({selectedTypes.length}):
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedTypes.map((type) => (
                <span 
                  key={type}
                  className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                >
                  {formatAccountType(type)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default AccountType;