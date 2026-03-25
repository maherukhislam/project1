import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CmsProvider } from './contexts/CmsContext';
import { handleGoogleRedirect } from './lib/googleAuth';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Public Pages
const Home           = lazy(() => import('./pages/Home'));
const About          = lazy(() => import('./pages/About'));
const Services       = lazy(() => import('./pages/Services'));
const Destinations   = lazy(() => import('./pages/Destinations'));
const Universities   = lazy(() => import('./pages/Universities'));
const Scholarships   = lazy(() => import('./pages/Scholarships'));
const Blog           = lazy(() => import('./pages/Blog'));
const BlogPost       = lazy(() => import('./pages/BlogPost'));
const Contact        = lazy(() => import('./pages/Contact'));
const Login          = lazy(() => import('./pages/Login'));
const Signup         = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/ResetPassword'));
const Terms          = lazy(() => import('./pages/Terms'));
const Privacy        = lazy(() => import('./pages/Privacy'));

// Shared
const ChangePassword = lazy(() => import('./pages/Shared/ChangePassword'));

// Dashboard Pages
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const DashboardHome   = lazy(() => import('./pages/dashboard/DashboardHome'));
const Profile         = lazy(() => import('./pages/dashboard/Profile'));
const UniversityMatch = lazy(() => import('./pages/dashboard/UniversityMatch'));
const Applications    = lazy(() => import('./pages/dashboard/Applications'));
const Documents       = lazy(() => import('./pages/dashboard/Documents'));
const HelpSupport     = lazy(() => import('./pages/dashboard/HelpSupport'));

// Admin Pages
const AdminLayout       = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard    = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminStudents     = lazy(() => import('./pages/admin/AdminStudents'));
const AdminAdmins       = lazy(() => import('./pages/admin/AdminAdmins'));
const AdminApplications = lazy(() => import('./pages/admin/AdminApplications'));
const AdminUniversities = lazy(() => import('./pages/admin/AdminUniversities'));
const AdminPrograms     = lazy(() => import('./pages/admin/AdminPrograms'));
const AdminScholarships = lazy(() => import('./pages/admin/AdminScholarships'));
const AdminDocuments    = lazy(() => import('./pages/admin/AdminDocuments'));
const AdminBlog         = lazy(() => import('./pages/admin/AdminBlog'));
const AdminCMS          = lazy(() => import('./pages/admin/AdminCMS'));
const AdminCounselors   = lazy(() => import('./pages/admin/AdminCounselors'));
const AdminDestinations = lazy(() => import('./pages/admin/AdminDestinations'));
const AdminSupport      = lazy(() => import('./pages/admin/AdminSupport'));

// Counselor Pages
const CounselorLayout       = lazy(() => import('./pages/counselor/CounselorLayout'));
const CounselorDashboard    = lazy(() => import('./pages/counselor/CounselorDashboard'));
const CounselorStudents     = lazy(() => import('./pages/counselor/CounselorStudents'));
const CounselorApplications = lazy(() => import('./pages/counselor/CounselorApplications'));
const CounselorDocuments    = lazy(() => import('./pages/counselor/CounselorDocuments'));
const CounselorSupport      = lazy(() => import('./pages/counselor/CounselorSupport'));


const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50">
    <LoadingSpinner size="lg" />
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; counselorOnly?: boolean }> = ({ children, adminOnly, counselorOnly }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return <PageFallback />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && profile?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (counselorOnly && profile?.role !== 'counselor') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

const NotFound: React.FC = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 text-center px-6">
    <h1 className="text-8xl font-bold text-sky-500 mb-4">404</h1>
    <h2 className="text-2xl font-semibold text-slate-800 mb-2">Page Not Found</h2>
    <p className="text-slate-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" className="px-6 py-3 rounded-xl text-white bg-gradient-to-r from-sky-500 to-blue-600 font-medium hover:from-sky-600 hover:to-blue-700 transition-all">
      Go Home
    </a>
  </div>
);

function App() {
  // Handle Google OAuth redirect inside React lifecycle so errors are caught
  React.useEffect(() => {
    void handleGoogleRedirect();
  }, []);

  return (
    <CmsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/"                 element={<PublicLayout><Home /></PublicLayout>} />
              <Route path="/about"            element={<PublicLayout><About /></PublicLayout>} />
              <Route path="/services"         element={<PublicLayout><Services /></PublicLayout>} />
              <Route path="/destinations"     element={<PublicLayout><Destinations /></PublicLayout>} />
              <Route path="/universities"     element={<PublicLayout><Universities /></PublicLayout>} />
              <Route path="/scholarships"     element={<PublicLayout><Scholarships /></PublicLayout>} />
              <Route path="/blog"             element={<PublicLayout><Blog /></PublicLayout>} />
              <Route path="/blog/:slug"      element={<PublicLayout><BlogPost /></PublicLayout>} />
              <Route path="/contact"          element={<PublicLayout><Contact /></PublicLayout>} />
              <Route path="/login"            element={<Login />} />
              <Route path="/signup"           element={<Signup />} />
              <Route path="/forgot-password"  element={<ForgotPassword />} />
              <Route path="/reset-password"   element={<ResetPassword />} />
              <Route path="/terms"            element={<PublicLayout><Terms /></PublicLayout>} />
              <Route path="/privacy"          element={<PublicLayout><Privacy /></PublicLayout>} />

              {/* Student Dashboard Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index             element={<DashboardHome />} />
                <Route path="profile"    element={<Profile />} />
                <Route path="match"      element={<UniversityMatch />} />
                <Route path="applications" element={<Applications />} />
                <Route path="documents"  element={<Documents />} />
                <Route path="scholarships" element={<Scholarships />} />
                <Route path="universities" element={<Universities />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="support"    element={<HelpSupport />} />
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
                <Route index                element={<AdminDashboard />} />
                <Route path="students"      element={<AdminStudents />} />
                <Route path="admins"        element={<AdminAdmins />} />
                <Route path="counselors"    element={<AdminCounselors />} />
                <Route path="applications"  element={<AdminApplications />} />
                <Route path="universities"  element={<AdminUniversities />} />
                <Route path="programs"      element={<AdminPrograms />} />
                <Route path="scholarships"  element={<AdminScholarships />} />
                <Route path="documents"     element={<AdminDocuments />} />
                <Route path="blog"          element={<AdminBlog />} />
                <Route path="cms"           element={<AdminCMS />} />
                <Route path="destinations"  element={<AdminDestinations />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="support"       element={<AdminSupport />} />
              </Route>

              {/* Counselor Routes */}
              <Route
                path="/counselor"
                element={
                  <ProtectedRoute counselorOnly>
                    <CounselorLayout />
                  </ProtectedRoute>
                }
              >
                <Route index                element={<CounselorDashboard />} />
                <Route path="students"      element={<CounselorStudents />} />
                <Route path="applications"  element={<CounselorApplications />} />
                <Route path="documents"     element={<CounselorDocuments />} />
                <Route path="change-password" element={<ChangePassword />} />
                <Route path="support"       element={<CounselorSupport />} />
              </Route>

              {/* Catch all — show 404 instead of silent redirect */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </CmsProvider>
  );
}

export default App;
