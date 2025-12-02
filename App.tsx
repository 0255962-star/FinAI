import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { supabase, isMockMode } from './lib/supabaseClient';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { AccountsPage } from './pages/Accounts';
import { TransactionRegister } from './pages/TransactionRegister';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      // In demo mode, simulate a logged-in user immediately
      setSession({ user: { email: 'demo@finai.app', id: 'demo-user-id' } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.error("Supabase connection failed:", err);
      // Even if it fails, stop loading so we don't get stuck on a white screen
      setLoading(false); 
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400">Cargando FinAI...</div>;
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="transactions" element={<div className="p-4 text-center text-slate-500">Listado completo próximamente... (Usa el Dashboard por ahora)</div>} />
          <Route path="register" element={<TransactionRegister />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isMockMode) {
      alert("Modo Demo: Ingresando automáticamente...");
      window.location.reload(); // Simple reload to trigger the session mock
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) alert(error.message);
    else alert('¡Revisa tu correo para el link de acceso!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">FinAI</h1>
        <p className="text-slate-500 mb-8">Gestión financiera inteligente.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              placeholder="tu@email.com"
              className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : (isMockMode ? 'Entrar (Demo)' : 'Entrar con Magic Link')}
          </button>
        </form>
        <div className="mt-4 text-xs text-center text-slate-400">
           {isMockMode 
             ? "⚠️ Modo Demo Activo: No se requiere conexión a Supabase." 
             : "Nota: Necesitas un proyecto Supabase configurado y las claves en src/lib/supabaseClient.ts"}
        </div>
      </div>
    </div>
  );
}

export default App;
