import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Footer from './Footer'; 

interface Tweet {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

interface Profile {
  username: string;
  display_name: string;
  avatar_url: string;
}

export function Profile() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    display_name: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserTweets();
    }
  }, [user]);

  async function fetchProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
    setEditForm(data);
  }

  async function fetchUserTweets() {
    if (!user) return;

    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tweets:', error);
      return;
    }

    setTweets(data);
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: editForm.username,
        display_name: editForm.display_name,
        avatar_url: editForm.avatar_url
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      return;
    }

    setIsLoading(false);
    setIsEditing(false);
    await fetchProfile();
  }

  async function handleDeleteTweet(tweetId: string) {
    if (!user) return;

    const { error } = await supabase
      .from('tweets')
      .delete()
      .eq('id', tweetId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting tweet:', error);
      return;
    }

    await fetchUserTweets();
  }

  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto max-w-2xl px-4 py-8 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          {!isEditing ? (
            <div className="relative">
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 p-2 text-gray-500 hover:text-blue-500 transition-colors"
              >
                <FiEdit2 className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4 mb-4">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}`}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pseudo
                </label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'avatar
                </label>
                <input
                  type="text"
                  value={editForm.avatar_url}
                  onChange={(e) => setEditForm({ ...editForm, avatar_url: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg text-white transition-all
                    ${isLoading
                      ? 'bg-blue-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                    }`}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        <h2 className="text-xl font-bold text-gray-900 mb-4">Mes tweets</h2>
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <motion.div
              key={tweet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={tweet.profiles.avatar_url || `https://ui-avatars.com/api/?name=${tweet.profiles.username}`}
                  alt={tweet.profiles.username}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900">
                      {tweet.profiles.display_name}
                    </span>
                    <span className="text-gray-500">@{tweet.profiles.username}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(tweet.created_at), 'PPp', { locale: fr })}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-900 whitespace-pre-wrap">{tweet.content}</p>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleDeleteTweet(tweet.id)}
                      className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {tweets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Vous n'avez pas encore publié de tweets.
            </div>
          )}
        </div>
      </div>

      <Footer /> {}
    </div>
  );
}
