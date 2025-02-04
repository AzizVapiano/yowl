import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, User, LogOut } from 'lucide-react';

export function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-blue-500">
                <img src="src/img/Y.png" alt="Y" className="w-8 h-8" />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link to="/" className="text-gray-700 hover:text-blue-500">
                    <Home className="w-6 h-6" />
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-500">
                    <User className="w-6 h-6" />
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-blue-500"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                >
                  Se connecter
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}