// src/components/navbar/index.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Settings, LogOut, Bell, Menu, X } from 'react-feather';
import CampaignsDropdown from './CampaignsDropdown';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
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
      // Handle profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      
      // Handle notifications dropdown
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      
      // Handle campaigns dropdown
      if (campaignsRef.current && !campaignsRef.current.contains(event.target as Node)) {
        setIsCampaignsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Toggle profile dropdown
  const toggleProfileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsProfileMenuOpen(!isProfileMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
    if (isCampaignsOpen) setIsCampaignsOpen(false);
  };

  // Toggle notifications dropdown
  const toggleNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    if (isCampaignsOpen) setIsCampaignsOpen(false);
  };

  // Toggle campaigns dropdown
  const toggleCampaigns = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCampaignsOpen(!isCampaignsOpen);
    if (isProfileMenuOpen) setIsProfileMenuOpen(false);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  // Close campaigns dropdown
  const closeCampaigns = () => {
    setIsCampaignsOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setIsProfileMenuOpen(false);
    setIsNotificationsOpen(false);
    setIsMenuOpen(false);
    router.push('/login');
  };

  // List of navigation items for dashboard
  const dashboardNavItems = [
    { name: 'Dashboard', href: '/dashboard' },
    // { name: 'Discover', href: '/discover' },
    // { name: 'Influencers', href: '/influencers' },
    // { name: 'Clients', href: '/clients' },
    // { name: 'Analytics', href: '/analytics' },
  ];

  // List of navigation items for landing page
  const landingNavItems = [
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  // Determine which navigation items to show
  const navItems = isAuthenticated ? dashboardNavItems : landingNavItems;

  // If it's an auth page, return null (no navbar)
  if (isAuthPage) {
    return null;
  }

  // Render different navbar styling based on authenticated state and page
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
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href
                      ? 'border-purple-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right navigation: campaigns dropdown, notifications, profile */}
          <div className="flex items-center">
            {isAuthenticated ? (
              // Authenticated nav options
              <div className="hidden md:flex md:items-center md:space-x-4">
                {/* Campaigns Dropdown Component */}
                <div ref={campaignsRef}>
                  <CampaignsDropdown 
                    isOpen={isCampaignsOpen}
                    toggleDropdown={toggleCampaigns}
                    closeDropdown={closeCampaigns}
                  />
                </div>

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
                        {[
                          { title: 'New campaign request', time: '1 hour ago', read: false },
                          { title: 'Sarah accepted your invitation', time: '2 hours ago', read: false },
                          { title: 'Your campaign is live', time: 'Yesterday', read: true },
                          { title: 'Monthly report ready', time: '3 days ago', read: true }
                        ].map((notification, i) => (
                          <a
                            key={i}
                            href="#"
                            className={`block px-4 py-3 hover:bg-gray-50 ${notification.read ? '' : 'bg-purple-50'}`}
                          >
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-purple-600'}`}>{notification.title}</p>
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
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-medium">
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

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-purple-50 border-purple-500 text-purple-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        {isAuthenticated ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                {user?.profile_image_url ? (
                  <Image
                    className="h-10 w-10 rounded-full"
                    src={user.profile_image_url}
                    alt={user.full_name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-medium">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.full_name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Your Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Settings
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-4 px-4">
              <Link
                href="/login"
                className="block text-center w-full px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="block text-center w-full px-4 py-2 text-base font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}