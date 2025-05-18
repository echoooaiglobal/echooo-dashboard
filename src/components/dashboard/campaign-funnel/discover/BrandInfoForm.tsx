// src/components/dashboard/campaign-funnel/discover/BrandInfoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'react-feather';
import { fetchCategories, Category } from '@/services/category/category.service';
import { createCampaign, CreateCampaignRequest } from '@/services/campaign/campaign.service';
import { useApiCall } from '@/hooks/useApiCall';
import { useAuth } from '@/context/AuthContext';
import { getStoredCompany } from '@/services/auth/auth.utils';

interface BrandInfoFormProps {
  onComplete: (formData: any) => void;
}

type FormStep = 1 | 2 | 3 | 4 | 5;

// Currency options
interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

const BrandInfoForm: React.FC<BrandInfoFormProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState({
    brandName: '',
    brandCategory: '',
    audienceAgeGroup: '',
    campaignBudget: 0,
    campaignCurrency: 'USD',
    campaignName: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  
  // Use auth context to get user info
  const { user } = useAuth();
  
  // Use custom hook for API calls
  const categoriesApi = useApiCall<Category[]>();
  const campaignApi = useApiCall();
  
  // Fetch company data on component mount
  useEffect(() => {
    // Get company info from stored data
    const company = getStoredCompany();
    if (company && company.id) {
      setCompanyId(company.id);
    }
  }, []);
  
  // Fetch categories when component loads
  useEffect(() => {
    const getCategories = async () => {
      await categoriesApi.execute(fetchCategories());
    };
    
    getCategories();
  }, []);
  
  // Update categories from API response
  useEffect(() => {
    if (categoriesApi.data) {
      setCategories(categoriesApi.data);
    }
    
    if (categoriesApi.error) {
      setError('Could not load categories. Please try again.');
      
      // Mock data for development
      setCategories([
        { id: '1', name: 'Fashion' },
        { id: '2', name: 'Beauty' },
        { id: '3', name: 'Technology' },
        { id: '4', name: 'Food & Beverage' },
        { id: '5', name: 'Travel' },
        { id: '6', name: 'Fitness' },
        { id: '7', name: 'Lifestyle' }
      ]);
    }
  }, [categoriesApi.data, categoriesApi.error]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle next step
  const handleNext = () => {
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < 5) {
      setCurrentStep((prev => (prev + 1) as FormStep));
    }
  };

  // Validate the current step
  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.brandName.trim()) {
          setError('Please enter your brand name');
          return false;
        }
        break;
      case 2:
        if (!formData.brandCategory.trim()) {
          setError('Please select a brand category');
          return false;
        }
        break;
      case 3:
        if (!formData.audienceAgeGroup) {
          setError('Please select an audience age group');
          return false;
        }
        break;
      case 4:
        if (!formData.campaignBudget) {
          setError('Please enter your campaign budget');
          return false;
        }
        
        // Validate that budget is a valid number
        const budget = formData.campaignBudget;
        if (isNaN(budget) || budget <= 0) {
          setError('Please enter a valid budget amount');
          return false;
        }
        break;
      case 5:
        if (!formData.campaignName.trim()) {
          setError('Please enter a campaign name');
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCurrentStep()) {
      return;
    }
    
    // Check if company ID exists
    if (!companyId) {
      setError('Company information not found. Please log in again.');
      return;
    }
    
    // Create request object with separate budget and currencyCode
    const campaignData: CreateCampaignRequest = {
      name: formData.campaignName,
      brand_name: formData.brandName,
      category_id: formData.brandCategory,
      audience_age_group: formData.audienceAgeGroup,
      budget: formData.campaignBudget, // Just the numeric value
      currency_code: formData.campaignCurrency, // Currency as separate field
      company_id: companyId // From stored company data
    };
    
    try {
      // Call the campaign creation service
      await campaignApi.execute(createCampaign(campaignData));
      
      // Check for errors after API call
      if (campaignApi.error) {
        setError('Failed to create the campaign. Please try again.');
        console.error('API error:', campaignApi.error);
        
        // For development, still call onComplete even if the API fails
        // Remove this in production
        console.log('Form submitted with data:', campaignData);
        onComplete({
          ...formData,
          currencyCode: formData.campaignCurrency,
          company_id: companyId
        });
      } else {
        // Success case
        onComplete({
          ...formData,
          currencyCode: formData.campaignCurrency,
          company_id: companyId
        });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An unexpected error occurred. Please try again.');
      
      // For development, still call onComplete even if the API fails
      // Remove this in production
      console.log('Form submitted with data:', campaignData);
      onComplete({
        ...formData,
        currencyCode: formData.campaignCurrency,
        company_id: companyId
      });
    }
  };

  // Determine if we're in a loading state
  const isLoading = categoriesApi.isLoading || campaignApi.isLoading;

  // Get selected currency symbol
  const getSelectedCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === formData.campaignCurrency);
    return currency ? currency.symbol : '$';
  };

  // Render the appropriate form step
  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <input
              type="text"
              name="brandName"
              placeholder="Your Brand Name"
              value={formData.brandName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </>
        );
      case 2:
        return (
          <>
            <div className="relative">
              <select
                name="brandCategory"
                value={formData.brandCategory}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                required
                disabled={isLoading}
              >
                <option value="">Your Brand Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </>
        );
      case 3:
        return (
          <>
            <div className="relative">
              <select
                name="audienceAgeGroup"
                value={formData.audienceAgeGroup}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                required
                disabled={isLoading}
              >
                <option value="">Audience Age Group</option>
                <option value="13-17">13-17</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45-54">45-54</option>
                <option value="55+">55+</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </>
        );
      case 4:
        return (
          <>
            <div>
              <label htmlFor="campaignBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Campaign Budget
              </label>
              <div className="flex">
                <div className="relative w-1/3 mr-2">
                  <select
                    name="campaignCurrency"
                    value={formData.campaignCurrency}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    required
                    disabled={isLoading}
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                </div>
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {getSelectedCurrencySymbol()}
                  </div>
                  <input
                    type="number"
                    name="campaignBudget"
                    placeholder="Amount"
                    min="0"
                    step="0.01"
                    value={formData.campaignBudget}
                    onChange={handleInputChange}
                    className="w-full pl-8 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </>
        );
      case 5:
        return (
          <>
            <input
              type="text"
              name="campaignName"
              placeholder="Campaign Name"
              value={formData.campaignName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              disabled={isLoading}
            />
            <button
              type="submit"
              className="w-full mt-8 px-6 py-3 bg-purple-500 text-white rounded-full font-medium hover:bg-purple-600 transition-colors disabled:bg-purple-300"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Complete'}
            </button>
          </>
        );
      default:
        return null;
    }
  };

  // Render progress dots
  const renderProgressDots = () => {
    return (
      <div className="flex justify-center space-x-2 mt-12">
        {[1, 2, 3, 4, 5].map(step => (
          <div
            key={step}
            className={`w-3 h-3 rounded-full ${
              step < currentStep 
                ? 'bg-purple-500' 
                : step === currentStep 
                  ? 'bg-purple-500' 
                  : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // Company information warning
  const renderCompanyWarning = () => {
    if (!companyId) {
      return (
        <div className="mb-6 p-3 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
          Company information not found. You may need to log in again or contact support.
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg py-12 px-6">
      <h2 className="text-2xl font-bold text-gray-700 text-center mb-12">
        Let's Us Little About Your Brand
      </h2>

      {renderCompanyWarning()}

      {error && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
        {renderFormStep()}
      </form>

      {renderProgressDots()}
    </div>
  );
};

export default BrandInfoForm;