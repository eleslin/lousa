// App.tsx - Enrutamiento con protección y redirección según login

import { useEffect, useState, type JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Splash from './components/Splash';
import { supabase } from './core/auth';
import Home from './components/Home';
import ListView from './components/ListView';
import Profile from './components/Profile';
import History from './components/History';
import ShareInvite from './components/ShareInvite';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuth(!!session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuth(!!session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (isAuth === null) return <p>Cargando...</p>;
  return isAuth ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list/:id"
          element={
            <ProtectedRoute>
              <ListView />
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
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:id" element={<ShareInvite />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}
