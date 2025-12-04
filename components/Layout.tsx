import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Receipt, PlusCircle, LogOut, AlertTriangle } from 'lucide-react';
import { Session } from '@supabase/supabase-js';
import { supabase, isMockMode } from '../lib/supabaseClient';

export const Layout: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (isMockMode) {
      setSession({ user: { id: 'demo-user-id', email: 'demo@finai.app' } } as Session);
      setLoadingSession(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session);
      })
      .finally(() => setLoadingSession(false));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (!isMockMode) {
      await supabase.auth.signOut();
    }
    window.location.reload();
  };

  const navItems = [
    { to: '/', label: 'Inicio', icon: <LayoutDashboard size={20} /> },
    { to: '/accounts', label: 'Mis Cuentas', icon: <CreditCard size={20} /> },
    { to: '/transactions', label: 'Movimientos', icon: <Receipt size={20} /> },
    { to: '/register', label: 'Registrar', icon: <PlusCircle size={20} /> },
  ];

  if (loadingSession) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">
        Validando sesión...
      </div>
    );
  }

  if (!session && !isMockMode) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">
        No hay sesión activa.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2">
            FinAI
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 font-medium' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 w-full text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Banner for Mock Mode */}
        {isMockMode && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 text-sm text-center font-medium flex justify-center items-center gap-2 border-b border-orange-200">
             <AlertTriangle size={16} />
             Modo Demo: Usando datos de prueba (Sin conexión a Supabase)
          </div>
        )}

        {/* Mobile Header */}
        <div className="md:hidden w-full bg-white border-b z-10 px-4 py-3 flex justify-between items-center">
           <span className="font-bold text-indigo-600">FinAI</span>
        </div>

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 pt-4">
          <div className="max-w-5xl mx-auto pb-20 md:pb-0">
            <Outlet />
          </div>
        </main>
      </div>
      
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t flex justify-around p-3 z-10 pb-safe">
         {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs ${
                  isActive ? 'text-indigo-600' : 'text-slate-500'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
      </nav>
    </div>
  );
};