import React, { useState } from 'react';
import { User, Upload, Save, MapPin, Award, Camera, FileText, Shield, Phone, Mail, Plus, Check, ChefHat } from 'lucide-react';

const ChefProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [profileData, setProfileData] = useState({
    // Personal Information
    name: 'Marie Dubois',
    email: 'marie.dubois@email.com',
    phone: '+33 6 12 34 56 78',
    address: '123 Rue de la Cuisine',
    city: 'Paris',
    zipCode: '75016',
    
    // Professional Information
    specialty: 'Cuisine Française Moderne',
    experience: '15',
    hourlyRate: '80',
    description: 'Chef expérimentée spécialisée dans la cuisine française moderne avec une approche créative des plats traditionnels. Formée dans les plus grands restaurants parisiens.',
    
    // Cuisine & Services
    cuisineTypes: ['Française', 'Moderne', 'Fusion'],
    serviceTypes: ['Repas à domicile', 'Cuisinier hôte (lieu + repas)', 'Cours de cuisine'],
    dietarySpecializations: ['Végétarien', 'Sans gluten'],
    
    // Service Areas
    serviceAreas: [
      { city: 'Paris', zipCodes: ['75001', '75002', '75016'], maxDistance: 25 },
      { city: 'Neuilly-sur-Seine', zipCodes: ['92200'], maxDistance: 15 }
    ],
    
    // Documents
    documents: {
      cv: { uploaded: true, url: '/documents/cv.pdf', uploadedAt: '2024-01-01' },
      insurance: { uploaded: true, url: '/documents/insurance.pdf', uploadedAt: '2024-01-01' },
      healthCertificate: { uploaded: true, url: '/documents/health.pdf', uploadedAt: '2024-01-01' },
      businessLicense: { uploaded: false, url: null, uploadedAt: null }
    },
    
    // Certifications
    certifications: [
      { name: 'CAP Cuisine', issuer: 'Chambre des Métiers', dateObtained: '2010-06-15', expiryDate: null },
      { name: 'Mention Complémentaire Cuisinier en Desserts', issuer: 'École Ferrandi', dateObtained: '2012-09-20', expiryDate: null }
    ],
    
    // Portfolio
    portfolio: {
      images: [
        'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400'
      ],
      description: 'Découvrez ma passion pour la cuisine française moderne à travers mes créations.'
    }
  });

  const cuisineOptions = [
    'Française', 'Italienne', 'Japonaise', 'Chinoise', 'Indienne', 'Mexicaine',
    'Méditerranéenne', 'Fusion', 'Végétarienne', 'Vegan', 'Sans gluten'
  ];

  const serviceOptions = [
    'Repas à domicile', 'Cuisinier hôte (lieu + repas)', 'Cours de cuisine', 'Traiteur',
    'Consultation culinaire', 'Préparation de repas'
  ];

  const dietaryOptions = [
    'Végétarien', 'Vegan', 'Sans gluten', 'Sans lactose', 'Halal', 'Casher',
    'Paléo', 'Cétogène', 'Diabétique'
  ];

  const handleInputChange = <K extends keyof typeof profileData>(field: K, value: typeof profileData[K]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayToggle = (field: 'cuisineTypes' | 'serviceTypes' | 'dietarySpecializations', value: string) => {
    setProfileData(prev => {
      const current = prev[field] as string[];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return {
        ...prev,
        [field]: updated
      };
    });
  };

  const handleFileUpload = async (documentType: keyof typeof profileData.documents) => {
    setLoading(true);
    try {
      // Simulate file upload
      setTimeout(() => {
        setProfileData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [documentType]: {
              uploaded: true,
              url: `/documents/${documentType}.pdf`,
              uploadedAt: new Date().toISOString()
            }
          }
        }));
        setLoading(false);
      }, 2000);
    } catch {
      setLoading(false);
    }
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
    } catch {
      setLoading(false);
    }
  };

  const addCertification = () => {
    setProfileData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuer: '', dateObtained: '', expiryDate: '' }
      ]
    }));
  };

  const addServiceArea = () => {
    setProfileData(prev => ({
      ...prev,
      serviceAreas: [
        ...prev.serviceAreas,
        { city: '', zipCodes: [], maxDistance: 30 }
      ]
    }));
  };

  const sections = [
    { id: 'personal', label: 'Informations personnelles', icon: User },
    { id: 'professional', label: 'Informations professionnelles', icon: Award },
    { id: 'services', label: 'Services & Spécialités', icon: ChefHat },
    { id: 'areas', label: 'Zones d\'intervention', icon: MapPin },
    { id: 'documents', label: 'Documents professionnels', icon: FileText },
    { id: 'portfolio', label: 'Portfolio', icon: Camera }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Profil Chef</h2>
                <div className="flex items-center justify-center mt-2 space-x-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">Vérifié</span>
                </div>
              </div>

              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors text-left ${
                      activeSection === section.id 
                        ? 'bg-green-100 text-green-700' 
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
                      <p className="text-gray-600 mt-1">Renseignez vos coordonnées de contact</p>
                    </div>
                    <User className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email professionnel *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ville *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                          type="text"
                          value={profileData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adresse complète</label>
                      <textarea
                        value={profileData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        rows={3}
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Numéro, rue, complément d'adresse..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information */}
              {activeSection === 'professional' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Informations Professionnelles</h1>
                      <p className="text-gray-600 mt-1">Définissez votre expertise culinaire</p>
                    </div>
                    <Award className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Spécialité principale *</label>
                        <input
                          type="text"
                          value={profileData.specialty}
                          onChange={(e) => handleInputChange('specialty', e.target.value)}
                          placeholder="Ex: Cuisine française moderne"
                          className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Années d'expérience *</label>
                        <input
                          type="number"
                          value={profileData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          min="0"
                          className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tarif horaire (€) *</label>
                      <div className="relative max-w-xs">
                        <input
                          type="number"
                          value={profileData.hourlyRate}
                          onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                          min="20"
                          className="w-full py-3 px-4 pr-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">€/h</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description professionnelle *</label>
                      <textarea
                        value={profileData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        placeholder="Décrivez votre parcours, votre style culinaire et ce qui vous distingue..."
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                      <p className="text-sm text-gray-500 mt-1">{profileData.description.length}/1000 caractères</p>
                    </div>

                    {/* Certifications */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">Certifications</label>
                        <button
                          type="button"
                          onClick={addCertification}
                          className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Ajouter</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {profileData.certifications.map((cert, index) => (
                          <div key={index} className="grid md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                            <input
                              type="text"
                              placeholder="Nom de la certification"
                              value={cert.name}
                              onChange={(e) => {
                                const newCerts = [...profileData.certifications];
                                newCerts[index].name = e.target.value;
                                handleInputChange('certifications', newCerts);
                              }}
                              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="text"
                              placeholder="Organisme"
                              value={cert.issuer}
                              onChange={(e) => {
                                const newCerts = [...profileData.certifications];
                                newCerts[index].issuer = e.target.value;
                                handleInputChange('certifications', newCerts);
                              }}
                              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                            <input
                              type="date"
                              placeholder="Date d'obtention"
                              value={cert.dateObtained}
                              onChange={(e) => {
                                const newCerts = [...profileData.certifications];
                                newCerts[index].dateObtained = e.target.value;
                                handleInputChange('certifications', newCerts);
                              }}
                              className="py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Services & Specialties */}
              {activeSection === 'services' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Services & Spécialités</h1>
                      <p className="text-gray-600 mt-1">Définissez vos compétences culinaires</p>
                    </div>
                    <ChefHat className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="space-y-8">
                    {/* Cuisine Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Types de cuisine *</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {cuisineOptions.map((cuisine) => (
                          <label key={cuisine} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.cuisineTypes.includes(cuisine)}
                              onChange={() => handleArrayToggle('cuisineTypes', cuisine)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">{cuisine}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Service Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Types de prestations *</label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {serviceOptions.map((service) => (
                          <label key={service} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.serviceTypes.includes(service)}
                              onChange={() => handleArrayToggle('serviceTypes', service)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Dietary Specializations */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Spécialisations alimentaires</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {dietaryOptions.map((dietary) => (
                          <label key={dietary} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={profileData.dietarySpecializations.includes(dietary)}
                              onChange={() => handleArrayToggle('dietarySpecializations', dietary)}
                              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <span className="ml-3 text-sm text-gray-700">{dietary}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Areas */}
              {activeSection === 'areas' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Zones d'Intervention</h1>
                      <p className="text-gray-600 mt-1">Définissez votre zone de service</p>
                    </div>
                    <MapPin className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="space-y-6">
                    {profileData.serviceAreas.map((area, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-6">
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                            <input
                              type="text"
                              value={area.city}
                              onChange={(e) => {
                                const newAreas = [...profileData.serviceAreas];
                                newAreas[index].city = e.target.value;
                                handleInputChange('serviceAreas', newAreas);
                              }}
                              className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Distance max (km)</label>
                            <input
                              type="number"
                              value={area.maxDistance}
                              onChange={(e) => {
                                const newAreas = [...profileData.serviceAreas];
                                newAreas[index].maxDistance = parseInt(e.target.value);
                                handleInputChange('serviceAreas', newAreas);
                              }}
                              min="5"
                              max="100"
                              className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Codes postaux</label>
                            <input
                              type="text"
                              placeholder="75001, 75002, 75016..."
                              value={area.zipCodes.join(', ')}
                              onChange={(e) => {
                                const newAreas = [...profileData.serviceAreas];
                                newAreas[index].zipCodes = e.target.value.split(',').map(code => code.trim());
                                handleInputChange('serviceAreas', newAreas);
                              }}
                              className="w-full py-2 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addServiceArea}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 px-6 text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-5 w-5" />
                      <span>Ajouter une zone</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Documents */}
              {activeSection === 'documents' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Documents Professionnels</h1>
                      <p className="text-gray-600 mt-1">Téléchargez vos justificatifs</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { key: 'cv', label: 'CV / Curriculum Vitae', required: true, description: 'Votre parcours professionnel' },
                      { key: 'insurance', label: 'Assurance Responsabilité Civile', required: true, description: 'Couverture professionnelle obligatoire' },
                      { key: 'healthCertificate', label: 'Certificat de Santé', required: true, description: 'Aptitude à manipuler des denrées alimentaires' },
                      { key: 'businessLicense', label: 'Licence Professionnelle', required: false, description: 'Autorisation d\'exercer (si applicable)' }
                    ].map((doc) => (
                      <div key={doc.key} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {doc.label} {doc.required && <span className="text-red-500">*</span>}
                            </h3>
                            <p className="text-sm text-gray-600">{doc.description}</p>
                          </div>
                          {profileData.documents[doc.key]?.uploaded && (
                            <Check className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                        
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(doc.key, file);
                            }}
                            className="hidden"
                            id={`file-${doc.key}`}
                          />
                          <label
                            htmlFor={`file-${doc.key}`}
                            className={`flex items-center justify-center space-x-2 py-3 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                              profileData.documents[doc.key]?.uploaded
                                ? 'border-green-300 bg-green-50 text-green-700'
                                : 'border-gray-300 hover:border-green-500 text-gray-600 hover:text-green-600'
                            }`}
                          >
                            <Upload className="h-5 w-5" />
                            <span>
                              {profileData.documents[doc.key]?.uploaded 
                                ? 'Document téléchargé' 
                                : 'Télécharger le document'
                              }
                            </span>
                          </label>
                          
                          {profileData.documents[doc.key]?.uploaded && (
                            <div className="text-sm text-gray-500">
                              Téléchargé le {new Date(profileData.documents[doc.key].uploadedAt).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {activeSection === 'portfolio' && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
                      <p className="text-gray-600 mt-1">Présentez vos créations culinaires</p>
                    </div>
                    <Camera className="h-8 w-8 text-green-600" />
                  </div>

                  <div className="space-y-8">
                    {/* Portfolio Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description de votre style</label>
                      <textarea
                        value={profileData.portfolio.description}
                        onChange={(e) => handleInputChange('portfolio', {
                          ...profileData.portfolio,
                          description: e.target.value
                        })}
                        rows={3}
                        placeholder="Décrivez votre approche culinaire et votre style..."
                        className="w-full py-3 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    {/* Image Gallery */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">Galerie photos</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                        {profileData.portfolio.images.map((image, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-green-500 transition-colors cursor-pointer">
                          <div className="text-center">
                            <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">Ajouter une photo</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end mt-8">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefProfile;
