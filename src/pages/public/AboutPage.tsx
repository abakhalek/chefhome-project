import React from 'react';

const AboutPage: React.FC = () => {
  const pillars = [
    {
      title: 'Clients Particuliers',
      description:
        "Chef@Home transforme l'expérience culinaire à domicile en proposant des prestations gastronomiques sur mesure. Grâce à la recherche avancée, chacun peut trouver un chef correspondant à ses goûts, ses contraintes alimentaires et son budget, avec des avis vérifiés et une transparence totale sur les tarifs.",
      highlights: [
        'Recherche personnalisée par type de cuisine, budget et disponibilité',
        'Acompte sécurisé ou paiement total via Stripe',
        'Suivi de réservation, notifications et espace d’évaluation post-prestation'
      ]
    },
    {
      title: 'Chefs Partenaires',
      description:
        "Les chefs disposent d’un véritable cockpit pour développer leur activité : création de menus types ou prestations personnalisées, gestion d’un agenda dynamique, statistiques détaillées et messagerie intégrée pour échanger avec les clients avant et après la mission.",
      highlights: [
        'Validation des documents professionnels et certifications',
        'Gestion des offres avec tarification horaire ou forfaitaire',
        'Tableau de bord revenus, évaluations clients et paiements sécurisés'
      ]
    },
    {
      title: 'Professionnels B2B',
      description:
        'Restaurants, traiteurs et dark kitchens bénéficient d’un espace professionnel dédié. Ils publient des missions spécialisées, attribuent des chefs en direct et pilotent leur staffing grâce à un agenda multi-sites et une facturation groupée.',
      highlights: [
        'Dépôt de missions précises avec niveau d’expérience requis',
        'Recherche filtrée par compétences, disponibilités et localisation',
        'Facturation professionnelle mensuelle et suivi RH optionnel'
      ]
    }
  ];

  const adminHighlights = [
    'Reporting avancé avec KPI temps réel, segmentation marketing et export',
    'Workflow de validation des chefs, contrôle des offres et suivi des litiges',
    'Supervision des réservations avec modification, remboursement et arbitrage'
  ];

  const paymentHighlights = [
    'Génération automatique de devis consultables en ligne',
    'Paiement sécurisé via Stripe : acompte de 20% ou règlement complet',
    'Répartition automatique des fonds (commission + solde chef) et factures PDF'
  ];

  const communicationHighlights = [
    'Messagerie interne chiffrée entre clients et chefs',
    'Notifications automatiques : confirmation, rappel 24h, modifications et annulation',
    'Collecte des évaluations avec rappels post-prestation et gestion des retours'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10 md:py-16">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl space-y-10">
        <section className="bg-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/40 via-white to-emerald-50 pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <p className="inline-flex items-center rounded-full bg-orange-100 text-orange-700 px-4 py-1 text-sm font-semibold uppercase tracking-wide">
              Chef@Home, la révolution culinaire à domicile
            </p>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Une plateforme tout-en-un pour connecter particuliers, chefs talentueux et professionnels de la restauration.
            </h1>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              Chef@Home simplifie l’organisation d’expériences culinaires d’exception : recherche intuitive de chefs, réservation fluide, gestion administrative automatisée et sécurité de bout en bout. Que vous planifiiez un dîner intimiste, un événement d’entreprise ou que vous développiez votre activité de chef, l’application offre un environnement fiable, intuitif et conforme aux normes RGPD.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base text-gray-700">
              <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
                <h3 className="text-lg font-semibold text-orange-700 mb-2">Expérience Clients</h3>
                <p>Réservations instantanées, devis en un clic et suivi en temps réel de chaque prestation.</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                <h3 className="text-lg font-semibold text-emerald-700 mb-2">Croissance Chefs</h3>
                <p>Outils métiers complets pour piloter les menus, les missions et les revenus.</p>
              </div>
              <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-4">
                <h3 className="text-lg font-semibold text-indigo-700 mb-2">Pilotage Pro</h3>
                <p>Espace B2B dédié avec agenda multi-sites, facturation centralisée et support RH.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">{pillar.title}</h2>
                <span className="text-sm font-semibold text-orange-500 uppercase">Expérience</span>
              </div>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">{pillar.description}</p>
              <ul className="space-y-2 text-sm text-gray-600">
                {pillar.highlights.map((item) => (
                  <li key={item} className="flex items-start space-x-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="bg-white rounded-3xl shadow-lg p-8 md:p-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">Pilotage Administrateur</h2>
              <p className="text-gray-600 text-sm md:text-base mt-2">
                L’équipe administrateur dispose d’un cockpit complet pour garantir la qualité du service, la conformité et la satisfaction client.
              </p>
            </div>
            <div className="inline-flex items-center bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide">
              Contrôle total
            </div>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adminHighlights.map((item) => (
              <li key={item} className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm md:text-base text-gray-700">
                <span className="block font-semibold text-gray-900 mb-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-white rounded-3xl shadow-lg p-8 space-y-4 border border-orange-100">
            <h3 className="text-2xl font-bold text-gray-900">Paiement & Facturation</h3>
            <p className="text-gray-600 text-sm md:text-base">
              Un système de paiement automatisé et conforme PCI-DSS assure une expérience fluide : devis instantané, acompte sécurisé et génération des documents comptables pour le client comme pour le chef.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {paymentHighlights.map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="bg-white rounded-3xl shadow-lg p-8 space-y-4 border border-emerald-100">
            <h3 className="text-2xl font-bold text-gray-900">Communication & Notifications</h3>
            <p className="text-gray-600 text-sm md:text-base">
              La coordination est simplifiée grâce à une messagerie interne sécurisée et un système de notifications multi-canaux couvrant chaque étape de la prestation, de la confirmation à l’évaluation finale.
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              {communicationHighlights.map((item) => (
                <li key={item} className="flex items-start space-x-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="bg-gray-900 text-white rounded-3xl p-8 md:p-10 space-y-6">
          <h3 className="text-2xl md:text-3xl font-extrabold">Sécurité & Conformité</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm md:text-base text-gray-100">
            <div className="space-y-3">
              <p>
                Nous respectons les exigences RGPD avec une gestion granulaire des consentements, un stockage chiffré des données sensibles et des droits d’accès basés sur les rôles (clients, chefs, B2B, administrateurs).
              </p>
              <p>
                Les transactions financières sont assurées via Stripe, garantissant la conformité PCI-DSS et la protection des fonds à chaque étape du flux de paiement.
              </p>
            </div>
            <div className="space-y-3">
              <p>
                La plateforme intègre des audits de sécurité, un suivi des logs et des plans de continuité pour assurer une disponibilité optimale et une traçabilité complète en cas de litige.
              </p>
              <p>
                Des procédures dédiées de résolution des litiges permettent aux administrateurs d’intervenir rapidement, d’ordonner des remboursements et de préserver la satisfaction client.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;