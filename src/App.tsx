import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HeaderLayout from './components/HeaderLayout.tsx';
import LoginPage from './pages/LoginPage.tsx';
import HomePage from './pages/HomePage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import EditProfilePage from './pages/EditProfilePage.tsx';
import { isAuthenticated } from './services/auth.tsx';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <HeaderLayout>
            <LoginPage />
          </HeaderLayout>
        } />
        
        <Route path="/" element={
          <PrivateRoute>
            <HeaderLayout>
              <HomePage />
            </HeaderLayout>
          </PrivateRoute>
        } />
        
        <Route path="/profile" element={
          <PrivateRoute>
            <HeaderLayout>
              <ProfilePage />
            </HeaderLayout>
          </PrivateRoute>
        } />
        
        <Route path="/edit-profile" element={
          <PrivateRoute>
            <HeaderLayout>
              <EditProfilePage />
            </HeaderLayout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;