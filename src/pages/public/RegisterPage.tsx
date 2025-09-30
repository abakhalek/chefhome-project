import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Inscription</h1>
        <p className="text-gray-600 mb-6">Rejoignez Chef@Home et découvrez une nouvelle expérience culinaire.</p>
        <Link to="/login" className="text-orange-500 hover:underline">Déjà un compte ? Connectez-vous</Link>
      </div>
    </div>
  );
};

export default RegisterPage;