import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, User, ChefHat, Calendar, Euro, Bell, MessageCircle, Settings } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';

const ChefDashboardLayout: React.FC = () => {
  const location = useLocation();

  const sidebarLinks = [
    { path: '/chef-dashboard', label: 'Aperçu', icon: Home },
    { path: '/chef-dashboard/profile', label: 'Mon Profil', icon: User },
    { path: '/chef-dashboard/menus', label: 'Mes Offres', icon: ChefHat },
    { path: '/chef-dashboard/planning', label: 'Planning & Missions', icon: Calendar },
    { path: '/chef-dashboard/earnings', label: 'Revenus & Factures', icon: Euro },
    { path: '/chef-dashboard/notifications', label: 'Notifications', icon: Bell },
    { path: '/chef-dashboard/messages', label: 'Messages', icon: MessageCircle },
    { path: '/chef-dashboard/settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Espace Chef</h2>
              <nav className="space-y-2">
                {sidebarLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                      location.pathname.startsWith(link.path)
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboardLayout;
