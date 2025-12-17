 import React from 'react';
 import { Navigate, Route, Routes } from 'react-router-dom';
 import DashboardLayout from './components/layout/DashboardLayout';
 import LoginPage from './pages/LoginPage';
 import RegisterPage from './pages/RegisterPage';
 import DashboardPage from './pages/DashboardPage';
 import UsersPage from './pages/UsersPage';
 import SettingsPage from './pages/SettingsPage';
 import HomepageDetailsPage from './pages/HomepageDetailsPage';
 import AboutDetailsPage from './pages/AboutDetailsPage';
 import GalleryDetailsPage from './pages/GalleryDetailsPage';
 import AhvalDetailsPage from './pages/AhvalDetailsPage';
 import LeaderDetailsPage from './pages/LeaderDetailsPage';
 import UnauthorizedPage from './pages/UnauthorizedPage';
 import NotFoundPage from './pages/NotFoundPage';
 import ProtectedRoute from './utils/ProtectedRoute';

 function App() {
   return (
     <Routes>
       <Route path="/login" element={<LoginPage />} />
       <Route path="/register" element={<RegisterPage />} />
       <Route path="/unauthorized" element={<UnauthorizedPage />} />

       <Route
         path="/"
         element={
           <ProtectedRoute>
             <DashboardLayout />
           </ProtectedRoute>
         }
       >
         <Route index element={<DashboardPage />} />
         <Route
           path="users"
           element={
             <ProtectedRoute requiredRole="admin">
               <UsersPage />
             </ProtectedRoute>
           }
         />
         <Route path="settings" element={<SettingsPage />} />
         <Route path="homepage-details" element={<HomepageDetailsPage />} />
         <Route path="about-details" element={<AboutDetailsPage />} />
         <Route path="gallery-details" element={<GalleryDetailsPage />} />
         <Route path="ahval-details" element={<AhvalDetailsPage />} />
         <Route path="leader-details" element={<LeaderDetailsPage />} />
       </Route>

       <Route path="/dashboard" element={<Navigate to="/" replace />} />
       <Route path="*" element={<NotFoundPage />} />
     </Routes>
   );
 }

 export default App;
