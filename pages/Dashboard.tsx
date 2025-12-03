import React, { useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { AccountWithBalance, AccountType } from '../types';
import { Wallet, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const location = useLocation();
  const [accounts, setAccounts] = useState<AccountWithBalance[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accData, txData] = await Promise.all([
          accountService.getAccountsWithBalance(),
          transactionService.getRecentTransactions(5)
        ]);
        setAccounts(accData);
        setRecentTx(txData || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.state]);

  useEffect(() => {
    const handleFocus = () => {
      // Refresh data when user returns to the tab
      accountService.getAccountsWithBalance().then(setAccounts).catch(console.error);
      transactionService.getRecentTransactions(5).then(setRecentTx).catch(console.error);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const totalBalance = accounts
    .filter(a => a.type !== AccountType.CREDIT && a.type !== AccountType.OTHER)
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  if (loading) return <div className="flex justify-center p-12">Cargando datos financieros...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Hola, Alejandro</h1>
        <p className="text-slate-500">Aquí está el resumen de tus finanzas hoy.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200">
          <div className="flex items-center gap-3 mb-2 opacity-90">
            <Wallet size={20} />
            <span className="font-medium">Patrimonio Líquido</span>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          <div className="mt-4 text-xs bg-indigo-500 inline-block px-2 py-1 rounded text-white/90">
            Cuentas de Débito y Ahorro
          </div>
        </div>

        {accounts.map(acc => (
          <div key={acc.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{acc.type}</span>
                {acc.type === AccountType.CREDIT && (
                   <span className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Crédito</span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 truncate">{acc.name}</h3>
              <p className="text-sm text-slate-400">{acc.bank}</p>
            </div>
            <div className="mt-4">
               <p className={`text-2xl font-mono font-medium ${acc.current_balance && acc.current_balance < 0 ? 'text-red-500' : 'text-slate-700'}`}>
                 {formatCurrency(acc.current_balance || 0)}
               </p>
               {acc.credit_limit && (
                 <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                   <div 
                     className="bg-orange-400 h-1.5 rounded-full" 
                     style={{ width: `${Math.min((Math.abs(acc.current_balance || 0) / acc.credit_limit) * 100, 100)}%` }}
                   ></div>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Movimientos Recientes</h3>
             <Link to="/transactions" className="text-sm text-indigo-600 hover:underline">Ver todos</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTx.length === 0 ? (
              <div className="p-6 text-center text-slate-400">Sin movimientos registrados</div>
            ) : (
              recentTx.map((tx: any) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'ingreso' ? 'bg-green-100 text-green-600' : 
                      tx.type === 'gasto' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {tx.type === 'ingreso' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{tx.description}</p>
                      <p className="text-xs text-slate-500">{tx.accounts?.name} • {tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-medium ${tx.type === 'ingreso' ? 'text-green-600' : 'text-slate-900'}`}>
                    {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions CTA */}
        <div className="bg-slate-900 text-white rounded-xl p-8 flex flex-col justify-center items-start bg-[url('https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&q=80&w=800&h=400')] bg-cover bg-center bg-blend-multiply">
           <h3 className="text-2xl font-bold mb-2">¿Nuevos gastos?</h3>
           <p className="text-slate-300 mb-6 max-w-xs">Registra tus tickets subiendo una foto o manualmente para mantener tus cuentas al día.</p>
           <Link to="/register" className="bg-white text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
             Registrar Ahora <ArrowRight size={18} />
           </Link>
        </div>
      </div>
    </div>
  );
};
