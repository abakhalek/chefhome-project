import React from 'react';
import { Download } from 'lucide-react';
import appMockup from '../../public/home.png';

const LogicielPage: React.FC = () => {
  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-600">
            Chef at Home
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Logiciel Chef at Home : vos réservations de chefs en mobilité
          </h1>
          <p className="text-lg text-gray-600">
            Retrouvez toute la plateforme Chef at Home dans nos applications mobiles. Réservez des chefs
            privés en France, composez des menus internationaux et suivez vos événements en temps réel,
            directement depuis votre smartphone ou tablette.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href="/app/chefathome-android.apk"
              download
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-green-700 transition"
            >
              <Download className="h-5 w-5" />
              Télécharger Android (APK)
            </a>
            <a
              href="/app/chefathome-ios.ipa"
              download
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 transition"
            >
              <Download className="h-5 w-5" />
              Télécharger iOS (IPA)
            </a>
          </div>
          <p className="text-sm text-gray-500">
            Astuce : sur Android, activez temporairement l'installation depuis des sources inconnues pour valider
            l'APK, puis désactivez-la après installation.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-orange-200/40 rounded-3xl blur-3xl" aria-hidden="true"></div>
          <img
            src={appMockup}
            alt="Aperçu de l'application Chef at Home"
            className="relative rounded-3xl shadow-2xl border border-white/60"
          />
        </div>
      </div>
    </div>
  );
};

export default LogicielPage;
