import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PublicHeader from '../../components/layout/PublicHeader';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@chefathome.fr');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setError(null);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError('Email ou mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="flex flex-col justify-center items-center flex-grow">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-center mb-6">
            <span className="inline-block bg-gray-200 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Connexion</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Adresse Email
              </label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="votre.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                autoComplete="current-password"
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="******************"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="flex items-center justify-between mb-6">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
              >
                Se connecter
              </button>
            </div>
          </form>
          <div className="mt-4 space-y-2">
              <p className="text-center text-gray-600">Ou se connecter avec un compte de démonstration :</p>
              <button
                type="button"
                onClick={() => handleDemoLogin("admin@chefathome.fr", "admin123")}
                className="w-full bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Démo Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("client@chefathome.fr", "client123")}
                className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Démo Client
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("chef@chefathome.fr", "chef123")}
                className="w-full bg-yellow-500 text-white p-3 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Démo Chef
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin("b2b@chefathome.fr", "b2b123")}
                className="w-full bg-purple-500 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors"
              >
                Démo B2B
              </button>
            </div>
          <p className="text-center text-gray-600 text-sm mt-6">
            Pas encore de compte ? <Link to="/register" className="font-bold text-orange-500 hover:text-orange-600">Inscrivez-vous</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;