import React from 'react';

const HowItWorksPage: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        <section className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Comment fonctionne Chef at Home ?</h1>
          <p className="text-lg text-gray-600">
            Réservez un chef privé à distance en quelques minutes, composez des menus sur-mesure et profitez
            de cuisines du monde entier partout en France.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Application Android</h2>
            <p className="text-gray-600">
              Accédez à Chef at Home depuis votre smartphone Android pour réserver un chef, suivre vos commandes
              et discuter avec notre équipe où que vous soyez.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-left">
              <li>Réservation express avec paiement sécurisé</li>
              <li>Choix de menus multiculturels et filtrage par régimes</li>
              <li>Notifications en temps réel pour chaque étape de votre événement</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-3">
            <h2 className="text-xl font-semibold text-gray-900">Application iOS</h2>
            <p className="text-gray-600">
              Retrouvez la même expérience premium sur iPhone et iPad : gérez vos préférences culinaires,
              consultez les chefs disponibles et partagez vos événements avec vos invités.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-left">
              <li>Synchronisation avec votre calendrier Apple</li>
              <li>Historique des prestations et recommandations personnalisées</li>
              <li>Support client direct par chat ou téléphone</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-5">
          <h2 className="text-2xl font-semibold text-gray-900">Installer l'application depuis une source inconnue (Android)</h2>
          <p className="text-gray-600">
            Vous avez reçu l'APK Chef at Home par e-mail ou via notre équipe ? Suivez ces étapes pour autoriser
            l'installation en toute sécurité :
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            <li>Téléchargez le fichier <strong>ChefAtHome.apk</strong> depuis notre lien sécurisé.</li>
            <li>Ouvrez les paramètres de votre téléphone, puis rendez-vous dans <em>Applications &gt; Accès spécial &gt; Installer apps inconnues</em>.</li>
            <li>Choisissez votre navigateur (ou Gestionnaire de fichiers) et activez l'option <em>Autoriser cette source</em>.</li>
            <li>Retournez dans votre dossier de téléchargements et lancez le fichier <strong>ChefAtHome.apk</strong>.</li>
            <li>Validez l'installation. Vous pouvez ensuite désactiver l'autorisation pour plus de sécurité.</li>
          </ol>
          <p className="text-sm text-gray-500">
            Conseil : vérifiez toujours que le lien provient bien de Chef at Home avant d'installer une application en dehors des stores officiels.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Utiliser l'application Chef at Home</h2>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">1</span>
              <div className="mt-3 md:mt-0">
                <h3 className="text-lg font-semibold text-gray-900">Créez votre compte</h3>
                <p className="text-gray-600">Inscrivez-vous avec votre e-mail, ajoutez votre adresse en France et précisez vos préférences culinaires.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">2</span>
              <div className="mt-3 md:mt-0">
                <h3 className="text-lg font-semibold text-gray-900">Composez votre expérience</h3>
                <p className="text-gray-600">Choisissez un type d'événement, sélectionnez plusieurs plats du monde entier et ajustez votre budget en temps réel.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">3</span>
              <div className="mt-3 md:mt-0">
                <h3 className="text-lg font-semibold text-gray-900">Réservez votre chef à distance</h3>
                <p className="text-gray-600">Consultez les chefs disponibles, échangez par chat ou visioconférence et confirmez votre réservation.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">4</span>
              <div className="mt-3 md:mt-0">
                <h3 className="text-lg font-semibold text-gray-900">Suivez la préparation</h3>
                <p className="text-gray-600">Validez votre menu final, partagez des instructions particulières et suivez chaque étape via les notifications.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white font-semibold">5</span>
              <div className="mt-3 md:mt-0">
                <h3 className="text-lg font-semibold text-gray-900">Savourez et évaluez</h3>
                <p className="text-gray-600">Le jour J, profitez de votre repas, laissez un avis détaillé et partagez vos photos pour aider la communauté.</p>
              </div>
            </div>
          </div>
          <p className="text-gray-600">
            Besoin d'aide ? Notre équipe support est disponible 7j/7 directement depuis l'application ou par e-mail à
            <a href="mailto:contact@chefathome.fr" className="font-medium text-orange-500 hover:text-orange-600"> contact@chefathome.fr</a>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default HowItWorksPage;
