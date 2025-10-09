
import React, { useState, useEffect } from 'react';
import { Bell, Lock, CreditCard, User, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { chefService } from '../../services/chefService';

const SettingsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: 0,
    hourlyRate: 0,
    description: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    missionAlerts: true,
    paymentAlerts: true
  });
  const [paymentSettings, setPaymentSettings] = useState({
    bankAccount: '',
    iban: '',
    bic: '',
    taxId: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await chefService.getProfile();
      setProfileData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        specialty: profile.specialty || '',
        experience: profile.experience || 0,
        hourlyRate: profile.hourlyRate || 0,
        description: profile.description || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await chefService.updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour du profil.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Paramètres de notifications sauvegardés !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayment = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage({ type: 'success', text: 'Paramètres de paiement sauvegardés !' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setLoading(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres du Profil</h2>
            <p className="text-gray-600">Gérez vos informations personnelles et préférences.</p>
            
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité</label>
                  <input
                    type="text"
                    value={profileData.specialty}
                    onChange={(e) => setProfileData({ ...profileData, specialty: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience</label>
                  <input
                    type="number"
                    min="0"
                    value={profileData.experience}
                    onChange={(e) => setProfileData({ ...profileData, experience: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taux horaire (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={profileData.hourlyRate}
                    onChange={(e) => setProfileData({ ...profileData, hourlyRate: Number(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Décrivez votre expertise culinaire..."
                />
              </div>
              
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={20} />
                <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </form>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Préférences de Notifications</h2>
            <p className="text-gray-600">Choisissez comment vous souhaitez être notifié.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications par email</h3>
                  <p className="text-sm text-gray-600">Recevez les notifications importantes par email</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications SMS</h3>
                  <p className="text-sm text-gray-600">Recevez les alertes urgentes par SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.smsNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Notifications push</h3>
                  <p className="text-sm text-gray-600">Recevez les notifications sur votre appareil mobile</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Alertes de missions</h3>
                  <p className="text-sm text-gray-600">Soyez notifié des nouvelles missions</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.missionAlerts}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, missionAlerts: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900">Alertes de paiement</h3>
                  <p className="text-sm text-gray-600">Soyez notifié des paiements reçus</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.paymentAlerts}
                  onChange={(e) => setNotificationSettings({ ...notificationSettings, paymentAlerts: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              
              <button
                type="button"
                onClick={handleSaveNotifications}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={20} />
                <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Sécurité du Compte</h2>
            <p className="text-gray-600">Modifiez votre mot de passe et gérez les sessions.</p>
            
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Changer le mot de passe</h3>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Mot de passe actuel"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Confirmer le nouveau mot de passe"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                    Changer le mot de passe
                  </button>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Sessions actives</h3>
                <p className="text-sm text-gray-600 mb-3">Gérez vos sessions actives sur différents appareils</p>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                  Fermer toutes les autres sessions
                </button>
              </div>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Paramètres de Paiement</h2>
            <p className="text-gray-600">Gérez vos informations bancaires et de paiement.</p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de compte bancaire</label>
                <input
                  type="text"
                  value={paymentSettings.bankAccount}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccount: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                <input
                  type="text"
                  value={paymentSettings.iban}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, iban: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BIC</label>
                <input
                  type="text"
                  value={paymentSettings.bic}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, bic: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ABCDEFGH"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de TVA</label>
                <input
                  type="text"
                  value={paymentSettings.taxId}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, taxId: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="FR12345678901"
                />
              </div>
              
              <button
                type="button"
                onClick={handleSavePayment}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save size={20} />
                <span>{loading ? 'Sauvegarde...' : 'Sauvegarder'}</span>
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Paramètres</h1>
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
      )}
      
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
