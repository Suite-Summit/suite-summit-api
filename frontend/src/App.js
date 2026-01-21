import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CompanyIntake from "./pages/CompanyIntake";
import CompanyDashboard from "./pages/CompanyDashboard";
import AIInsights from "./pages/AIInsights";
import MatchedExecutives from "./pages/MatchedExecutives";
import ExecutiveApplication from "./pages/ExecutiveApplication";
import ExecutiveDashboard from "./pages/ExecutiveDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-mist">
        <div className="animate-pulse text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Dashboard Router - redirects based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'company':
      return <Navigate to="/company/dashboard" replace />;
    case 'executive':
      return <Navigate to="/executive/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Dashboard Router */}
            <Route path="/dashboard" element={<DashboardRouter />} />
            
            {/* Company Routes */}
            <Route path="/company/intake" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyIntake />
              </ProtectedRoute>
            } />
            <Route path="/company/dashboard" element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            } />
            <Route path="/company/insights" element={
              <ProtectedRoute allowedRoles={['company']}>
                <AIInsights />
              </ProtectedRoute>
            } />
            <Route path="/company/matches" element={
              <ProtectedRoute allowedRoles={['company']}>
                <MatchedExecutives />
              </ProtectedRoute>
            } />
            
            {/* Executive Routes */}
            <Route path="/executive/apply" element={
              <ProtectedRoute allowedRoles={['executive']}>
                <ExecutiveApplication />
              </ProtectedRoute>
            } />
            <Route path="/executive/dashboard" element={
              <ProtectedRoute allowedRoles={['executive']}>
                <ExecutiveDashboard />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App;
