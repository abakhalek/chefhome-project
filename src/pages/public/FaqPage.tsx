
import React from 'react';

const FaqPage: React.FC = () => {
  const faqs = [
    {
      question: "Qu'est-ce que Chef@Home ?",
      answer: "Chef@Home est une plateforme qui met en relation des particuliers et des professionnels avec des chefs qualifiés pour des prestations culinaires à domicile, incluant repas quotidiens, événements privés et cours de cuisine."
    },
    {
      question: "Comment puis-je réserver un chef ?",
      answer: "Vous pouvez rechercher un chef via notre page 'Trouver un Chef', utiliser des filtres pour affiner votre recherche, puis sélectionner le chef et la prestation souhaitée. Le processus de réservation est guidé et sécurisé."
    },
    {
      question: "Les chefs sont-ils qualifiés ?",
      answer: "Oui, tous nos chefs partenaires sont rigoureusement sélectionnés et vérifiés pour leurs qualifications, leur expérience et la qualité de leurs services."
    },
    {
      question: "Quels types de prestations sont disponibles ?",
      answer: "Nous proposons des repas quotidiens, des dîners pour événements privés, des buffets, des cocktails, ainsi que des cours de cuisine personnalisés à domicile."
    },
    {
      question: "Comment fonctionne le paiement ?",
      answer: "Le paiement s'effectue de manière sécurisée via Stripe. Vous pouvez choisir de verser un acompte de 20% à la réservation ou de régler la totalité de la prestation. Des documents de confirmation sont générés automatiquement."
    },
    {
      question: "Puis-je annuler ou modifier une réservation ?",
      answer: "Les conditions d'annulation et de modification sont détaillées dans nos conditions générales d'utilisation. En général, des préavis sont requis pour toute modification."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">Questions Fréquemment Posées (FAQ)</h1>
        
        <div className="space-y-6 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">{faq.question}</h2>
              <p className="text-base text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FaqPage;
