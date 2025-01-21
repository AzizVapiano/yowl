import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { Heart } from 'lucide-react';

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
    if (!newPost.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .insert([{ content: newPost, author_id: user?.id }]);

      if (error) throw error;
      setNewPost('');
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  }

  async function toggleLike(postId: string) {
    const existingLike = posts
      .find(p => p.id === postId)
      ?.likes.some(like => like.user_id === user?.id);

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

    fetchPosts();
  }

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div className="space-y-6">
      <form onSubmit={createPost} className="space-y-4">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Post
        </button>
      </form>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                {post.profiles.avatar_url ? (
                  <img
                    src={post.profiles.avatar_url}
                    alt={post.profiles.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <span className="text-xl">{post.profiles.username[0].toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="font-medium">{post.profiles.username}</div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            <p className="text-gray-900 mb-4">{post.content}</p>
            <button
              onClick={() => toggleLike(post.id)}
              className={`flex items-center space-x-1 ${
                post.likes.some(like => like.user_id === user?.id)
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart size={20} />
              <span>{post.likes.length}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}