import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './Firebase';
import PlanSelection from './components/PlanSelection';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import SurveyQuestions from './components/SurveyQuestions';
import SurveySummary from './components/SurveySummary';
import Profile from './components/Profile';
import Referrals from './components/Referrals';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { Spinner } from 'react-bootstrap';

const AppRoutes = () => {
  const [user, loading] = useAuthState(auth);
  const location = useLocation(); // Now inside <Router>

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/plan-selection" element={<PlanSelection />} />
        <Route
          path="/login"
          element={
            user && location.state?.from !== '/plan-selection' ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/register"
          element={
            user && location.state?.from !== '/plan-selection' ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey/:id"
          element={
            <ProtectedRoute>
              <SurveyQuestions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey/:id/summary"
          element={
            <ProtectedRoute>
              <SurveySummary />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute>
              <Referrals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/plan-selection" replace />} />
      </Routes>
      <Footer />
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </Router>
  );
};

export default App;