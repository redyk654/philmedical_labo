import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Beaker } from 'lucide-react';
import LoginForm from '../components/LoginForm.tsx';
import { login } from '../services/auth.tsx';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    try {
      await login(username, password);
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Beaker className="w-12 h-12 text-[#464E77]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-wide mb-2">
            Laboratoire
          </h1>
          <h2 className="text-xl text-gray-600">
            Connexion
          </h2>
        </div>

        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
};

export default LoginPage;