// src/components/dashboard/RoleBasedSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import { getNavigationItemsForRole } from '@/utils/role-utils';
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
  Menu,
  X,
  List,
  MessageSquare,
  Shield,
  Tool,
  HelpCircle
} from 'react-feather';

// Icon mapping for navigation items
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
  HelpCircle: <HelpCircle className="w-5 h-5" />
};

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
}

export default function RoleBasedSidebar() {
  const pathname = usePathname();
  const { user, getPrimaryRole, getUserType } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>([]);

  const primaryRole = getPrimaryRole();
  const userType = getUserType();

  // Update navigation items when role changes
  useEffect(() => {
    if (primaryRole) {
      const items = getNavigationItemsForRole(primaryRole);
      setNavigationItems(items);
    }
  }, [primaryRole]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Get style for active links
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  // Get role display information
  const getRoleDisplayInfo = (role: DetailedRole) => {
    const roleMap: Record<DetailedRole, { label: string; color: string }> = {
      // Platform roles
      platform_admin: { label: 'Platform Admin', color: 'bg-red-600' },
      platform_manager: { label: 'Platform Manager', color: 'bg-indigo-600' },
      platform_user: { label: 'Platform User', color: 'bg-indigo-500' },
      platform_accountant: { label: 'Platform Accountant', color: 'bg-green-600' },
      platform_developer: { label: 'Platform Developer', color: 'bg-purple-600' },
      platform_customer_support: { label: 'Customer Support', color: 'bg-blue-600' },
      platform_content_moderator: { label: 'Content Moderator', color: 'bg-orange-600' },
      platform_agent: { label: 'Platform Agent', color: 'bg-teal-600' },
      
      // Company roles
      company_admin: { label: 'Company Admin', color: 'bg-blue-600' },
      company_manager: { label: 'Company Manager', color: 'bg-blue-500' },
      company_user: { label: 'Company User', color: 'bg-blue-400' },
      company_accountant: { label: 'Company Accountant', color: 'bg-green-500' },
      company_marketer: { label: 'Company Marketer', color: 'bg-pink-500' },
      company_content_creator: { label: 'Content Creator', color: 'bg-purple-500' },
      
      // Influencer roles
      influencer: { label: 'Influencer', color: 'bg-purple-600' },
      influencer_manager: { label: 'Influencer Manager', color: 'bg-purple-500' },
    };

    return roleMap[role] || { label: 'User', color: 'bg-gray-600' };
  };

  if (!primaryRole || !userType) {
    return null;
  }

  const roleInfo = getRoleDisplayInfo(primaryRole);

  return (
    <>
      {/* Mobile toggle button - visible on small screens */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 left-4 z-20 bg-white p-2 rounded-md shadow-md border border-gray-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar - different styling for mobile vs desktop */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static inset-y-0 left-0 transform lg:translate-x-0 transition duration-200 ease-in-out z-10 w-64 bg-white border-r border-gray-200 pt-16 h-screen`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Sidebar header */}
          <div className="px-4 py-5 flex justify-center">
            <Image 
              src="/echooo-logo.svg" 
              alt="Echooo" 
              width={130} 
              height={40} 
              className="h-8 w-auto" 
            />
          </div>

          {/* Role indicator */}
          <div className={`mx-4 mb-4 px-3 py-2 rounded-md text-white text-center text-sm ${roleInfo.color}`}>
            {roleInfo.label}
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? userType === 'platform' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : userType === 'company'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (isOpen) setIsOpen(false);
                }}
              >
                <span className={`${
                  isActive(item.href)
                    ? userType === 'platform' 
                      ? 'text-indigo-500' 
                      : userType === 'company'
                        ? 'text-blue-500'
                        : 'text-purple-500'
                    : 'text-gray-500'
                }`}>
                  {iconMap[item.icon] || <Home className="w-5 h-5" />}
                </span>
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Role-specific quick actions */}
          {primaryRole === 'platform_agent' && (
            <div className="px-2 py-4 space-y-1 border-t border-gray-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Quick Actions
              </div>
              <Link
                href="/quick-contact"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm">Quick Contact</span>
              </Link>
              <Link
                href="/bulk-update"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <List className="w-4 h-4 text-gray-500 mr-3" />
                <span className="text-sm">Bulk Update</span>
              </Link>
            </div>
          )}

          {/* Bottom section with universal links */}
          <div className="px-2 py-4 space-y-1 border-t border-gray-200">
            <Link
              href="/notifications"
              className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="ml-3">Notifications</span>
            </Link>

            <Link
              href="/help"
              className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-500" />
              <span className="ml-3">Help & Support</span>
            </Link>
          </div>

          {/* User info at bottom */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {user?.profile_image_url ? (
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={user.profile_image_url}
                    alt={user.full_name}
                    width={32}
                    height={32}
                  />
                ) : (
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-medium text-sm ${roleInfo.color}`}>
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-0 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}