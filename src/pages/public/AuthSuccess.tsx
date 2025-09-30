import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const AuthSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      loginSuccess(token);
      navigate('/dashboard'); // Redirect to dashboard or appropriate page
    } else {
      navigate('/login'); // Redirect to login if no token
    }
  }, [location, navigate, loginSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoadingSpinner />
      <p className="ml-3 text-lg text-gray-700">Authentification réussie, redirection...</p>
    </div>
  );
};

export default AuthSuccess;
