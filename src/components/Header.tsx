import React, { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">ProctorAI</span>
            {isAdmin && <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">Admin</span>}
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            {!isAdmin && <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>}
            <Link to={isAdmin ? "/admin/assessments" : "/assessments"} className="text-gray-600 hover:text-blue-600">Assessments</Link>
            <Link to="/reports" className="text-gray-600 hover:text-blue-600">Reports</Link>
          </nav>

          <button
            className={`md:hidden p-2 rounded-lg hover:bg-gray-100 transition-transform duration-200 ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
            onClick={toggleMenu}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden ${
          isMenuOpen ? 'block' : 'hidden'
        } transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="bg-gray-50 py-2 px-4">
          {!isAdmin && (
            <Link to="/dashboard" className="block py-2 text-gray-600 hover:text-blue-600">
              Dashboard
            </Link>
          )}
          <Link to={isAdmin ? "/admin/assessments" : "/assessments"} className="block py-2 text-gray-600 hover:text-blue-600">
            Assessments
          </Link>
          <Link to="/reports" className="block py-2 text-gray-600 hover:text-blue-600">
            Reports
          </Link>
        </div>
      </div>
    </header>
  );
}
