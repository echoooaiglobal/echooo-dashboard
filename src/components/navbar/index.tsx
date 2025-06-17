// src/components/navbar/index.tsx - Fixed authentication flash
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Settings, LogOut, Bell, Menu, X } from 'react-feather';
import CampaignsDropdown from './CampaignsDropdown';
import { DetailedRole } from '@/types/auth';

export default function EnhancedNavbar() {
  const { isAuthenticated, user, logout, getPrimaryRole, getUserType, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const campaignsRef = useRef<HTMLDivElement>(null);

  const primaryRole = getPrimaryRole();
  const userType = getUserType();

  // Check if it's an auth page to hide navbar
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/reset-password');

  // Check if we're on the landing page
  const isLandingPage = pathname === '/';

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      
      if (campaignsRef.current && !campaignsRef.current.contains(event.target as Node)) {
        setIsCampaignsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle functions
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
    if (isCampaignsOpen) setIsCampaignsOpen(false);
  };

  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    if (isCampaignsOpen) setIsCampaignsOpen(false);
  };

  const toggleCampaigns = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCampaignsOpen(!isCampaignsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const closeCampaigns = () => setIsCampaignsOpen(false);

  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsMenuOpen(false);
    router.push('/login');
  };

  // Get role-specific navigation items
  const getDashboardNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard' }
    ];

    if (!primaryRole) return baseItems;

    switch (primaryRole) {
      case 'platform_admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/users' },
          { name: 'Companies', href: '/companies' },
          { name: 'Analytics', href: '/analytics' }
        ];
      
      case 'platform_agent':
        return [
          ...baseItems,
          // { name: 'Assigned Lists', href: '/assigned-lists' },
          // { name: 'Messages', href: '/messages' }
        ];
      
      case 'company_admin':
      case 'company_manager':
      case 'company_marketer':
        return [
          ...baseItems,
          // { name: 'Campaigns', href: '/campaigns' },
          // { name: 'Discover', href: '/discover' },
          // { name: 'Campaigns', href: '/campaigns' }
        ];
      
      default:
        return baseItems;
    }
  };

  const landingNavItems = [
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  const getRoleColor = (role: DetailedRole) => {
    if (role.startsWith('platform_')) return 'text-indigo-600';
    if (role.startsWith('company_')) return 'text-blue-600';
    if (role.startsWith('influencer')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getRoleSpecificNotifications = () => {
    const baseNotifications = [
      { title: 'System update available', time: '5 minutes ago', read: false, type: 'system' }
    ];

    if (!primaryRole) return baseNotifications;

    switch (primaryRole) {
      case 'platform_agent':
        return [
          { title: 'New list assignment received', time: '2 hours ago', read: false, type: 'assignment' },
          { title: 'Influencer responded to outreach', time: '4 hours ago', read: false, type: 'response' },
          ...baseNotifications
        ];
      
      case 'company_admin':
        return [
          { title: 'Campaign performance update', time: '1 hour ago', read: false, type: 'campaign' },
          { title: 'New influencer applications', time: '3 hours ago', read: false, type: 'application' },
          ...baseNotifications
        ];
      
      default:
        return baseNotifications;
    }
  };

  // If it's an auth page, return null (no navbar)
  if (isAuthPage) {
    return null;
  }

  // **KEY FIX**: Don't render navbar content while authentication is loading
  // This prevents the flash of unauthenticated content
  if (isLoading) {
    return (
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/echooo-logo.svg" 
                  alt="Echooo" 
                  width={120} 
                  height={30} 
                  className="h-8 w-auto" 
                />
              </Link>
            </div>
            {/* Show a minimal loading state */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // **KEY FIX**: Now determine navigation items based on final auth state
  const navItems = isAuthenticated ? getDashboardNavItems() : landingNavItems;

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isAuthenticated 
        ? 'bg-white shadow-md'
        : isLandingPage 
          ? 'bg-transparent' 
          : 'bg-white shadow-md'
    }`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/echooo-logo.svg" 
                  alt="Echooo" 
                  width={120} 
                  height={30} 
                  className="h-8 w-auto" 
                />
              </Link>
            </div>
            
            {/* Desktop navigation */}
            {/* <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? `border-${userType === 'platform' ? 'indigo' : userType === 'company' ? 'blue' : 'purple'}-500 text-gray-900`
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                >
                  {item.name}
                </Link>
              ))}
            </div> */}
          </div>

          {/* Right navigation */}
          <div className="flex items-center">
            {isAuthenticated ? (
              // Authenticated nav options
              <div className="hidden md:flex md:items-center md:space-x-4">
                {/* Campaigns Dropdown Component - only for company users */}
                {userType === 'company' && (
                  <div ref={campaignsRef}>
                    <CampaignsDropdown 
                      isOpen={isCampaignsOpen}
                      toggleDropdown={toggleCampaigns}
                      closeDropdown={closeCampaigns}
                    />
                  </div>
                )}

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="p-1 border-2 border-transparent text-gray-500 rounded-full hover:text-purple-600 focus:outline-none focus:text-purple-600 relative"
                  >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>

                  {/* Notifications dropdown */}
                  {isNotificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {getRoleSpecificNotifications().map((notification, i) => (
                          <a
                            key={i}
                            href="#"
                            className={`block px-4 py-3 hover:bg-gray-50 ${notification.read ? '' : 'bg-purple-50'}`}
                          >
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-purple-600'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </a>
                        ))}
                      </div>
                      <a 
                        href="#" 
                        className="block text-center text-sm font-medium text-purple-600 hover:text-purple-800 py-2 border-t border-gray-100"
                      >
                        View all notifications
                      </a>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="ml-3 relative" ref={profileRef}>
                  <div>
                    <button
                      onClick={toggleProfileMenu}
                      className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <span className="sr-only">Open user menu</span>
                      {user?.profile_image_url ? (
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={user.profile_image_url}
                          alt={user.full_name}
                          width={32}
                          height={32}
                        />
                      ) : (
                        <div className={`h-8 w-8 rounded-full bg-gradient-to-r ${
                          userType === 'platform' ? 'from-indigo-600 to-purple-600' :
                          userType === 'company' ? 'from-blue-600 to-purple-600' :
                          'from-purple-600 to-pink-600'
                        } flex items-center justify-center text-white font-medium`}>
                          {user?.full_name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </button>
                  </div>
                  
                  {/* Profile dropdown menu */}
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none z-10">
                      <div className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                        {primaryRole && (
                          <p className={`text-xs font-medium mt-1 ${getRoleColor(primaryRole)}`}>
                            {primaryRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User className="mr-3 h-5 w-5 text-gray-400" />
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400" />
                          Settings
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Unauthenticated nav options - show login/signup buttons
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isScrolled || !isLandingPage 
                      ? 'text-gray-800 hover:text-purple-600' 
                      : 'text-white hover:text-purple-200'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition duration-150 ease-in-out"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  isScrolled || !isLandingPage || isAuthenticated 
                    ? 'text-gray-400 hover:text-gray-500 hover:bg-gray-100' 
                    : 'text-white hover:text-gray-200 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500`}
              >
                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - simplified for space */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}