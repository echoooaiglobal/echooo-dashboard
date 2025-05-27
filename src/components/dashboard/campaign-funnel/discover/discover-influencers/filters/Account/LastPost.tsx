import React, { useState, useEffect } from 'react';
import { IoCalendarOutline, IoClose } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface LastPostProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
} 

const LastPost: React.FC<LastPostProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
}) => {
  const [selectedDatetime, setSelectedDatetime] = useState<string>('');

  // Convert API timestamp to datetime string for input
  const timestampToDatetimeString = (timestamp: string): string => {
    try {
      // Handle both formats: "2019-08-24T14:15:22" and "2019-08-24T14:15:22.000Z"
      const date = new Date(timestamp);
      // Convert to local datetime string format (YYYY-MM-DDTHH:MM)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Convert datetime string to API timestamp format
  const datetimeStringToTimestamp = (datetimeString: string): string => {
    if (!datetimeString) return '';
    try {
      const date = new Date(datetimeString);
      // Format as "YYYY-MM-DDTHH:MM:SS" (without milliseconds and timezone)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    } catch {
      return '';
    }
  };

  // Sync internal state with parent props
  useEffect(() => {
    if (filters.last_post_timestamp) {
      const datetimeString = timestampToDatetimeString(filters.last_post_timestamp);
      if (datetimeString !== selectedDatetime) {
        setSelectedDatetime(datetimeString);
      }
    } else {
      setSelectedDatetime('');
    }
  }, [filters.last_post_timestamp]);

  const handleDatetimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const datetimeValue = event.target.value;
    setSelectedDatetime(datetimeValue);
    
    if (datetimeValue) {
      const timestamp = datetimeStringToTimestamp(datetimeValue);
      onFilterChange({ last_post_timestamp: timestamp });
    } else {
      onFilterChange({ last_post_timestamp: undefined });
    }
  };

  const clearDatetime = () => {
    setSelectedDatetime('');
    onFilterChange({ last_post_timestamp: undefined });
  };

  // Get current datetime for max attribute (prevent future dates)
  const now = new Date();
  const maxDatetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // Format display datetime
  const formatDisplayDatetime = (datetimeString: string): string => {
    if (!datetimeString) return '';
    try {
      const date = new Date(datetimeString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return datetimeString;
    }
  };

  return (
    <FilterComponent
      hasActiveFilters={!!selectedDatetime}
      icon={<IoCalendarOutline size={18} />}
      title="Last Post"
      isOpen={isOpen}
      onToggle={onToggle}
      className=""
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-600">Posted After Date & Time</h4>
          {selectedDatetime && (
            <button
              onClick={clearDatetime}
              className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors"
              title="Clear datetime"
            >
              <IoClose size={14} />
              Clear
            </button>
          )}
        </div>

        <div className="space-y-3">
          {/* Datetime Input */}
          <div className="relative">
            <input
              type="datetime-local"
              value={selectedDatetime}
              onChange={handleDatetimeChange}
              max={maxDatetime}
              className="w-full p-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-colors cursor-pointer"
              placeholder="Select date and time"
            />
            
            {/* Custom calendar icon overlay */}
            <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
              <IoCalendarOutline size={18} />
            </div>
          </div>

          {/* Display selected datetime info */}
          {selectedDatetime && (
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-purple-800">
                    Filter: Posted after {formatDisplayDatetime(selectedDatetime)}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    Shows creators who posted content after this date & time
                  </div>
                </div>
                <button
                  onClick={clearDatetime}
                  className="text-purple-600 hover:text-purple-800 transition-colors"
                  title="Remove filter"
                >
                  <IoClose size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Helper text */}
          <div className="text-xs text-gray-500">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Select a date and time to filter creators who posted content after that moment</span>
            </div>
            <div className="flex items-start gap-2 mt-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
              <span>Only past and current date/time are allowed</span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!selectedDatetime && (
          <div className="text-center py-6">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <IoCalendarOutline className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-sm text-gray-600 font-medium">No Date & Time Selected</div>
            <div className="text-xs text-gray-400">Choose date and time to filter by last post</div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default LastPost;