
import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">À propos de Chef@Home</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Notre Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Chez Chef@Home, nous révolutionnons l'expérience culinaire à domicile en connectant des particuliers et des professionnels avec des chefs qualifiés. Notre mission est de rendre la cuisine de haute qualité accessible à tous, pour toutes les occasions, directement dans le confort de votre foyer.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Que ce soit pour un repas quotidien, un événement spécial, ou un cours de cuisine personnalisé, nous nous engageons à offrir une expérience fluide, sécurisée et inoubliable, tant pour nos clients que pour nos chefs partenaires.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Nos Valeurs</h2>
          <ul className="list-disc list-inside text-lg text-gray-700 space-y-3">
            <li><span className="font-bold text-orange-500">Qualité :</span> Nous sélectionnons rigoureusement nos chefs pour garantir l'excellence culinaire.</li>
            <li><span className="font-bold text-orange-500">Innovation :</span> Nous utilisons la technologie pour simplifier la réservation et la gestion des prestations.</li>
            <li><span className="font-bold text-orange-500">Confiance :</span> Une plateforme sécurisée pour des transactions et des interactions en toute sérénité.</li>
            <li><span className="font-bold text-orange-500">Passion :</span> Nous partageons l'amour de la bonne cuisine et le désir de la partager.</li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">L'Équipe Chef@Home</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Nous sommes une équipe passionnée de gastronomie et de technologie, dédiée à créer la meilleure plateforme de chefs à domicile. Chaque membre de notre équipe travaille sans relâche pour améliorer votre expérience et soutenir notre communauté de chefs talentueux.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
