// ============================================
// 2. src/components/settings/shared/SecuritySettings.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SettingsCard from './SettingsCard';
import { Shield, Key, Smartphone, Clock, AlertTriangle, Check } from 'react-feather';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    loadSecuritySettings();
    loadActiveSessions();
  }, []);

  useEffect(() => {
    calculatePasswordStrength();
  }, [newPassword]);

  const loadSecuritySettings = async () => {
    try {
      const response = await fetch('/api/settings/security');
      if (response.ok) {
        const data = await response.json();
        setTwoFactorEnabled(data.two_factor_enabled || false);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  const calculatePasswordStrength = () => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        })
      });

      if (!response.ok) throw new Error('Failed to change password');

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      try {
        const response = await fetch('/api/settings/2fa', {
          method: 'DELETE'
        });
        if (response.ok) {
          setTwoFactorEnabled(false);
        }
      } catch (error) {
        console.error('Error disabling 2FA:', error);
      }
    } else {
      // Enable 2FA - show QR code
      setShowQRCode(true);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadActiveSessions();
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'text-red-500' };
      case 2:
        return { text: 'Fair', color: 'text-yellow-500' };
      case 3:
        return { text: 'Good', color: 'text-blue-500' };
      case 4:
      case 5:
        return { text: 'Strong', color: 'text-green-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const strengthInfo = getPasswordStrengthText();

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <SettingsCard
        title="Change Password"
        description="Update your account password to keep your account secure"
        icon={<Key className="w-5 h-5" />}
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        passwordStrength <= 1 ? 'bg-red-500' :
                        passwordStrength === 2 ? 'bg-yellow-500' :
                        passwordStrength === 3 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || newPassword !== confirmPassword || !newPassword}
            className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? 'Changing Password...' : 'Change Password'}
          </button>
        </form>
      </SettingsCard>

      {/* Two-Factor Authentication */}
      <SettingsCard
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        icon={<Shield className="w-5 h-5" />}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                Authenticator App
              </span>
              {twoFactorEnabled && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {twoFactorEnabled 
                ? 'Two-factor authentication is enabled for your account'
                : 'Use an authenticator app to generate verification codes'
              }
            </p>
          </div>
          <button
            onClick={handleToggle2FA}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              twoFactorEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>

        {showQRCode && !twoFactorEnabled && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Setup Two-Factor Authentication</h4>
            <p className="text-sm text-gray-600 mb-4">
              Scan this QR code with your authenticator app, then enter the verification code below.
            </p>
            {/* QR Code would be displayed here */}
            <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-500">QR Code</span>
            </div>
            <div className="flex space-x-3">
              <input
                type="text"
                placeholder="Enter verification code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                Verify
              </button>
            </div>
          </div>
        )}
      </SettingsCard>

      {/* Active Sessions */}
      <SettingsCard
        title="Active Sessions"
        description="Manage your active login sessions across devices"
        icon={<Clock className="w-5 h-5" />}
      >
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-sm">No active sessions found.</p>
          ) : (
            sessions.map((session: any, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {session.device || 'Unknown Device'}
                    </span>
                    {session.is_current && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {session.location || 'Unknown Location'} • Last active: {session.last_active || 'Unknown'}
                  </p>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => handleTerminateSession(session.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Terminate
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </SettingsCard>
    </div>
  );
}