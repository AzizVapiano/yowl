import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import { FiImage } from 'react-icons/fi';

const CookiePopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setIsVisible(false);
  };

  return (
    isVisible && (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-auto md:w-96 bg-black text-white p-4 rounded-lg shadow-lg z-50">
        <p className="text-sm">
          Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous acceptez notre{' '}
          <Link to="/Cgu" className="text-blue-400 hover:text-blue-600">
            politique de confidentialité
          </Link>.
        </p>
        <div className="flex justify-between mt-2">
          <button onClick={handleAccept} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
            Accepter
          </button>
          <button onClick={handleDecline} className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-lg">
            Refuser
          </button>
        </div>
      </div>
    )
  );
};

interface Tweet {
  id: string;
  content: string;
  created_at: string;
  img_url?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    certif: boolean;
  };
}

const renderContent = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = (content.match(urlRegex) || []) as string[];
  const segments = content.split(urlRegex);

  return segments.map((segment, index) => {
    if (matches.includes(segment)) {
      return (
        <a
          key={index}
          href={segment}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 hover:underline"
        >
          {segment}
        </a>
      );
    }
    return segment;
  });
};

export function Home() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [newTweet, setNewTweet] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchTweets();
  }, []);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploadingImage(true);
      const file = event.target.files?.[0];
      
      if (!file || !user) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Maximum: 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `tweets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('upload')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('upload')
        .getPublicUrl(filePath);

      setSelectedImage(data.publicUrl);

    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
    } finally {
      setUploadingImage(false);
    }
  }

  async function fetchTweets() {
    const { data, error } = await supabase
      .from('tweets')
      .select(`
        *,
        profiles (
          username,
          display_name,
          avatar_url,
          certif
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
        { 
          content: newTweet, 
          user_id: user.id,
          img_url: selectedImage 
        }
      ]);

    if (error) {
      console.error('Error creating tweet:', error);
      return;
    }

    setNewTweet('');
    setSelectedImage(null);
    fetchTweets();
  }

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <div className="max-w-2xl mx-auto py-8 px-4">
          {user && (
            <form onSubmit={handleSubmit} className="mb-8">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                className="w-full p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-600"
                placeholder="Dites-nous tout..."
                rows={3}
              />
              {selectedImage && (
                <div className="relative mt-2">
                  <img 
                    src={selectedImage} 
                    alt="Selected" 
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 cursor-pointer">
                  <FiImage className="w-5 h-5 mr-2" />
                  <span>{uploadingImage ? 'Uploading...' : 'Ajouter une image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-600"
                  disabled={uploadingImage}
                >
                  Yowler
                </button>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {tweets.map((tweet) => (
              <motion.div
                key={tweet.id}
                className="bg-white p-4 rounded-lg shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <div className="flex items-center mb-2">
                  <img
                    src={tweet.profiles.avatar_url || `https://ui-avatars.com/api/?name=${tweet.profiles.username}`}
                    alt={tweet.profiles.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="flex items-center">
                      <p className="font-bold">{tweet.profiles.display_name}</p>
                      {tweet.profiles.certif && (
                        <img
                          src="./verif.png"
                          alt="Compte vérifié"
                          className="w-5 h-5 ml-1"
                        />
                      )}
                    </div>
                    <p className="text-gray-500">@{tweet.profiles.username}</p>
                  </div>
                </div>
                <p className="mb-2">{renderContent(tweet.content)}</p>
                {tweet.img_url && (
                  <img
                    src={tweet.img_url}
                    alt="Tweet image"
                    className="w-full h-auto rounded-lg mb-2"
                  />
                )}
                <p className="text-gray-500 text-sm">
                  {format(new Date(tweet.created_at), 'PPp', { locale: fr })}
                </p>
              </motion.div>
            ))}
            {tweets.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Aucun tweet pour le moment
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <CookiePopup />
    </div>
  );
}