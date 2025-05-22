import React from 'react';
import { IoPeopleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';

type AudienceTypeProps = {
  audienceSource: string;
  onChange: (audience_source: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

// Display label → Value to pass in audience_source
const AUDIENCE_SOURCE_OPTIONS: { label: string; value: string }[] = [
  { label: 'Any', value: 'any' },
  { label: 'Engaged', value: 'likers' },
  { label: 'Followers', value: 'followers' },
];

const AudienceType: React.FC<AudienceTypeProps> = ({
  audienceSource,
  onChange,
  isOpen,
  onToggle,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FilterComponent
      icon={<IoPeopleOutline size={18} />}
      title="Audience Type"
      isOpen={isOpen}
      onToggle={onToggle}
      className="border border-gray-200 rounded-md"
    >
      <div className="space-y-2 p-3">
        {AUDIENCE_SOURCE_OPTIONS.map(({ label, value }) => (
          <label key={value} className="flex items-center">
            <input
              type="radio"
              name="audience_source"
              value={value}
              checked={audienceSource === value}
              onChange={handleChange}
              className="form-radio h-4 w-4 text-purple-600"
            />
            <span className="ml-2 text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>
    </FilterComponent>
  );
};

export default AudienceType;
