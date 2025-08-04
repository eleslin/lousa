// Splash.tsx - Página de bienvenida y login (email + Google sin @supabase/auth-ui-react)

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../styles/splash.css';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export default function Splash() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (session) {
    window.location.href = '/home';
    return null;
  }

  const handleEmailLogin = async () => {
    setLoading(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Te hemos enviado un enlace mágico al correo.');
    }
    setLoading(false);
  };

   return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-4xl font-bold text-white mb-2">Lousa</h1>
          <p className="text-white/80 text-lg">Tu lista de la compra colaborativa, simple y rápida</p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          />
          
          <button 
            onClick={handleEmailLogin}
            disabled={loading || !email}
            className="w-full py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/30"
          >
            {loading ? 'Enviando...' : 'Acceder con Email'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/30"></div>
            </div>
          </div>
        </div>

        {message && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-100 text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
