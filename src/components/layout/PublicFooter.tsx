
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../public/logo.png';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <img src={logo} alt="ChefHome Logo" className="h-12 mb-4" />
            <p className="text-gray-400">Révolutionnons l'expérience culinaire à domicile.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Chef@Home</h3>
            <ul>
              <li><Link to="/about" className="hover:text-orange-400">À propos</Link></li>
              <li><Link to="/contact" className="hover:text-orange-400">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-orange-400">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Légal</h3>
            <ul>
              <li><Link to="/terms" className="hover:text-orange-400">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy" className="hover:text-orange-400">Politique de confidentialité</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Suivez-nous</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-orange-400"><Facebook /></a>
              <a href="#" className="hover:text-orange-400"><Twitter /></a>
              <a href="#" className="hover:text-orange-400"><Instagram /></a>
              <a href="#" className="hover:text-orange-400"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} Chef@Home. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
