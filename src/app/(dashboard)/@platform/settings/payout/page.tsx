// src/app/(dashboard)/@platform/settings/payout/page.tsx - UPDATED WITH FULL WIDTH
'use client';

import { useState, useEffect } from 'react';
import { withRoleAccess } from '@/components/auth/withRoleAccess';
import { CreditCard, DollarSign, Calendar, AlertCircle, CheckCircle, ArrowLeft } from 'react-feather';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

interface PayoutSettings {
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankName: string;
  accountHolderName: string;
  payoutMethod: 'bank_transfer' | 'paypal' | 'crypto';
  paypalEmail: string;
  cryptoWalletAddress: string;
  preferredPayoutSchedule: 'weekly' | 'biweekly' | 'monthly';
  minimumPayoutAmount: number;
  taxIdNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

function PayoutSettingsPage() {
  const [settings, setSettings] = useState<PayoutSettings>({
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankName: '',
    accountHolderName: '',
    payoutMethod: 'bank_transfer',
    paypalEmail: '',
    cryptoWalletAddress: '',
    preferredPayoutSchedule: 'monthly',
    minimumPayoutAmount: 100,
    taxIdNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [currentEarnings, setCurrentEarnings] = useState(245.50);
  const [nextPayoutDate, setNextPayoutDate] = useState('2024-02-15');

  const handleSave = async () => {
    setLoading(true);
    try {
      console.log('Saving payout settings:', settings);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error saving payout settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    setLoading(true);
    try {
      console.log('Verifying bank account...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsVerified(true);
    } catch (error) {
      console.error('Error verifying account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/settings" 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Payout Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your payment information and payout preferences
        </p>
      </div>

      {/* Current Earnings Overview - Full Width */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Earnings</p>
              <p className="text-2xl font-bold text-gray-900">${currentEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Next Payout</p>
              <p className="text-2xl font-bold text-gray-900">{nextPayoutDate}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            {isVerified ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-orange-600" />
            )}
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Account Status</p>
              <p className="text-lg font-bold text-gray-900">
                {isVerified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid Out</p>
              <p className="text-2xl font-bold text-gray-900">$1,247.80</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Payout Method Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payment Method</h2>
            <p className="text-gray-600 mt-1">Choose how you want to receive payments</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Payment Method
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="bank_transfer"
                    checked={settings.payoutMethod === 'bank_transfer'}
                    onChange={(e) => setSettings(prev => ({ ...prev, payoutMethod: e.target.value as any }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">Bank Transfer (ACH)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="paypal"
                    checked={settings.payoutMethod === 'paypal'}
                    onChange={(e) => setSettings(prev => ({ ...prev, payoutMethod: e.target.value as any }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">PayPal</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="crypto"
                    checked={settings.payoutMethod === 'crypto'}
                    onChange={(e) => setSettings(prev => ({ ...prev, payoutMethod: e.target.value as any }))}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm text-gray-700">Cryptocurrency</span>
                </label>
              </div>
            </div>

            {/* Bank Transfer Fields */}
            {settings.payoutMethod === 'bank_transfer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    value={settings.accountHolderName}
                    onChange={(e) => setSettings(prev => ({ ...prev, accountHolderName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Full name on bank account"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={settings.bankName}
                    onChange={(e) => setSettings(prev => ({ ...prev, bankName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Bank name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={settings.bankRoutingNumber}
                      onChange={(e) => setSettings(prev => ({ ...prev, bankRoutingNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Account number"
                    />
                  </div>
                </div>
                {!isVerified && (
                  <button
                    onClick={handleVerifyAccount}
                    disabled={loading}
                    className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? <LoadingSpinner size="sm" /> : 'Verify Bank Account'}
                  </button>
                )}
              </div>
            )}

            {/* PayPal Fields */}
            {settings.payoutMethod === 'paypal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PayPal Email
                </label>
                <input
                  type="email"
                  value={settings.paypalEmail}
                  onChange={(e) => setSettings(prev => ({ ...prev, paypalEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="paypal@example.com"
                />
              </div>
            )}

            {/* Crypto Fields */}
            {settings.payoutMethod === 'crypto' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cryptocurrency Wallet Address
                </label>
                <input
                  type="text"
                  value={settings.cryptoWalletAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, cryptoWalletAddress: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Wallet address for USDC payments"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We currently support USDC payments on Ethereum and Polygon networks
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payout Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Payout Preferences</h2>
            <p className="text-gray-600 mt-1">Configure when and how much to receive</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payout Schedule
              </label>
              <select
                value={settings.preferredPayoutSchedule}
                onChange={(e) => setSettings(prev => ({ ...prev, preferredPayoutSchedule: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Payout Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  value={settings.minimumPayoutAmount}
                  onChange={(e) => setSettings(prev => ({ ...prev, minimumPayoutAmount: parseFloat(e.target.value) }))}
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  min="50"
                  max="1000"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Minimum $50, Maximum $1000
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax ID Number (SSN/EIN)
              </label>
              <input
                type="text"
                value={settings.taxIdNumber}
                onChange={(e) => setSettings(prev => ({ ...prev, taxIdNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="XXX-XX-XXXX"
              />
              <p className="text-sm text-gray-500 mt-1">
                Required for tax reporting purposes
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading && <LoadingSpinner size="sm" />}
                <span className="ml-2">Save Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withRoleAccess(PayoutSettingsPage, {
  allowedRoles: ['platform_agent']
});