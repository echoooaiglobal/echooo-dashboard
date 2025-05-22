import React, { useState } from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';

interface FilterComponentProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
}

const FilterComponent: React.FC<FilterComponentProps> = ({ icon, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-full text-gray-600 hover:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-300"
      >
        <div className="flex items-center">
          <span className="text-gray-400 mr-2">{icon}</span>
          <span className="text-sm">{title}</span>
        </div>
        <IoChevronDownOutline className={`text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterComponent;