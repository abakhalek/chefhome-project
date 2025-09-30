
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../public/logo.png';

const PublicHeader: React.FC = () => {
  const { isAuthenticated, user, role, logout } = useAuth();

  const getDashboardLink = () => {
    switch (role) {
      case 'admin': return '/admin-dashboard';
      case 'chef': return '/chef-dashboard';
      case 'b2b': return '/b2b-dashboard';
      case 'client': return '/client-dashboard';
      default: return '/';
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/">
          <img src={logo} alt="ChefHome Logo" className="h-12" />
        </Link>
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Accueil</Link>
          <Link to="/chefs" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Trouver un Chef</Link>
          <Link to="/how-it-works" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Comment ça marche</Link>
          <Link to="/about" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">À propos</Link>
          <Link to="/contact" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">Contact</Link>
          <Link to="/faq" className="text-gray-600 hover:text-orange-500 transition-colors font-medium">FAQ</Link>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
              )}
              <Link to={getDashboardLink()} className="text-gray-600 hover:text-orange-500 transition-colors font-medium">
                Mon Espace
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-orange-500 font-medium">Connexion</Link>
              <Link to="/register" className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                Inscription
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default PublicHeader;
