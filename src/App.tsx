import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { NotificationProvider } from './contexts/NotificationContext';

// Layouts
import PublicLayout from './components/layout/PublicLayout';

// Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import FindChefPage from './pages/public/FindChefPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import LogicielPage from './pages/public/LogicielPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import FaqPage from './pages/public/FaqPage';
import ChefMenuPage from './pages/public/ChefMenuPage';

import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminDashboardHomePage from './pages/admin/AdminDashboardHomePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminChefsPage from './pages/admin/AdminChefsPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';

import AdminDisputesPage from './pages/admin/AdminDisputesPage';

// Chef Pages
import ChefDashboardLayout from './pages/chef/ChefDashboardLayout';
import ChefDashboard from './pages/chef/ChefDashboard';
import ChefMenus from './pages/chef/ChefMenus';
import ChefPlanning from './pages/chef/ChefPlanning';
import ChefEarnings from './pages/chef/ChefEarnings';
import PersonalInfoPage from './pages/chef/PersonalInfoPage';
import SpecialtiesPage from './pages/chef/SpecialtiesPage';
import DocumentsPage from './pages/chef/DocumentsPage';
import CertificationsPage from './pages/chef/CertificationsPage';
import ServiceAreaPage from './pages/chef/ServiceAreaPage';
import NotificationsPage from './pages/chef/NotificationsPage';
import MessagesPage from './pages/chef/MessagesPage';
import SettingsPage from './pages/chef/SettingsPage';
import AddMenuPage from './pages/chef/AddMenuPage';
import ChefHomeHostingPage from './pages/chef/ChefHomeHostingPage';

// Client Pages
import ClientDashboardLayout from './pages/client/ClientDashboardLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientProfilePage from './pages/client/ClientProfilePage';
import ChefHomeAppointmentsPage from './pages/client/ChefHomeAppointmentsPage';

// B2B Pages
import B2BDashboardLayout from './pages/b2b/B2BDashboardLayout';
import B2BDashboard from './pages/b2b/B2BDashboard';
import B2BPostMission from './pages/b2b/B2BPostMission';
import B2BMissions from './pages/b2b/B2BMissions';
import B2BFindChefs from './pages/b2b/B2BFindChefs';
import B2BInvoicing from './pages/b2b/B2BInvoicing';
import B2BProfile from './pages/b2b/B2BProfile';

import './index.css';

// Simplified ProtectedRoute logic
const ProtectedRoute: React.FC<{ allowedRoles: string[], children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return allowedRoles.includes(role!) ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/chefs" element={<FindChefPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/logiciel" element={<LogicielPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/chefs/:chefId/menus" element={<ChefMenuPage />} />
      </Route>

      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Routes */}
      <Route 
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardHomePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="chefs" element={<AdminChefsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="disputes" element={<AdminDisputesPage />} />
      </Route>

      {/* Chef Routes */}
      <Route 
        path="/chef-dashboard"
        element={
          <ProtectedRoute allowedRoles={['chef']}>
            <ChefDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ChefDashboard />} />
        <Route path="profile" element={<Navigate to="/chef-dashboard/profile/personal-info" replace />} />
        <Route path="profile/personal-info" element={<PersonalInfoPage />} />
        <Route path="profile/specialties" element={<SpecialtiesPage />} />
        <Route path="profile/documents" element={<DocumentsPage />} />
        <Route path="profile/certifications" element={<CertificationsPage />} />
        <Route path="profile/service-area" element={<ServiceAreaPage />} />
        <Route path="menus" element={<ChefMenus />} />
        <Route path="menus/new" element={<AddMenuPage />} />
        <Route path="planning" element={<ChefPlanning />} />
        <Route path="home-hosting" element={<ChefHomeHostingPage />} />
        <Route path="earnings" element={<ChefEarnings />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Client Routes */}
      <Route 
        path="/client-dashboard"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ClientDashboard />} />
        <Route path="profile" element={<ClientProfilePage />} />
        <Route path="chef-home" element={<ChefHomeAppointmentsPage />} />
      </Route>

      {/* B2B Routes */}
      <Route 
        path="/b2b-dashboard"
        element={
          <ProtectedRoute allowedRoles={['b2b']}>
            <B2BDashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<B2BDashboard />} />
        <Route path="post-mission" element={<B2BPostMission />} />
        <Route path="missions" element={<B2BMissions />} />
        <Route path="find-chefs" element={<B2BFindChefs />} />
        <Route path="invoicing" element={<B2BInvoicing />} />
        <Route path="profile" element={<B2BProfile />} />
      </Route>

    </Routes>
  );
}

const Root = () => (
  <AuthProvider>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </AuthProvider>
);

export default Root;
