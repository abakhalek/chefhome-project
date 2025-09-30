
import React from 'react';
import { Link } from 'react-router-dom';
import home from '../../public/home.png';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center h-[600px]" style={{ backgroundImage: 'url(../../../public/home.png)' }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl font-bold mb-4">Votre Chef Personnel à Domicile</h1>
          <p className="text-xl mb-8 max-w-2xl">
            Découvrez une expérience culinaire unique, préparée par des chefs qualifiés, directement chez vous.
          </p>
          <Link to="/chefs" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300">
            Trouver mon Chef
          </Link>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-8">Chef@Home</h2>
          <h3 className="text-4xl font-bold text-gray-800 mb-8">Votre Cuisinier Personnel à Domicile</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
            Bienvenue dans la présentation de Chef@Home, l'application qui révolutionne
            l'expérience culinaire à domicile. Notre plateforme connecte des particuliers
            et des professionnels avec des chefs qualifiés pour diverses prestations
            culinaires, du simple repas quotidien aux événements privés et cours de
            cuisine.
            Découvrez comment notre solution innovante simplifie la réservation de chefs
            à domicile tout en offrant une expérience utilisateur fluide et sécurisée, tant
            pour les clients que pour les chefs partenaires.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 shadow-lg rounded-lg bg-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Chefs Qualifiés</h3>
              <p className="text-gray-600">Accédez à un réseau de professionnels de la cuisine, vérifiés et passionnés.</p>
            </div>
            <div className="p-6 shadow-lg rounded-lg bg-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Expérience Personnalisée</h3>
              <p className="text-gray-600">Menus sur mesure, adaptés à vos goûts, allergies et événements.</p>
            </div>
            <div className="p-6 shadow-lg rounded-lg bg-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Simplicité & Sécurité</h3>
              <p className="text-gray-600">Réservez et payez en toute confiance grâce à notre plateforme sécurisée.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-12">Comment ça marche ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center">
              <div className="bg-orange-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">1</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Trouvez votre Chef</h3>
              <p className="text-gray-600">Parcourez les profils, filtrez par spécialité, tarif et disponibilité.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">2</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Réservez votre Prestation</h3>
              <p className="text-gray-600">Choisissez le type de service, précisez vos besoins et confirmez.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-orange-500 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-4">3</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Savourez l'Expérience</h3>
              <p className="text-gray-600">Votre chef s'occupe de tout, de la préparation au service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-orange-500 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-4">Prêt à vivre une expérience culinaire inoubliable ?</h2>
          <p className="text-xl mb-8">Réservez votre chef personnel dès aujourd'hui !</p>
          <Link to="/chefs" className="bg-white text-orange-500 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg transition duration-300">
            Commencer ma recherche
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
