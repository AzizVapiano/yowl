import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Footer from './Footer'; 


export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptCgu, setAcceptCgu] = useState(false);
  const navigate = useNavigate();

  const isAtLeast18 = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 18;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        if (!acceptCgu) {
          throw new Error('Vous devez accepter les conditions générales d\'utilisation pour créer un compte.');
        }

        if (!isAtLeast18(dateOfBirth)) {
          throw new Error('Vous devez avoir au moins 18 ans pour créer un compte.');
        }

        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username,
              acceptedCgu: true,
              acceptedCguDate: new Date().toISOString(),
            },
          },
        });

        if (authError) throw authError;
      }

      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <div className="flex justify-center mb-6">
            <span className="text-black text-4xl font-bold w-12 h-12 flex items-center justify-center">
              Y
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Vous devez avoir au moins 18 ans pour créer un compte
                  </p>
                </div>
                <div className="mb-4">
                  <div className="flex items-start">
                    <input
                      type="checkbox"
                      checked={acceptCgu}
                      onChange={(e) => setAcceptCgu(e.target.checked)}
                      className="mt-1"
                      required
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      J'accepte les{' '}
                      <Link to="/Cgu" className="text-blue-500 hover:underline" target="_blank">
                        conditions générales d'utilisation
                      </Link>
                    </label>
                  </div>
                </div>
              </>
            )}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-600 disabled:opacity-50 mb-4"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-blue-500 text-sm hover:underline"
            >
              {isLogin ? 'Pas de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
            </button>
          </form>
        </div>
      </div>
      <Footer /> {}
    </div>
  );
}
