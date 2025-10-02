import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PublicHeader from '../../components/layout/PublicHeader';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'client' | 'chef'>('client');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, googleLogin, facebookLogin } = useAuth();
  const navigate = useNavigate();

  const handleGoogleRegister = async () => {
    try {
      await googleLogin();
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Google registration failed. Please try again.');
    }
  };

  const handleFacebookRegister = async () => {
    try {
      await facebookLogin();
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Facebook registration failed. Please try again.');
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password, role, phone });
      navigate('/login'); // Redirect to login after successful registration
    } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />
      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">Inscription</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Je suis un</label>
            <div className="flex mt-2 space-x-4">
              <label className="flex items-center">
                <input type="radio" name="role" value="client" checked={role === 'client'} onChange={() => setRole('client')} className="form-radio h-4 w-4 text-orange-600"/>
                <span className="ml-2 text-gray-700">Client</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="role" value="chef" checked={role === 'chef'} onChange={() => setRole('chef')} className="form-radio h-4 w-4 text-orange-600"/>
                <span className="ml-2 text-gray-700">Chef</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="name">Nom complet</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 mt-1 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 mt-1 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="phone">Téléphone</label>
            <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 mt-1 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Mot de passe</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 mt-1 border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="confirm-password">Confirmer le mot de passe</label>
            <input type="password" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3 mt-1 border rounded-lg" required />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-orange-300">
            {loading ? 'Creation...' : 'Creer un compte'}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500">Ou s'inscrire avec</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button
                type="button"
                onClick={handleGoogleRegister}
                className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-50 transition duration-300"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M15.5 16.5c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z"/><path d="M15.5 16.5c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4Z"/><path d="M8.5 12.5c0-2.2 1.8-4 4-4"/><path d="M12.5 8.5c2.2 0 4 1.8 4 4"/><path d="M12 22a10 10 0 0 0 10-10h0a10 10 0 0 0-10-10h0a10 10 0 0 0-10 10h0a10 10 0 0 0 10 10Z"/><path d="M12 22a10 10 0 0 0 10-10h0a10 10 0 0 0-10-10h0a10 10 0 0 0-10 10h0a10 10 0 0 0 10 10Z"/><path d="M12.5 15.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>
                Google
            </button>
            <button
                type="button"
                onClick={handleFacebookRegister}
                className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
