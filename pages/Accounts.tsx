import React, { useEffect, useState } from 'react';
import { accountService } from '../services/accountService';
import { Account, AccountType } from '../types';
import { Plus, Edit2, CheckCircle, XCircle } from 'lucide-react';

export const AccountsPage: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Partial<Account>>({
    name: '',
    bank: '',
    type: AccountType.DEBIT,
    currency: 'MXN',
    initial_balance: 0,
    credit_limit: 0,
    is_active: true
  });

  const loadAccounts = async () => {
    const data = await accountService.getAccounts();
    setAccounts(data);
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentAccount.id) {
        await accountService.updateAccount(currentAccount.id, currentAccount);
      } else {
        await accountService.createAccount(currentAccount as Account);
      }
      setIsEditing(false);
      setCurrentAccount({
        name: '',
        bank: '',
        type: AccountType.DEBIT,
        currency: 'MXN',
        initial_balance: 0,
        credit_limit: 0,
        is_active: true
      });
      loadAccounts();
    } catch (error) {
      alert('Error saving account');
      console.error(error);
    }
  };

  const handleEdit = (acc: Account) => {
    setCurrentAccount(acc);
    setIsEditing(true);
  };

  const toggleStatus = async (acc: Account) => {
    await accountService.toggleAccountStatus(acc.id, !acc.is_active);
    loadAccounts();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Configuración de Cuentas</h2>
        <button 
          onClick={() => setIsEditing(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
        >
          <Plus size={18} /> Nueva Cuenta
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg mb-4">{currentAccount.id ? 'Editar Cuenta' : 'Crear Nueva Cuenta'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre (Alias)</label>
              <input 
                type="text" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={currentAccount.name}
                onChange={e => setCurrentAccount({...currentAccount, name: e.target.value})}
                placeholder="Ej. Nómina Banorte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Banco</label>
              <input 
                type="text" 
                required
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={currentAccount.bank}
                onChange={e => setCurrentAccount({...currentAccount, bank: e.target.value})}
                placeholder="Ej. Banorte"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Cuenta</label>
              <select 
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={currentAccount.type}
                onChange={e => setCurrentAccount({...currentAccount, type: e.target.value as AccountType})}
              >
                {Object.values(AccountType).map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Saldo Inicial</label>
              <input 
                type="number" 
                step="0.01"
                className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={currentAccount.initial_balance}
                onChange={e => setCurrentAccount({...currentAccount, initial_balance: parseFloat(e.target.value)})}
              />
            </div>
            {currentAccount.type === AccountType.CREDIT && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Límite de Crédito</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={
                    currentAccount.credit_limit === null || currentAccount.credit_limit === undefined
                      ? ''
                      : String(currentAccount.credit_limit)
                  }
                  onChange={e => {
                    const val = e.target.value;
                    setCurrentAccount({
                      ...currentAccount,
                      credit_limit: val === '' ? undefined : parseFloat(val)
                    });
                  }}
                />
              </div>
            )}
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600">Nombre</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Banco</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Tipo</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Saldo Inicial</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-center">Estado</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {accounts.map(acc => (
              <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium text-slate-800">{acc.name}</td>
                <td className="p-4 text-slate-500">{acc.bank}</td>
                <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs uppercase font-semibold text-slate-600">{acc.type}</span></td>
                <td className="p-4 text-right font-mono text-slate-700">${acc.initial_balance}</td>
                <td className="p-4 text-center">
                  <button onClick={() => toggleStatus(acc)} title={acc.is_active ? "Desactivar" : "Activar"}>
                    {acc.is_active 
                      ? <CheckCircle size={18} className="text-green-500 mx-auto" /> 
                      : <XCircle size={18} className="text-slate-300 mx-auto" />}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => handleEdit(acc)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
