<<<<<<< HEAD
import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Twitter, Home, User, LogOut } from 'lucide-react';
=======
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, User, LogOut } from 'lucide-react';
>>>>>>> quentin

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
<<<<<<< HEAD
              <Link to="/" className="text-blue-500">
                <Twitter className="w-8 h-8" />
=======
              <Link to="/" className="text-black-500 text-4xl font-bold">
                Y
>>>>>>> quentin
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
<<<<<<< HEAD
                  <Link to="/" className="text-gray-700 hover:text-blue-500">
                    <Home className="w-6 h-6" />
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-500">
=======
                  <Link to="/" className="text-gray-700 hover:text-gray-500">
                    <Home className="w-6 h-6" />
                  </Link>
                  <Link to="/profile" className="text-gray-700 hover:text-gray-500">
>>>>>>> quentin
                    <User className="w-6 h-6" />
                  </Link>
                  <button
                    onClick={handleLogout}
<<<<<<< HEAD
                    className="text-gray-700 hover:text-blue-500"
=======
                    className="text-gray-700 hover:text-gray-500"
>>>>>>> quentin
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
<<<<<<< HEAD
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
=======
                  className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-600"
>>>>>>> quentin
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