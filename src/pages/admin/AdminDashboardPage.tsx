import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../public/logo.png';
import { LayoutDashboard, Users, ChefHat, BookCopy, ShieldAlert } from 'lucide-react';

// Header component recreated inside the layout
const AdminHeader: React.FC = () => {
    const { user, logout } = useAuth();
    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-10 py-5 flex justify-between items-center">
                <NavLink to="/">
                    <img src={logo} alt="ChefHome Logo" className="h-16 w-25" />
                </NavLink>
                <div className="flex items-center space-x-4">
                    {user?.avatar ? (
                        <img src={user.avatar} alt="User Avatar" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">{user?.name?.charAt(0).toUpperCase()}</div>
                    )}
                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 transition-colors"
                    >
                        Déconnexion
                    </button>
                </div>
            </nav>
        </header>
    );
};

const AdminDashboardPage: React.FC = () => {
  const sidebarLinks = [
    { path: '/admin-dashboard', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    { path: '/admin-dashboard/users', label: 'Utilisateurs', icon: Users },
    { path: '/admin-dashboard/chefs', label: 'Vérification Chefs', icon: ChefHat },
    { path: '/admin-dashboard/bookings', label: 'Réservations', icon: BookCopy },
    { path: '/admin-dashboard/disputes', label: 'Litiges', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-1/4 xl:w-1/5">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <nav className="space-y-2">
                {sidebarLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.exact}
                    className={({ isActive }) =>
                      `w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1">
            <div className="bg-white rounded-2xl shadow-lg min-h-[600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;