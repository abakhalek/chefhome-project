
import React, { useState } from 'react';
import { User, Save, Phone, Mail, MapPin, Bell, Shield, Heart, Calendar, Star } from 'lucide-react';

const ClientProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [profileData, setProfileData] = useState({
    name: 'Alexandre Martin',
    email: 'alex.martin@email.com',
    phone: '+33 7 89 10 11 12',
    address: '456 Avenue des Gourmets',
    city: 'Lyon',
    zipCode: '69002',
    dietaryPreferences: ['Végétarien'],
    allergies: 'Arachides',
    bookings: [
      { id: 1, chef: 'Marie Dubois', date: '2024-08-15', status: 'Confirmé', rating: 5 },
      { id: 2, chef: 'Jean-Pierre Lefevre', date: '2024-07-20', status: 'Terminé', rating: 4 },
      { id: 3, chef: 'Sophie Bernard', date: '2024-06-10', status: 'Terminé', rating: 5 },
    ],
  });

  const dietaryOptions = [
    'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose', 'Halal', 'Casher',
    'Paléo', 'Cétogène', 'Diabétique'
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      setTimeout(() => {
        console.log('Profile updated:', profileData);
        setLoading(false);
      }, 1000);
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setLoading(false);
    }
  };

  const sections = [
    { id: 'personal', label: 'Informations personnelles', icon: User },
    { id: 'preferences', label: 'Préférences alimentaires', icon: Heart },
    { id: 'bookings', label: 'Historique des réservations', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Profil Client</h2>
                <span className="text-sm text-gray-500">Membre depuis 2023</span>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors text-left ${
                      activeSection === section.id 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="h-5 w-5" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Informations Personnelles</h1>
                      <p className="text-gray-600 mt-1">Gérez vos coordonnées</p>
                    </div>
                    <User className="h-8 w-8 text-blue-600" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Votre adresse complète..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dietary Preferences */}
              {activeSection === 'preferences' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Préférences Alimentaires</h1>
                      <p className="text-gray-600 mt-1">Aidez les chefs à mieux vous connaître</p>
                    </div>
                    <Heart className="h-8 w-8 text-blue-600" />
                  </div>

                  <div className="space-y-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Régimes alimentaires</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {dietaryOptions.map((diet) => (
                          <label key={diet} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.dietaryPreferences.includes(diet)}
                              onChange={() => handleArrayToggle('dietaryPreferences', diet)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">{diet}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Allergies ou aversions</label>
                      <textarea
                        value={profileData.allergies}
                        onChange={(e) => handleInputChange('allergies', e.target.value)}
                        rows={3}
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: allergique aux arachides, n'aime pas la coriandre..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Booking History */}
              {activeSection === 'bookings' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Historique des Réservations</h1>
                      <p className="text-gray-600 mt-1">Consultez vos expériences passées et à venir</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-600" />
                  </div>
                  
                  <div className="space-y-4">
                    {profileData.bookings.map(booking => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-800">Chef {booking.chef}</p>
                          <p className="text-sm text-gray-600">{new Date(booking.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            booking.status === 'Confirmé' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>{booking.status}</span>
                          {booking.status === 'Terminé' && (
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < booking.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              {activeSection !== 'bookings' && (
                <div className="flex justify-end mt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center space-x-2 bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-5 w-5" />
                    <span>{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfilePage;
