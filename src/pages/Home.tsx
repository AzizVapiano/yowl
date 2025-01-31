import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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

export function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTweets();
  }, []);

  async function fetchTweets() {
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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tweets:', error);
      return;
    }

    setTweets(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('tweets')
      .insert([
        { content: newTweet, user_id: user.id }
      ]);

    if (error) {
      console.error('Error creating tweet:', error);
      return;
    }

    setNewTweet('');
    fetchTweets();
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto py-8 px-4">
          {user && (
            <form onSubmit={handleSubmit} className="mb-8">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quoi de neuf ?"
                rows={3}
              />
              <button
                type="submit"
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
              >
                Tweeter
              </button>
            </form>
          )}

          <div className="space-y-4">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center mb-2">
                  <img
                    src={tweet.profiles.avatar_url || `https://ui-avatars.com/api/?name=${tweet.profiles.username}`}
                    alt={tweet.profiles.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <p className="font-bold">{tweet.profiles.display_name}</p>
                    <p className="text-gray-500">@{tweet.profiles.username}</p>
                  </div>
                </div>
                <p className="mb-2">{tweet.content}</p>
                <p className="text-gray-500 text-sm">
                  {format(new Date(tweet.created_at), 'PPp', { locale: fr })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}