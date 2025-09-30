
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicHeader from '../../components/layout/PublicHeader';

const ClientDashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default ClientDashboardLayout;
