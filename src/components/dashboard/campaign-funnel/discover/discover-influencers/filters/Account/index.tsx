import React from 'react';
import { IoChevronDown } from 'react-icons/io5';
import LastPost from './LastPost';
import AccountType from './AccountType';
import Contacts from './Contacts';
import { DiscoverSearchParams } from '@/lib/types';

type AccountFiltersProps = {
  filters: DiscoverSearchParams['filter'];
  onFilterChange: (updates: Partial<DiscoverSearchParams['filter']>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
  onlyVerified: boolean;
  setOnlyVerified: (value: boolean) => void;
  onlyCredible: boolean;
  setOnlyCredible: (value: boolean) => void;
  excludePrivate: boolean;
  setExcludePrivate: (value: boolean) => void;
};

const AccountFilters: React.FC<AccountFiltersProps> = ({
  filters,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen,
  onlyVerified,
  setOnlyVerified,
  onlyCredible,
  setOnlyCredible,
  excludePrivate,
  setExcludePrivate
}) => {
  return (
    <>
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 mb-3">Account</h3>
        <div className="grid grid-cols-3 gap-4">
          <LastPost
            filters={filters}
            onFilterChange={onFilterChange}
            isOpen={isFilterOpen('lastPost')}
            onToggle={() => toggleFilterDropdown('lastPost')}
          />
          
          <AccountType
            filters={filters}
            onFilterChange={onFilterChange}
            isOpen={isFilterOpen('accountType')}
            onToggle={() => toggleFilterDropdown('accountType')}
          />
          
          <Contacts
            filters={filters}
            onFilterChange={onFilterChange}
            isOpen={isFilterOpen('contacts')}
            onToggle={() => toggleFilterDropdown('contacts')}
          />
        </div>
      </div>

      {/* Account Options */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-8">
          <div className="flex items-center">
            <input
              type="radio"
              id="onlyVerified"
              checked={onlyVerified}
              onChange={() => {
                setOnlyVerified(true);
                setOnlyCredible(false);
                setExcludePrivate(false);
              }}
              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <label htmlFor="onlyVerified" className="ml-2 text-sm text-gray-700">
              Only Verified Accounts
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="onlyCredible"
              checked={onlyCredible}
              onChange={() => {
                setOnlyVerified(false);
                setOnlyCredible(true);
                setExcludePrivate(false);
              }}
              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <label htmlFor="onlyCredible" className="ml-2 text-sm text-gray-700">
              Only Credible Accounts
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="excludePrivate"
              checked={excludePrivate}
              onChange={() => {
                setOnlyVerified(false);
                setOnlyCredible(false);
                setExcludePrivate(true);
              }}
              className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
            />
            <label htmlFor="excludePrivate" className="ml-2 text-sm text-gray-700">
              Exclude Private Accounts
            </label>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountFilters;