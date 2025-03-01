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

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/philmedical/laboratoire/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/philmedical/laboratoire/login" element={
          <HeaderLayout>
            <LoginPage />
          </HeaderLayout>
        } />
        
        <Route path="/philmedical/laboratoire" element={
          <PrivateRoute>
            <HeaderLayout>
              <HomePage />
            </HeaderLayout>
          </PrivateRoute>
        } />
        
        <Route path="/philmedical/laboratoire/profile" element={
          <PrivateRoute>
            <HeaderLayout>
              <ProfilePage />
            </HeaderLayout>
          </PrivateRoute>
        } />
        
        <Route path="/philmedical/laboratoire/edit-profile" element={
          <PrivateRoute>
            <HeaderLayout>
              <EditProfilePage />
            </HeaderLayout>
          </PrivateRoute>
        } />
                <Route path="/philmedical/laboratoire/configurations" element={
          <PrivateRoute>
            <HeaderLayout>
              <ConfigurationsPage />
            </HeaderLayout>
          </PrivateRoute>
        } />
        <Route path="/philmedical/laboratoire/examination-references" element={
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