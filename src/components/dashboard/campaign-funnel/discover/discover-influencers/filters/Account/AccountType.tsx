import React, { useState, useEffect } from 'react';
import { IoPersonCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { DiscoverSearchParams } from '@/lib/types';

interface AccountTypeProps {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const AccountType: React.FC<AccountTypeProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
}) => {
  const accountTypeOptions = ['Regular', 'Business', 'Creator', 'UGC Creator'];
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    filters.account_type || []
  );

  useEffect(() => {
    const current = filters.account_type || [];
    const areDifferent =
      current.length !== selectedTypes.length ||
      current.some((t) => !selectedTypes.includes(t));
    if (areDifferent) {
      setSelectedTypes(current);
    }
  }, [filters.account_type]);

  const handleTypeToggle = (type: string) => {
    const updatedTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];

    setSelectedTypes(updatedTypes);
    onFilterChange({ account_type: updatedTypes.length > 0 ? updatedTypes : undefined });
  };

  return (
    <FilterComponent
      icon={<IoPersonCircleOutline size={18} />}
      title="Account Type"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-600">Influencer</h4>
        <div className="space-y-3">
          {accountTypeOptions.map((type) => (
            <label key={type} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="form-checkbox h-4 w-4 text-purple-600"
              />
              <span className="text-sm text-gray-700">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </FilterComponent>
  );
};

export default AccountType;
