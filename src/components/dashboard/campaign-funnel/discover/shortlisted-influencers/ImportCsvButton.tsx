// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ImportCsvButton.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle } from 'react-feather';

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentUsername: string;
  errors: Array<{ username: string; error: string }>;
}

interface ImportCsvButtonProps {
  onImportInfluencer: (username: string) => Promise<boolean>;
  disabled?: boolean;
  className?: string;
}

const ImportCsvButton: React.FC<ImportCsvButtonProps> = ({
  onImportInfluencer,
  disabled = false,
  className = ''
}) => {
  const [isImporting, setIsImporting] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentUsername: '',
    errors: []
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = () => {
    if (disabled || isImporting) return;
    fileInputRef.current?.click();
  };

  // Parse CSV content and extract usernames
  const parseCSV = (content: string): string[] => {
    const lines = content.split('\n').map(line => line.trim()).filter(line => line);
    const usernames: string[] = [];

    for (const line of lines) {
      // Split by comma and get the first column, removing quotes if present
      const columns = line.split(',');
      let username = columns[0].trim().replace(/^["']|["']$/g, '');
      
      // Remove @ symbol if present
      username = username.replace(/^@/, '');
      
      // Skip empty usernames and header rows
      if (username && username.toLowerCase() !== 'username') {
        usernames.push(username);
      }
    }

    return [...new Set(usernames)]; // Remove duplicates
  };

  // Process the uploaded file
  const processFile = async (file: File) => {
    try {
      const content = await file.text();
      const usernames = parseCSV(content);

      if (usernames.length === 0) {
        alert('No valid usernames found in the CSV file. Please ensure the file contains usernames in the first column.');
        return;
      }

      // Initialize progress
      const initialProgress: ImportProgress = {
        total: usernames.length,
        processed: 0,
        successful: 0,
        failed: 0,
        currentUsername: '',
        errors: []
      };

      setProgress(initialProgress);
      setShowProgressModal(true);
      setIsImporting(true);

      // Process usernames one by one
      for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        
        setProgress(prev => ({
          ...prev,
          currentUsername: username,
          processed: i + 1
        }));

        try {
          const success = await onImportInfluencer(username);
          
          setProgress(prev => ({
            ...prev,
            successful: success ? prev.successful + 1 : prev.successful,
            failed: success ? prev.failed : prev.failed + 1,
            errors: success ? prev.errors : [
              ...prev.errors,
              { username, error: 'Failed to add to list' }
            ]
          }));

          // Add a small delay to prevent overwhelming the API
          if (i < usernames.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          setProgress(prev => ({
            ...prev,
            failed: prev.failed + 1,
            errors: [
              ...prev.errors,
              { 
                username, 
                error: error instanceof Error ? error.message : 'Unknown error' 
              }
            ]
          }));
        }
      }

      setProgress(prev => ({ ...prev, currentUsername: '' }));
      setIsImporting(false);

    } catch (error) {
      console.error('Error processing CSV file:', error);
      alert('Error processing the CSV file. Please check the file format and try again.');
      setShowProgressModal(false);
      setIsImporting(false);
    }
  };

  // Handle file input change
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a CSV file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    await processFile(file);
    
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close progress modal
  const closeProgressModal = () => {
    if (!isImporting) {
      setShowProgressModal(false);
      setProgress({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        currentUsername: '',
        errors: []
      });
    }
  };

  // Calculate progress percentage
  const progressPercentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  return (
    <>
      {/* Import CSV Button */}
      <button
        onClick={handleFileSelect}
        disabled={disabled || isImporting}
        className={`flex items-center px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <Upload className="w-4 h-4 mr-2 text-gray-500" />
        {isImporting ? 'Importing...' : 'Import CSV'}
      </button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-gray-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Importing Influencers
                </h3>
              </div>
              {!isImporting && (
                <button
                  onClick={closeProgressModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span className="font-medium">Progress</span>
                <span className="font-semibold">{progress.processed} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Current Status */}
            {isImporting && progress.currentUsername && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3" />
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      Currently Processing
                    </div>
                    <div className="text-lg font-bold text-blue-700">
                      @{progress.currentUsername}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-green-800 mb-1">Successful</div>
                <div className="text-2xl font-bold text-green-600">
                  {progress.successful}
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-rose-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-sm font-medium text-red-800 mb-1">Failed</div>
                <div className="text-2xl font-bold text-red-600">
                  {progress.failed}
                </div>
              </div>
            </div>

            {/* Errors List */}
            {progress.errors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                  Failed Imports ({progress.errors.length})
                </h4>
                <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3 border border-gray-200">
                  {progress.errors.map((error, index) => (
                    <div key={index} className="text-xs text-gray-700 mb-2 last:mb-0 p-2 bg-white rounded border-l-2 border-red-300">
                      <span className="font-semibold text-red-600">@{error.username}:</span> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Message */}
            {!isImporting && progress.total > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                  <div>
                    <div className="font-semibold text-green-800">Import Complete!</div>
                    <div className="text-sm text-green-700">
                      {progress.successful} influencer(s) added successfully
                      {progress.failed > 0 && `, ${progress.failed} failed`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end">
              {!isImporting && (
                <button
                  onClick={closeProgressModal}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImportCsvButton;