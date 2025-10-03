
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BurgerIcon } from './icons/BurgerIcon';
import { CloseIcon } from './icons/CloseIcon';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu on route change
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Prevent scrolling when mobile menu is open
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  const activeLinkClass = "bg-gray-900 text-white";
  const inactiveLinkClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900";
  const linkBaseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200";

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <NavLink to="/" title="Go to Homepage" className="font-serif text-2xl font-bold text-gray-900">
                lettersforyou
              </NavLink>
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                <NavLink 
                  to="/write" 
                  title="Write a letter"
                  className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                  Write
                </NavLink>
                <NavLink 
                  to="/browse" 
                  title="Read stories"
                  className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                  Browse
                </NavLink>
                 <NavLink 
                  to="/history" 
                  title="View your sent letters"
                  className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                  History
                </NavLink>
                <NavLink 
                  to="/blog" 
                  title="Read blog posts"
                  className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                  Blog
                </NavLink>
                <NavLink 
                  to="/donate" 
                  title="Support the project"
                  className={({ isActive }) => `${linkBaseClass} ${isActive ? activeLinkClass : inactiveLinkClass}`}
                >
                  Donation
                </NavLink>
              </div>
            </nav>
            {/* Mobile Burger Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open main menu"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
              >
                <BurgerIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-white transition-opacity duration-300 ease-in-out ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                 <div className="flex-shrink-0">
                    <NavLink to="/" title="Go to Homepage" className="font-serif text-2xl font-bold text-gray-900">
                        lettersforyou
                    </NavLink>
                 </div>
                 <div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-label="Close main menu"
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-500"
                    >
                        <CloseIcon className="h-6 w-6" />
                    </button>
                 </div>
            </div>
            <nav className="flex flex-col items-center justify-center space-y-8 mt-24">
                 <NavLink 
                    to="/write" 
                    title="Write a letter"
                    className="text-3xl font-serif text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Write
                  </NavLink>
                  <NavLink 
                    to="/browse" 
                    title="Read stories"
                    className="text-3xl font-serif text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Browse
                  </NavLink>
                   <NavLink 
                    to="/history" 
                    title="View your sent letters"
                    className="text-3xl font-serif text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    History
                  </NavLink>
                  <NavLink 
                    to="/blog" 
                    title="Read blog posts"
                    className="text-3xl font-serif text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Blog
                  </NavLink>
                  <NavLink 
                    to="/donate" 
                    title="Support the project"
                    className="text-3xl font-serif text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Donation
                  </NavLink>
            </nav>
        </div>
      </div>
    </>
  );
};

export default Header;
