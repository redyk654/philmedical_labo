import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Beaker } from 'lucide-react';
import { logout } from '../services/auth.tsx';

const HeaderLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#464E77] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Beaker className="w-8 h-8" />
              <Link to="/" className="text-xl font-bold">
                LABORATOIRE
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md ${
                  location.pathname === '/' ? 'bg-[#55AF7F]' : 'hover:bg-[#363c5d]'
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md ${
                  location.pathname === '/profile' ? 'bg-[#55AF7F]' : 'hover:bg-[#363c5d]'
                }`}
              >
                Profil
              </Link>
              <Link
                to="/edit-profile"
                className={`px-3 py-2 rounded-md ${
                  location.pathname === '/edit-profile' ? 'bg-[#55AF7F]' : 'hover:bg-[#363c5d]'
                }`}
              >
                Editer profil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition-colors"
              >
                Deconnection
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="bg-[#464E77] text-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 tous droits réservés - Philmedical</p>
        </div>
      </footer>
    </div>
  );
};

export default HeaderLayout;