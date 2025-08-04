// src/components/dashboard/Sidebar.tsx - UPDATED VERSION (No icons when collapsed)
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { usePermissions } from '@/hooks/usePermissions';
import { DetailedRole } from '@/types/auth';
import {
  Home,
  Users,
  Briefcase,
  BarChart2,
  Settings,
  DollarSign,
  Calendar,
  Search,
  Award,
  FileText,
  Bell,
  Compass,
  Inbox,
  List,
  MessageSquare,
  Shield,
  Tool,
  HelpCircle,
  Send,
  Activity,
  TrendingUp,
  Server,
  CreditCard,
  UserCheck,
} from 'react-feather';

// Enhanced icon mapping
const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  BarChart2: <BarChart2 className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Award: <Award className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Bell: <Bell className="w-5 h-5" />,
  Compass: <Compass className="w-5 h-5" />,
  Inbox: <Inbox className="w-5 h-5" />,
  List: <List className="w-5 h-5" />,
  MessageSquare: <MessageSquare className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
  Tool: <Tool className="w-5 h-5" />,
  HelpCircle: <HelpCircle className="w-5 h-5" />,
  Send: <Send className="w-5 h-5" />,
  Activity: <Activity className="w-5 h-5" />,
  TrendingUp: <TrendingUp className="w-5 h-5" />,
  Server: <Server className="w-5 h-5" />,
  Bot: <Settings className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  UserCheck: <UserCheck className="w-5 h-5" />
};

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  requiredPermissions?: { resource: string; action: string }[];
}

interface SidebarProps {
  // No props needed - using context now
}

export default function Sidebar(props?: SidebarProps) {
  const pathname = usePathname();
  const { getPrimaryRole, getUserType } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const { canAccessResource } = usePermissions();

  const primaryRole = getPrimaryRole() as DetailedRole;
  const userType = getUserType();

  // Get navigation items based on role
  const getNavigationItems = (): NavigationItem[] => {
    const baseItems: NavigationItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: 'Home' }
    ];

    // Role-specific navigation based on your updated backend roles
    switch (primaryRole) {
      case 'platform_super_admin':
      case 'platform_admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/users', icon: 'Users', requiredPermissions: [{ resource: 'user', action: 'read' }] },
          { name: 'Companies', href: '/companies', icon: 'Briefcase', requiredPermissions: [{ resource: 'company', action: 'read' }] },
          { name: 'Agents', href: '/agents', icon: 'Bot', requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }] },
          { name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
          { name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] },
          { name: 'System', href: '/system', icon: 'Server', requiredPermissions: [{ resource: 'system', action: 'monitor' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      case 'platform_agent':
        return [
          ...baseItems,
          { name: 'Assigned Lists', href: '/assigned-lists', icon: 'List', requiredPermissions: [{ resource: 'assigned_influencer', action: 'read' }] },
          { name: 'Outreach', href: '/outreach', icon: 'Send', requiredPermissions: [{ resource: 'influencer_outreach', action: 'read' }] },
          { name: 'Contacts', href: '/contacts', icon: 'Users', requiredPermissions: [{ resource: 'influencer_contact', action: 'read' }] },
          { name: 'Automation', href: '/automation', icon: 'Bot', requiredPermissions: [{ resource: 'automation_session', action: 'read' }] },
          { name: 'Performance', href: '/performance', icon: 'TrendingUp', requiredPermissions: [{ resource: 'assignment_history', action: 'stats' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      case 'platform_operations_manager':
        return [
          ...baseItems,
          { name: 'Operations', href: '/operations', icon: 'Activity', requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }] },
          { name: 'Agents', href: '/agents', icon: 'Bot', requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }] },
          { name: 'Automation', href: '/automation', icon: 'Bot', requiredPermissions: [{ resource: 'automation_session', action: 'read' }] },
          { name: 'Performance', href: '/performance', icon: 'TrendingUp', requiredPermissions: [{ resource: 'report', action: 'agent_performance' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      case 'platform_manager':
        return [
          ...baseItems,
          { name: 'Teams', href: '/teams', icon: 'Users', requiredPermissions: [{ resource: 'user', action: 'read' }] },
          { name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
          { name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] },
          { name: 'Reports', href: '/reports', icon: 'FileText', requiredPermissions: [{ resource: 'report', action: 'campaign_performance' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      // Company roles
      case 'b2c_company_owner':
      case 'b2c_company_admin':
      case 'b2c_marketing_director':
        return [
          ...baseItems,
          { name: 'Discover', href: '/discover', icon: 'Compass', requiredPermissions: [{ resource: 'influencer', action: 'read' }] },
          { name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
          { name: 'Influencers', href: '/influencers', icon: 'Users', requiredPermissions: [{ resource: 'influencer', action: 'read' }] },
          { name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      case 'b2c_campaign_manager':
      case 'b2c_campaign_executive':
        return [
          ...baseItems,
          { name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
          { name: 'Influencers', href: '/influencers', icon: 'Users', requiredPermissions: [{ resource: 'influencer', action: 'read' }] },
          { name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      // Influencer roles
      case 'influencer':
        return [
          ...baseItems,
          { name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
          { name: 'Profile', href: '/profile', icon: 'Users', requiredPermissions: [{ resource: 'social_account', action: 'read' }] },
          { name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'profile_analytics', action: 'read' }] },
          { name: 'Payments', href: '/payments', icon: 'DollarSign', requiredPermissions: [{ resource: 'order', action: 'read' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      case 'influencer_manager':
        return [
          ...baseItems,
          { name: 'Influencers', href: '/influencers', icon: 'Users', requiredPermissions: [{ resource: 'influencer', action: 'read' }] },
          { name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
          { name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] },
          { name: 'Settings', href: '/settings', icon: 'Settings' }
        ];
      
      default:
        return baseItems;
    }
  };

  // Filter navigation items based on permissions
  const navigationItems = getNavigationItems().filter(item => {
    if (item.requiredPermissions) {
      return item.requiredPermissions.every(permission =>
        canAccessResource(permission.resource, permission.action)
      );
    }
    return true;
  });

  // Get style for active links
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  if (!primaryRole || !userType) {
    return null;
  }

  // REMOVED: The collapsed state toggle button - this is now handled by navbar
  // When collapsed, return null (don't show anything)
  if (isSidebarCollapsed) {
    return null;
  }

  // When expanded, show full sidebar
  return (
    <>
      {/* Sidebar */}
      <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 flex flex-col shadow-lg">
        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors group ${
                isActive(item.href)
                  ? userType === 'platform' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : userType === 'company'
                      ? 'bg-blue-50 text-blue-700'
                      : 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className={`${
                isActive(item.href)
                  ? userType === 'platform' 
                    ? 'text-indigo-500' 
                    : userType === 'company'
                      ? 'text-blue-500'
                      : 'text-purple-500'
                  : 'text-gray-500 group-hover:text-gray-700'
              }`}>
                {iconMap[item.icon] || <Home className="w-5 h-5" />}
              </span>
              <span className="ml-3">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom section - just notifications */}
        <div className="border-t border-gray-200 p-4">
          <Link
            href="/notifications"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="ml-3">Notifications</span>
          </Link>
        </div>
      </aside>
    </>
  );
}