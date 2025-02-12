import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { FiEdit2, FiTrash2, FiCheck, FiX, FiUpload } from 'react-icons/fi';
import Footer from './Footer';

interface Tweet {
  id: string;
  content: string;
  created_at: string;
  img_url?: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
    certif: boolean;};}

interface Profile {
  username: string;
  display_name: string;
  avatar_url: string;
  certif: boolean;}

const renderContent = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const segments: string[] = content.split(urlRegex);
  const matches: string[] = content.match(urlRegex) ?? [];

  return segments.map((segment, index) => {
    if (matches.includes(segment)) {return (
        <a key={index}
          href={segment}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 hover:underline">
          {segment} </a>);}
    return segment;});};

export function Profile() {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTweetId, setEditingTweetId] = useState<string | null>(null);
  const [editingTweetContent, setEditingTweetContent] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    display_name: '',
    avatar_url: ''});

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchUserTweets();}}, [user]);

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {setUploadingAvatar(true);
      const file = event.target.files?.[0];
      if (!file || !user) {
        console.error('Pas de fichier sélectionné ou utilisateur non connecté');
        return;}

      if (file.size > 2 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximum : 2MB');
        return;}

      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;}

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `photo/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from('upload')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false});

      if (uploadError) {
        console.error('Erreur d\'upload Supabase:', uploadError);
        alert('Erreur lors de l\'upload de l\'image');
        return;}

      const { data: publicUrlData } = await supabase.storage
        .from('upload')
        .getPublicUrl(filePath);
      if (!publicUrlData.publicUrl) {
        throw new Error('Impossible d\'obtenir l\'URL publique');}
      setEditForm(prev => ({
        ...prev,
        avatar_url: publicUrlData.publicUrl}));
      alert('Photo de profil mis à jour avec succès');} 
      catch (error) {
      console.error('Erreur détaillée lors de l\'upload:', error);
      alert('Une erreur est survenue lors de l\'upload de l\'image');} 
      finally {
      setUploadingAvatar(false);}}

  async function fetchProfile() {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('username, display_name, avatar_url, certif')
      .eq('id', user.id)
      .single();
    if (error) {console.error('Erreur lors de la récupération du profil!', error);
      return;}
    setProfile(data);
    setEditForm(data);}

  async function fetchUserTweets() {
    if (!user) return;
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching tweets:', error);
      return;}
    setTweets(data);}

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        username: editForm.username,
        display_name: editForm.display_name,
        avatar_url: editForm.avatar_url})
      .eq('id', user.id);
    if (error) {
      console.error('Error updating profile:', error);
      return;}
    setIsLoading(false);
    setIsEditing(false);
    await fetchProfile();}

  async function handleDeleteTweet(tweetId: string) {
    if (!user) return;
    const { error } = await supabase
      .from('tweets')
      .delete()
      .eq('id', tweetId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting tweet:', error);
      return;}
    await fetchUserTweets();}
  const startEditingTweet = (tweet: Tweet) => {
    setEditingTweetId(tweet.id);
    setEditingTweetContent(tweet.content);};
  const cancelEditingTweet = () => {
    setEditingTweetId(null);
    setEditingTweetContent('');};
  const handleUpdateTweet = async (tweetId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from('tweets')
      .update({ content: editingTweetContent })
      .eq('id', tweetId)
      .eq('user_id', user.id);
    if (error) {
      console.error('Error updating tweet:', error);
      return;}
    setEditingTweetId(null);
    setEditingTweetContent('');
    await fetchUserTweets();};
  if (!user || !profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;}
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto max-w-2xl px-4 py-8 flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {isEditing ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pseudo
                </label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo de profil
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={editForm.avatar_url || `https://ui-avatars.com/api/?name=${editForm.username}`}
                    alt="Avatar preview"
                    className="w-16 h-16 rounded-full"/>
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <FiUpload className="w-5 h-5 mr-2" />
                    <span>{uploadingAvatar ? 'Uploading...' : 'Changer votre photo de profil'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar} />
                  </label> </div> </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" >
                  Annuler </button>
                <button
                  type="submit"
                  disabled={isLoading || uploadingAvatar}
                  className={`px-4 py-2 rounded-lg text-white transition-all
                    ${(isLoading || uploadingAvatar)
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gray-500 hover:bg-gray-600 active:scale-95' }`} >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button> </div> </form> ) : (
            <div className="relative">
              <button
                onClick={() => setIsEditing(true)}
                className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors" >
                <FiEdit2 className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-4 mb-4"> <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}`}
                  alt={profile.username}
                  className="w-24 h-24 rounded-full" />
                <div>  <div className="flex items-center gap-1">
                    <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
                    {profile.certif && (
                      <img
                        src="/verif.png"
                        alt="Compte vérifié"
                        className="w-5 h-5"/> )}
                  </div>
                  <p className="text-gray-500">@{profile.username}</p>
                </div> </div> </div> )} </motion.div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Yowls</h2>
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <motion.div
              key={tweet.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start space-x-4">
                <img
                  src={tweet.profiles.avatar_url || `https://ui-avatars.com/api/?name=${tweet.profiles.username}`}
                  alt={tweet.profiles.username}
                  className="w-12 h-12 rounded-full" />
                <div className="flex-grow">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-gray-900">
                        {tweet.profiles.display_name}
                      </span>
                      {tweet.profiles.certif && (
                        <img
                          src="/verif.png"
                          alt="Compte vérifié"
                          className="w-5 h-5"/> )}
                    </div>
                    <span className="text-gray-500">@{tweet.profiles.username}</span>
                    <span className="text-gray-400">·</span>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(tweet.created_at), 'PPp', { locale: fr })} </span> </div>
                  {editingTweetId === tweet.id ? (
                    <div className="mt-2">
                      <textarea
                        value={editingTweetContent}
                        onChange={(e) => setEditingTweetContent(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3} />
                      <div className="flex justify-end space-x-2 mt-2">
                        <button
                          onClick={cancelEditingTweet}
                          className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors" >
                          <FiX className="w-5 h-5" />
                          <span>Annuler</span> </button>
                        <button
                          onClick={() => handleUpdateTweet(tweet.id)}
                          className="flex items-center space-x-1 text-green-500 hover:text-green-700 transition-colors" >
                          <FiCheck className="w-5 h-5" />
                          <span>Enregistrer</span> </button> </div> </div>  ) : (
                    <div className="mt-2">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {renderContent(tweet.content)} </p>
             {tweet.img_url && (
               <div className="mt-2">
                    <img
                    src={tweet.img_url}
                         alt="Tweet image"
                        className="rounded-lg max-h-96 w-full object-cover" /> </div> )} </div> )}
                  {editingTweetId !== tweet.id && (
                    <div className="flex justify-end mt-4 space-x-4">
                      <button
                        onClick={() => startEditingTweet(tweet)}
                        className="flex items-center space-x-2 text-blue-500 hover:text-blue-700 transition-colors"  >
                        <FiEdit2 className="w-5 h-5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTweet(tweet.id)}
                        className="flex items-center space-x-2 text-red-500 hover:text-red-700 transition-colors" >
                        <FiTrash2 className="w-5 h-5" />
                        <span>Supprimer</span>
                      </button> </div>)} </div> </div>  </motion.div> ))}
          {tweets.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Vous n'avez pas encore publié de tweets.  </div> )} </div> </div><Footer /> </div> );}