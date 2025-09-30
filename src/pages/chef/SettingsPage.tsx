
import React, { useState } from 'react';
import { Settings, Bell, Lock, CreditCard, User } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres du Profil</h2>
            <p className="text-gray-600">Gérez vos informations personnelles et préférences.</p>
            {/* Placeholder for profile settings form */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">Formulaire de modification du profil (à implémenter)</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Préférences de Notifications</h2>
            <p className="text-gray-600">Choisissez comment vous souhaitez être notifié.</p>
            {/* Placeholder for notification settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">Options de notifications (à implémenter)</p>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sécurité du Compte</h2>
            <p className="text-gray-600">Modifiez votre mot de passe et gérez les sessions.</p>
            {/* Placeholder for security settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">Options de sécurité (à implémenter)</p>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres de Paiement</h2>
            <p className="text-gray-600">Gérez vos informations bancaires et de paiement.</p>
            {/* Placeholder for payment settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">Options de paiement (à implémenter)</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Paramètres</h1>
      <div className="bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row min-h-[70vh]">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4 border-r border-gray-200 p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveSection('profile')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                activeSection === 'profile' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={20} /><span>Profil</span>
            </button>
            <button
              onClick={() => setActiveSection('notifications')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                activeSection === 'notifications' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Bell size={20} /><span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveSection('security')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                activeSection === 'security' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Lock size={20} /><span>Sécurité</span>
            </button>
            <button
              onClick={() => setActiveSection('payment')}
              className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                activeSection === 'payment' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <CreditCard size={20} /><span>Paiement</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
