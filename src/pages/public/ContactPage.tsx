
import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Le sujet est requis';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Une erreur est survenue lors de l\'envoi du message. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Message Envoyé !</h1>
            <p className="text-base md:text-lg text-gray-700 mb-6">
              Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
            </p>
            <button 
              onClick={() => setIsSubmitted(false)}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300"
            >
              Envoyer un autre message
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Nous Contacter</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
          <p className="text-base md:text-lg text-gray-700 mb-6 text-center">
            Vous avez des questions, des suggestions ou besoin d'assistance ? N'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="flex items-center space-x-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.submit}</span>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Votre Nom *</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`} 
                placeholder="Votre nom complet" 
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Votre Email *</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`} 
                placeholder="votre.email@example.com" 
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Sujet *</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                value={formData.subject}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`} 
                placeholder="Sujet de votre message" 
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.subject}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Votre Message *</label>
              <textarea 
                id="message" 
                name="message" 
                rows={5} 
                value={formData.message}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 ${
                  errors.message ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`} 
                placeholder="Écrivez votre message ici..." 
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.message}
                </p>
              )}
            </div>

            <div className="text-center">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3 px-8 rounded-lg transition duration-300 flex items-center justify-center space-x-2 mx-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Envoyer le Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Informations de Contact</h2>
          <p className="text-base md:text-lg text-gray-700 mb-2">Email: <a href="mailto:contact@chefathome.fr" className="text-orange-500 hover:underline">contact@chefathome.fr</a></p>
          <p className="text-base md:text-lg text-gray-700">Téléphone: +33 1 23 45 67 89</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
