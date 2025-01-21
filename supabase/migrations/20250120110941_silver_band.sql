/*
  # Schéma initial pour le réseau social Y

  1. Nouvelles Tables
    - `profiles`
      - `id` (uuid, clé primaire)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `created_at` (timestamp)
    - `posts`
      - `id` (uuid, clé primaire)
      - `author_id` (uuid, référence profiles)
      - `content` (text)
      - `created_at` (timestamp)
    - `likes`
      - `id` (uuid, clé primaire)
      - `post_id` (uuid, référence posts)
      - `user_id` (uuid, référence profiles)
      - `created_at` (timestamp)

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques de lecture/écriture appropriées
*/

-- Création de la table profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz DEFAULT now()
);

-- Création de la table posts
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Création de la table likes
CREATE TABLE likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Activation RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Les profiles sont visibles par tous" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent modifier leur profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour posts
CREATE POLICY "Les posts sont visibles par tous" ON posts
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent créer des posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs posts" ON posts
  FOR DELETE USING (auth.uid() = author_id);

-- Politiques pour likes
CREATE POLICY "Les likes sont visibles par tous" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Les utilisateurs peuvent liker des posts" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent unliker leurs likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);