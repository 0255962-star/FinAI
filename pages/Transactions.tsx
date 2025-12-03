import React, { useEffect, useState } from 'react';
import { transactionService } from '../services/transactionService';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const TransactionsPage: React.FC = () => {
  const location = useLocation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await transactionService.listTransactionsForUser();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to load transactions list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [location.pathname, location.state]);

  useEffect(() => {
    const handleFocus = () => load();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);

  const typeBadge = (type: string) => {
    if (type === 'ingreso') return { classes: 'bg-green-100 text-green-700', label: 'Ingreso' };
    if (type === 'gasto') return { classes: 'bg-red-100 text-red-700', label: 'Gasto' };
    if (type === 'traspaso_salida') return { classes: 'bg-blue-100 text-blue-700', label: 'Traspaso Salida' };
    return { classes: 'bg-blue-100 text-blue-700', label: 'Traspaso Entrada' };
  };

  if (loading) return <div className="p-6 text-center text-slate-500">Cargando movimientos...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-800">Movimientos</h2>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-100">
          {transactions.length === 0 && (
            <div className="p-6 text-center text-slate-400">Aún no hay movimientos registrados.</div>
          )}
          {transactions.map((tx) => {
            const badge = typeBadge(tx.type);
            return (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {tx.type === 'ingreso' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{tx.description}</p>
                    <p className="text-xs text-slate-500">
                      {tx.accounts?.name || 'Cuenta'} • {tx.date}
                    </p>
                    <span className={`text-[11px] inline-flex px-2 py-1 rounded-full ${badge.classes}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
                <span className={`font-mono font-medium ${tx.type === 'ingreso' ? 'text-green-600' : 'text-slate-900'}`}>
                  {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
