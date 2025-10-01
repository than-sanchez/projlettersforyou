import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
           <Link to="/" title="Go to Homepage" className="font-serif text-2xl font-bold text-gray-900 inline-block">
            lettersforyou
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-sm mx-auto">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/terms" title="Read our Terms of Service" className="text-base text-gray-600 hover:text-gray-900">Terms</Link></li>
              <li><a href="#" title="Visit our Blog" className="text-base text-gray-600 hover:text-gray-900">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 tracking-wider uppercase">Interact</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="#" title="Follow us on Instagram" className="text-base text-gray-600 hover:text-gray-900">Instagram</a></li>
              <li><a href="#" title="Follow us on X (Twitter)" className="text-base text-gray-600 hover:text-gray-900">X (Twitter)</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-500">&copy; 2024 - 2025 lettersforyou</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
