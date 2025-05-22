import React from 'react';
import { IoBusinessOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';

const Partnership: React.FC = () => {
  return (
    <FilterComponent icon={<IoBusinessOutline size={18} />} title="Partnerships">
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search brand or company"
          className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Partnership Status</h4>
          <div className="space-y-2">
            {[
              "Currently partnered", 
              "Previously partnered", 
              "Open to partnerships", 
              "No partnerships"
            ].map((status) => (
              <label key={status} className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-600" />
                <span className="ml-2 text-sm text-gray-700">{status}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Partnership Type</h4>
          <div className="space-y-2">
            {[
              "Sponsored Posts", 
              "Brand Ambassador", 
              "Affiliate Marketing", 
              "Product Reviews", 
              "Giveaways"
            ].map((type) => (
              <label key={type} className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-600" />
                <span className="ml-2 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-600 mb-2">Popular Brands</h4>
          <div className="space-y-2">
            {["Nike", "Adidas", "Samsung", "Apple", "Amazon"].map((brand) => (
              <label key={brand} className="flex items-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-purple-600" />
                <span className="ml-2 text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </FilterComponent>
  );
};

export default Partnership;