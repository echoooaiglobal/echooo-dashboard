'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InfluencerForm from '@/components/forms/Influencer/InfluencerForm';
import InfluencerBulkForm from '@/components/forms/Influencer/InfluencerBulkForm';
import Button from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUserPlus, FiUploadCloud, FiArrowLeft } from 'react-icons/fi';

export default function CreateInfluencerPage() {
  // Get the router object from Next.js
  const router = useRouter();
  // State to show or hide the bulk import form
  const [showBulkImport, setShowBulkImport] = useState(false);

  // Function to handle successful form submission
  const handleSuccess = () => {
    // Redirect to the influencers page
    router.push('/influencers');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        ease: "easeOut",
        duration: 0.3
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header with back button */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center mb-8"
        >
          <motion.div variants={itemVariants}>
            <Button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-full p-2 shadow-sm"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          <motion.h1 
            variants={itemVariants}
            className="text-3xl font-bold text-gray-900 ml-4"
          >
            {showBulkImport ? 'Bulk Import Influencers' : 'Create Influencer'}
          </motion.h1>
        </motion.div>

        {/* Main content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">
            {!showBulkImport ? (
              <motion.div
                key="individual"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 sm:p-8"
              >
                <InfluencerForm onSuccess={handleSuccess} />
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 pt-6 border-t border-gray-100"
                >
                  <div className="text-center mb-4">
                    <p className="text-gray-500">Need to add multiple influencers?</p>
                  </div>
                  <Button 
                    onClick={() => setShowBulkImport(true)} 
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <FiUploadCloud className="h-5 w-5" />
                    Import Influencers in Bulk
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="bulk"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 sm:p-8"
              >
                <InfluencerBulkForm onSuccess={handleSuccess} />
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 pt-6 border-t border-gray-100"
                >
                  <Button 
                    onClick={() => setShowBulkImport(false)} 
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg shadow-sm hover:shadow transition-all duration-300"
                  >
                    <FiUserPlus className="h-5 w-5" />
                    Back to Individual Creation
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Responsive adjustments */}
        <style jsx global>{`
          @media (max-width: 640px) {
            .form-container {
              padding: 1.5rem;
            }
            .form-input {
              padding: 0.75rem;
            }
          }
        `}</style>
      </div>
    </motion.div>
  );
}