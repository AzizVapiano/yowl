import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Heart, MessageCircle, Repeat2, Share, Image, Smile, Calendar, MapPin } from 'lucide-react';

interface Post {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
  likes: {
    user_id: string;
  }[];
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (username, avatar_url),
          likes (user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function createPost(e: React.FormEvent) {
    e.preventDefault();
    if (!newPost.trim() || isPosting) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ content: newPost, author_id: user?.id }]);

      if (error) throw error;
      setNewPost('');
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  }

  async function toggleLike(postId: string) {
    const existingLike = posts
      .find(p => p.id === postId)
      ?.likes.some(like => like.user_id === user?.id);

    // Optimistic update
    setPosts(currentPosts => 
      currentPosts.map(post => {
        if (post.id === postId) {
          const newLikes = existingLike
            ? post.likes.filter(like => like.user_id !== user?.id)
            : [...post.likes, { user_id: user?.id as string }];
          return { ...post, likes: newLikes };
        }
        return post;
      })
    );

    try {
      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .match({ post_id: postId, user_id: user?.id });
      } else {
        await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: user?.id }]);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert on error
      fetchPosts();
    }
  }

  if (loading) {
    return <div className="text-gray-400">Chargement des posts...</div>;
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-zinc-900 rounded-xl p-4 mb-6">
        <form onSubmit={createPost}>
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              <span className="text-xl text-white">
                {user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Quoi de neuf ?"
                className="w-full bg-transparent text-lg text-white placeholder-gray-500 focus:outline-none resize-none mb-4"
                rows={3}
              />
              <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
                <div className="flex gap-4 text-blue-400">
                  <button type="button" className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-500/10">
                    <Image size={20} />
                  </button>
                  <button type="button" className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-500/10">
                    <Smile size={20} />
                  </button>
                  <button type="button" className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-500/10">
                    <Calendar size={20} />
                  </button>
                  <button type="button" className="hover:text-blue-300 transition-colors p-2 rounded-full hover:bg-blue-500/10">
                    <MapPin size={20} />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!newPost.trim() || isPosting}
                  className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPosting ? 'Publication...' : 'Publier'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="tweet-card">
            <div className="tweet-header">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {post.profiles.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl text-white">
                    {post.profiles.username[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="tweet-user">
                  <span className="tweet-username">{post.profiles.username}</span>
                  <span className="tweet-handle">@{post.profiles.username}</span>
                  <span className="tweet-time" title={new Date(post.created_at).toLocaleString()}>
                    · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <p className="tweet-content">{post.content}</p>
                <div className="tweet-actions">
                  <button className="flex items-center gap-2 hover:text-blue-400 group transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                      <MessageCircle size={18} />
                    </div>
                    <span>0</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-green-400 group transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-green-500/10">
                      <Repeat2 size={18} />
                    </div>
                    <span>0</span>
                  </button>
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-2 group transition-colors ${
                      post.likes.some(like => like.user_id === user?.id)
                        ? 'text-red-500 hover:text-red-400'
                        : 'hover:text-red-400'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      post.likes.some(like => like.user_id === user?.id)
                        ? 'group-hover:bg-red-500/10'
                        : 'group-hover:bg-red-500/10'
                    }`}>
                      <Heart size={18} className={
                        post.likes.some(like => like.user_id === user?.id)
                          ? 'fill-current'
                          : ''
                      } />
                    </div>
                    <span>{post.likes.length}</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-blue-400 group transition-colors">
                    <div className="p-2 rounded-full group-hover:bg-blue-500/10">
                      <Share size={18} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}