import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Target, Users, CreditCard } from 'lucide-react';
import PublicHeader from '../../components/layout/PublicHeader';

const B2BDashboardLayout: React.FC = () => {
  const location = useLocation();

  const sidebarLinks = [
    { path: '/b2b-dashboard', label: 'Dashboard', icon: Home },
    { path: '/b2b-dashboard/post-mission', label: 'Nouvelle Mission', icon: Target },
    { path: '/b2b-dashboard/missions', label: 'Mes Missions', icon: Users },
    { path: '/b2b-dashboard/find-chefs', label: 'Trouver un Chef', icon: Users },
    { path: '/b2b-dashboard/invoicing', label: 'Facturation', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Espace B2B</h2>
              <nav className="space-y-2">
                {sidebarLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                      location.pathname === link.path
                        ? 'bg-blue-100 text-blue-700'
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

export default B2BDashboardLayout;
