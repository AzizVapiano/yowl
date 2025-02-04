import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Section {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
}

const TermsOfService = () => {
  const [lastUpdate] = useState('31 janvier 2025');
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([
    {
      title: "1. Acceptation des conditions",
      content: "En créant un compte sur Y et en utilisant nos services, vous acceptez les présentes conditions d'utilisation ainsi que notre politique de confidentialité.",
      isOpen: false
    },
    {
      title: "2. Données collectées",
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Adresse e-mail</li>
          <li>Mot de passe (chiffré)</li>
          <li>Nom d'utilisateur</li>
          <li>Date de naissance</li>
        </ul>
      ),
      isOpen: false
    },
    {
      title: "3. Sécurité et confidentialité",
      content: "Nous mettons en œuvre des mesures de sécurité avancées pour protéger vos données. Votre mot de passe est stocké de manière chiffrée et nous ne partageons jamais vos informations avec des tiers sans votre consentement explicite.",
      isOpen: false
    },
    {
      title: "4. Responsabilités de l'utilisateur",
      content: (
        <ul className="list-disc pl-6 space-y-2">
          <li>Fournir des informations exactes et à jour lors de votre inscription.</li>
          <li>Ne pas partager votre compte avec des tiers.</li>
          <li>Respecter les droits et la vie privée des autres utilisateurs.</li>
          <li>Ne pas publier de contenu illégal, offensant ou contraire à l'éthique.</li>
        </ul>
      ),
      isOpen: false
    },
    {
      title: "5. Droits et propriété intellectuelle",
      content: "Tout contenu publié par un utilisateur sur Y en reste sa propriété.",
      isOpen: false
    },
    {
      title: "6. Modification des conditions",
      content: "Nous nous réservons le droit de modifier ces conditions à tout moment. Toute modification sera communiquée aux utilisateurs et entrera en vigueur immédiatement après sa publication.",
      isOpen: false
    },
  ]);

  const toggleSection = (index: number) => {
    setSections(prevSections => 
      prevSections.map((section, i) => ({
        ...section,
        isOpen: i === index ? !section.isOpen : false
      }))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Conditions d'utilisation de Y</h1>
            <p className="text-gray-600">Dernière mise à jour : {lastUpdate}</p>
          </div>

          <div className="mb-6">
            <p className="text-lg">
              Bienvenue sur Y, un réseau social respectueux de votre vie privée et conçu selon les principes 
              du privacy by design. En utilisant Y, vous acceptez les 
              présentes conditions d'utilisation.
            </p>
          </div>

          <div className="space-y-4">
            {sections.map((section, index) => (
              <div key={index} className="border rounded-lg">
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors duration-150"
                >
                  <span className="text-lg font-semibold">{section.title}</span>
                  {section.isOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                
                {section.isOpen && (
                  <div className="p-4 pt-0 text-gray-700 transition-all duration-200">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center space-y-6">
            <p className="text-gray-600">
              Merci d'utiliser Y et de respecter ces conditions afin de garantir une expérience 
              sécurisée et agréable pour tous.
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-full hover:bg-gray-600 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;