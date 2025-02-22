import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Assessments } from './pages/Assessments';
import { Reports } from './pages/Reports';
import { ExamSession } from './components/ExamSession';
import { CreateAssessment } from './components/CreateAssessment';

function PrivateRoute({ children, allowedRole }: { children: React.ReactNode; allowedRole?: string }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'admin' ? '/admin/assessments' : '/dashboard'} />;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Admin Routes */}
          <Route
            path="/admin/assessments"
            element={
              <PrivateRoute allowedRole="admin">
                <main className="container mx-auto px-4 py-8">
                  <Assessments />
                </main>
              </PrivateRoute>
            }
          />
          <Route
            path="/create-assessment"
            element={
              <PrivateRoute allowedRole="admin">
                <main className="container mx-auto px-4 py-8">
                  <CreateAssessment />
                </main>
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute allowedRole="admin">
                <main className="container mx-auto px-4 py-8">
                  <Reports />
                </main>
              </PrivateRoute>
            }
          />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRole="user">
                <main className="container mx-auto px-4 py-8">
                  <Dashboard />
                </main>
              </PrivateRoute>
            }
          />
          <Route
            path="/assessments"
            element={
              <PrivateRoute allowedRole="user">
                <main className="container mx-auto px-4 py-8">
                  <Assessments />
                </main>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <main className="container mx-auto px-4 py-8">
                  <Reports />
                </main>
              </PrivateRoute>
            }
          />
          <Route
            path="/exam-session"
            element={
              <PrivateRoute allowedRole="user">
                <main className="container mx-auto px-4 py-8">
                  <ExamSession />
                </main>
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
