// ============================================
// 8. src/components/settings/layout/SettingsNavigation.tsx
// ============================================
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import { 
  User, Settings, DollarSign, Send, Bell, Shield, CreditCard, 
  Home, BarChart, Users, Monitor, List, Server, HelpCircle,
  Database, Award, MessageSquare
} from 'react-feather';

interface SettingsTab {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  roles: DetailedRole[];
}

export default function SettingsNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { getPrimaryRole } = useAuth();
  
  const primaryRole = getPrimaryRole() as DetailedRole;

  // Define all possible settings tabs with role-based access
  const allTabs: SettingsTab[] = [
    // Universal tabs (all users)
    {
      id: 'profile',
      name: 'Profile',
      href: '/settings/profile',
      icon: <User className="w-5 h-5" />,
      description: 'Personal information and account details',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer', 'platform_customer_support', 'platform_account_manager', 'platform_financial_manager', 'platform_content_moderator', 'platform_data_analyst', 'platform_operations_manager', 'platform_agent', 'b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager', 'b2c_campaign_executive', 'b2c_social_media_manager', 'b2c_content_creator', 'b2c_brand_manager', 'b2c_performance_analyst', 'b2c_finance_manager', 'b2c_account_coordinator', 'b2c_viewer', 'influencer', 'influencer_manager']
    },
    {
      id: 'security',
      name: 'Security',
      href: '/settings/security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Password, 2FA, and security settings',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer', 'platform_customer_support', 'platform_account_manager', 'platform_financial_manager', 'platform_content_moderator', 'platform_data_analyst', 'platform_operations_manager', 'platform_agent', 'b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager', 'b2c_campaign_executive', 'b2c_social_media_manager', 'b2c_content_creator', 'b2c_brand_manager', 'b2c_performance_analyst', 'b2c_finance_manager', 'b2c_account_coordinator', 'b2c_viewer', 'influencer', 'influencer_manager']
    },
    {
      id: 'notifications',
      name: 'Notifications',
      href: '/settings/notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Email and push notification preferences',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer', 'platform_customer_support', 'platform_account_manager', 'platform_financial_manager', 'platform_content_moderator', 'platform_data_analyst', 'platform_operations_manager', 'platform_agent', 'b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager', 'b2c_campaign_executive', 'b2c_social_media_manager', 'b2c_content_creator', 'b2c_brand_manager', 'b2c_performance_analyst', 'b2c_finance_manager', 'b2c_account_coordinator', 'b2c_viewer', 'influencer', 'influencer_manager']
    },
    
    // Platform Agent specific tabs
    {
      id: 'outreach',
      name: 'Outreach Tools',
      href: '/settings/outreach',
      icon: <Send className="w-5 h-5" />,
      description: 'Outreach management and automation settings',
      roles: ['platform_agent']
    },
    {
      id: 'assignments',
      name: 'Assignments',
      href: '/settings/assignments',
      icon: <List className="w-5 h-5" />,
      description: 'Assignment preferences and workload settings',
      roles: ['platform_agent']
    },
    
    // Platform Admin tabs
    {
      id: 'users',
      name: 'User Management',
      href: '/settings/users',
      icon: <Users className="w-5 h-5" />,
      description: 'Manage platform users and permissions',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager']
    },
    {
      id: 'monitoring',
      name: 'System Monitoring',
      href: '/settings/monitoring',
      icon: <Monitor className="w-5 h-5" />,
      description: 'System health and performance monitoring',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer']
    },
    {
      id: 'api',
      name: 'API Management',
      href: '/settings/api',
      icon: <Database className="w-5 h-5" />,
      description: 'API keys, webhooks, and integrations',
      roles: ['platform_super_admin', 'platform_admin', 'platform_developer']
    },
    {
      id: 'orders',
      name: 'Order Management',
      href: '/settings/orders', 
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Financial transactions and order processing',
      roles: ['platform_super_admin', 'platform_admin', 'platform_financial_manager']
    },
    
    // Company specific tabs
    {
      id: 'company',
      name: 'Company Settings',
      href: '/settings/company',
      icon: <Home className="w-5 h-5" />,
      description: 'Company profile and business information',
      roles: ['b2c_company_owner', 'b2c_company_admin']
    },
    {
      id: 'billing',
      name: 'Billing & Plans',
      href: '/settings/billing',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Subscription plans and billing information',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_finance_manager']
    },
    {
      id: 'campaigns',
      name: 'Campaign Settings',
      href: '/settings/campaigns',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Default campaign settings and preferences',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager']
    },
    {
      id: 'analytics',
      name: 'Analytics Settings',
      href: '/settings/analytics',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Analytics tracking and reporting preferences',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_performance_analyst']
    },
    
    // Influencer specific tabs
    {
      id: 'content-studio',
      name: 'Content Studio',
      href: '/settings/content-studio',
      icon: <Award className="w-5 h-5" />,
      description: 'Content creation and management tools',
      roles: ['influencer']
    },
    {
      id: 'audience-insights',
      name: 'Audience Insights',
      href: '/settings/audience-insights',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Audience analytics and insights',
      roles: ['influencer']
    }
  ];

  // Filter tabs based on user's role
  const availableTabs = allTabs.filter(tab => tab.roles.includes(primaryRole));

  const isActive = (href: string) => pathname === href;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and system configuration
        </p>
      </div>

      <div className="p-6">
        {/* Horizontal scrollable tabs */}
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => router.push(tab.href)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                isActive(tab.href)
                  ? 'bg-primary-100 text-primary-700 border border-primary-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}