import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Salesmen from './pages/Salesmen';
import Customers from './pages/Customers';
import Vendors from './pages/Vendors';
import Items from './pages/Items';
import Cargo from './pages/Cargo';
import Orders from './pages/Orders';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Layout><Dashboard /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/salesmen" 
            element={
              <PrivateRoute>
                <Layout><Salesmen /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/customers" 
            element={
              <PrivateRoute>
                <Layout><Customers /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/vendors" 
            element={
              <PrivateRoute>
                <Layout><Vendors /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/items" 
            element={
              <PrivateRoute>
                <Layout><Items /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/cargo" 
            element={
              <PrivateRoute>
                <Layout><Cargo /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/orders" 
            element={
              <PrivateRoute>
                <Layout><Orders /></Layout>
              </PrivateRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
