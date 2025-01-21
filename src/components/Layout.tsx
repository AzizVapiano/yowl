import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, LogOut } from 'lucide-react';

export default function Layout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center px-2 py-2 text-gray-900 hover:text-gray-600">
                <span className="text-2xl font-bold">Y</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 text-gray-600 hover:text-gray-900">
                <Home size={24} />
              </Link>
              <Link to="/profile/me" className="p-2 text-gray-600 hover:text-gray-900">
                <User size={24} />
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}