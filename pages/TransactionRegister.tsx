import React, { useState, useEffect } from 'react';
import { Camera, Table as TableIcon, Save, Trash2, ArrowRight } from 'lucide-react';
import { accountService } from '../services/accountService';
import { transactionService } from '../services/transactionService';
import { Account, TransactionDraft, TransactionDirection, NewTransactionPayload } from '../types';
import { useNavigate } from 'react-router-dom';

export const TransactionRegister: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [drafts, setDrafts] = useState<TransactionDraft[]>([]);
  const [loading, setLoading] = useState(false);
  
  // AI State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    accountService.getAccounts().then(data => setAccounts(data.filter(a => a.is_active)));
  }, []);

  // --- HANDLERS ---

  const addEmptyRow = () => {
    setDrafts([...drafts, {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      direction: TransactionDirection.EXPENSE,
      account_id: accounts[0]?.id || '',
    }]);
  };

  const updateDraft = (id: string, field: keyof TransactionDraft, value: any) => {
    setDrafts(drafts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const removeDraft = (id: string) => {
    setDrafts(drafts.filter(d => d.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsAnalyzing(true);
      try {
        const aiDrafts = await transactionService.parseStatementImage(file);
        // Pre-fill account if only 1 exists, otherwise empty
        const preparedDrafts = aiDrafts.map(d => ({
          ...d,
          account_id: accounts.length === 1 ? accounts[0].id : ''
        }));
        setDrafts(preparedDrafts);
        setMode('manual'); // Switch to table view to edit/confirm
      } catch (error) {
        alert('Error analizando la imagen');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSaveAll = async () => {
    if (drafts.length === 0) return;
    
    // Validation
    const invalid = drafts.find(d => !d.account_id || d.amount <= 0 || !d.description);
    if (invalid) {
      alert('Por favor completa todos los campos (Cuenta, Monto > 0, Descripción)');
      return;
    }

    setLoading(true);
    try {
      const payload: NewTransactionPayload[] = drafts.map(d => ({
        date: d.date,
        description: d.description,
        amount: d.amount,
        direction: d.direction,
        account_id: d.account_id,
        related_account_id: d.related_account_id
      }));

      await transactionService.saveTransactions(payload);
      alert('Movimientos guardados correctamente');
      navigate('/');
    } catch (error) {
      alert('Error guardando movimientos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER ---

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Registrar Movimientos</h2>
           <p className="text-slate-500 text-sm">Elige cómo quieres capturar tus gastos o ingresos.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button
            onClick={() => setMode('manual')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${mode === 'manual' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <TableIcon size={18} /> Tabla Manual
          </button>
          <button
            onClick={() => setMode('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${mode === 'ai' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Camera size={18} /> Escanear (IA)
          </button>
        </div>
      </div>

      {mode === 'ai' && (
        <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-12 text-center transition-colors hover:bg-indigo-50">
          {isAnalyzing ? (
            <div className="animate-pulse">
              <div className="h-12 w-12 bg-indigo-200 rounded-full mx-auto mb-4"></div>
              <p className="text-indigo-600 font-medium">Analizando imagen con Claude AI...</p>
              <p className="text-sm text-slate-400">Esto puede tomar unos segundos</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Sube una captura de tus movimientos</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Soporta capturas de pantalla de apps bancarias. La IA extraerá fecha, monto y concepto automáticamente.
              </p>
              <label className="cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors inline-block">
                Seleccionar Imagen
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </>
          )}
        </div>
      )}

      {(mode === 'manual' || drafts.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
             <h3 className="font-semibold text-slate-700">Editor de Movimientos ({drafts.length})</h3>
             <button onClick={addEmptyRow} className="text-sm text-indigo-600 font-medium hover:underline flex items-center gap-1">
               + Agregar Fila
             </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3 text-left w-32">Fecha</th>
                  <th className="px-4 py-3 text-left w-40">Cuenta</th>
                  <th className="px-4 py-3 text-left">Descripción</th>
                  <th className="px-4 py-3 text-left w-32">Monto</th>
                  <th className="px-4 py-3 text-left w-36">Tipo</th>
                  <th className="px-4 py-3 text-left w-40">Detalle</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drafts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No hay filas. Agrega una manualmente o sube una imagen.
                    </td>
                  </tr>
                )}
                {drafts.map((row) => (
                  <tr key={row.id} className="group hover:bg-slate-50">
                    <td className="p-2">
                      <input 
                        type="date" 
                        value={row.date}
                        onChange={(e) => updateDraft(row.id, 'date', e.target.value)}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 border p-1"
                      />
                    </td>
                    <td className="p-2">
                      <select 
                        value={row.account_id}
                        onChange={(e) => updateDraft(row.id, 'account_id', e.target.value)}
                        className={`w-full text-sm border rounded p-1 ${!row.account_id ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                      >
                        <option value="">Seleccionar...</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                      </select>
                    </td>
                    <td className="p-2">
                       <input 
                        type="text" 
                        value={row.description}
                        onChange={(e) => updateDraft(row.id, 'description', e.target.value)}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 border p-1"
                        placeholder="Concepto..."
                      />
                    </td>
                    <td className="p-2">
                      <input 
                        type="number" 
                        value={row.amount}
                        onChange={(e) => updateDraft(row.id, 'amount', parseFloat(e.target.value))}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 border p-1 text-right"
                        min="0" step="0.01"
                      />
                    </td>
                    <td className="p-2">
                      <select 
                        value={row.direction}
                        onChange={(e) => {
                          const val = e.target.value as TransactionDirection;
                          updateDraft(row.id, 'direction', val);
                          // Clear related account if not transfer
                          if (!val.includes('traspaso')) {
                            updateDraft(row.id, 'related_account_id', undefined);
                          }
                        }}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 border p-1"
                      >
                        <option value={TransactionDirection.EXPENSE}>Gasto</option>
                        <option value={TransactionDirection.INCOME}>Ingreso</option>
                        <option value={TransactionDirection.TRANSFER_OUT}>Traspaso (Salida)</option>
                      </select>
                    </td>
                    <td className="p-2">
                      {row.direction === TransactionDirection.TRANSFER_OUT ? (
                        <select 
                          value={row.related_account_id || ''}
                          onChange={(e) => updateDraft(row.id, 'related_account_id', e.target.value)}
                          className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 border p-1 bg-indigo-50 text-indigo-700"
                        >
                          <option value="">Destino...</option>
                          {accounts.filter(a => a.id !== row.account_id).map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs text-slate-400 italic">N/A</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <button onClick={() => removeDraft(row.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
             <button 
               onClick={handleSaveAll} 
               disabled={loading || drafts.length === 0}
               className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
             >
               {loading ? 'Guardando...' : <> <Save size={18} /> Guardar Movimientos</>}
             </button>
          </div>
        </div>
      )}
    </div>
  );
};