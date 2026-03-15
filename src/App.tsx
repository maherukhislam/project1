import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { handleGoogleRedirect } from './lib/googleAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Destinations from './pages/Destinations';
import Universities from './pages/Universities';
import Scholarships from './pages/Scholarships';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Dashboard Pages
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardHome from './pages/dashboard/DashboardHome';
import Profile from './pages/dashboard/Profile';
import UniversityMatch from './pages/dashboard/UniversityMatch';
import Applications from './pages/dashboard/Applications';
import Documents from './pages/dashboard/Documents';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudents from './pages/admin/AdminStudents';
import AdminApplications from './pages/admin/AdminApplications';
import AdminUniversities from './pages/admin/AdminUniversities';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminScholarships from './pages/admin/AdminScholarships';
import AdminDocuments from './pages/admin/AdminDocuments';
import AdminBlog from './pages/admin/AdminBlog';

// Handle Google redirect on app load
handleGoogleRedirect();

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/destinations" element={<PublicLayout><Destinations /></PublicLayout>} />
          <Route path="/universities" element={<PublicLayout><Universities /></PublicLayout>} />
          <Route path="/scholarships" element={<PublicLayout><Scholarships /></PublicLayout>} />
          <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Student Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="match" element={<UniversityMatch />} />
            <Route path="applications" element={<Applications />} />
            <Route path="documents" element={<Documents />} />
            <Route path="scholarships" element={<Scholarships />} />
            <Route path="universities" element={<Universities />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="universities" element={<AdminUniversities />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="scholarships" element={<AdminScholarships />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="blog" element={<AdminBlog />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
