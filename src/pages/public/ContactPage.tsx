
import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Nous Contacter</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 max-w-2xl mx-auto">
          <p className="text-base md:text-lg text-gray-700 mb-6 text-center">
            Vous avez des questions, des suggestions ou besoin d'assistance ? N'hésitez pas à nous contacter. Notre équipe est là pour vous aider.
          </p>

          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Votre Nom</label>
              <input type="text" id="name" name="name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Votre nom complet" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Votre Email</label>
              <input type="email" id="email" name="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="votre.email@example.com" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
              <input type="text" id="subject" name="subject" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Sujet de votre message" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Votre Message</label>
              <textarea id="message" name="message" rows={5} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500" placeholder="Écrivez votre message ici..."></textarea>
            </div>
            <div className="text-center">
              <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition duration-300">
                Envoyer le Message
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
