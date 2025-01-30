/*
  # Initial Schema Setup for Twitter Clone

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - References auth.users
      - `username` (text, unique)
      - `display_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
    - `tweets`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References profiles
      - `content` (text)
      - `created_at` (timestamp)
      - `likes_count` (integer)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create tweets table
CREATE TABLE tweets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    likes_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Tweets policies
CREATE POLICY "Tweets are viewable by everyone"
    ON tweets FOR SELECT
    USING (true);

CREATE POLICY "Users can insert own tweets"
    ON tweets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tweets"
    ON tweets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tweets"
    ON tweets FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
    ON profiles 
    FOR INSERT
    WITH CHECK (auth.uid() = id);
