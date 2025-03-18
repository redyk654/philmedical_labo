import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HeaderLayout from './components/HeaderLayout.tsx';
import LoginPage from './pages/LoginPage.tsx';
import HomePage from './pages/HomePage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import EditProfilePage from './pages/EditProfilePage.tsx';
import { isAuthenticated } from './services/auth.tsx';
import ConfigurationsPage from './pages/ConfigurationsPage.tsx';
import ExaminationReferencesPage from './pages/ExaminationReferencesPage.tsx';
import ListingPage from './pages/ListingPage.tsx';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter basename="/philmedical/laboratoire">
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

        <Route path="/listing-bilan" element={
          <PrivateRoute>
            <HeaderLayout>
              <ListingPage />
            </HeaderLayout>
          </PrivateRoute>
        } />

        <Route path="/configurations" element={
          <PrivateRoute>
            <HeaderLayout>
              <ConfigurationsPage />
            </HeaderLayout>
          </PrivateRoute>
        } />
        <Route path="/examination-references" element={
          <PrivateRoute>
            <HeaderLayout>
              <ExaminationReferencesPage />
            </HeaderLayout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;