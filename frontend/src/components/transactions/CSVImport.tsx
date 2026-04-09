'use client';
import { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { transactionApi } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

export function CSVImport({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ imported: number } | null>(null);
  const [error, setError] = useState('');
  const qc = useQueryClient();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Apenas arquivos .csv são suportados');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const res = await transactionApi.importCSV(file);
      setResult(res.data);
      setStatus('success');
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    } catch {
      setError('Erro ao importar. Verifique o formato do arquivo.');
      setStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface-300 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <p className="font-medium text-gray-300 mb-2">Formato esperado do CSV:</p>
        <p className="font-mono">data,nome,valor,tipo</p>
        <p className="font-mono">2024-01-15,iFood,35.90,PIX</p>
        <p className="font-mono">2024-01-16,Uber,18.00,DEBIT</p>
        <p className="text-gray-600 mt-2">Tipos: PIX, DEBIT, CREDIT, INSTALLMENT</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {status === 'idle' || status === 'error' ? (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            className="w-full border-2 border-dashed border-white/10 hover:border-brand-500/50 rounded-xl p-8 flex flex-col items-center gap-3 transition-colors group"
          >
            <Upload size={28} className="text-gray-500 group-hover:text-brand-400 transition-colors" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-300">Clique para selecionar</p>
              <p className="text-xs text-gray-600">Arquivo .csv</p>
            </div>
          </button>
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">
              <AlertCircle size={16} /> {error}
            </div>
          )}
        </>
      ) : status === 'loading' ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Importando...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6">
          <CheckCircle size={40} className="text-emerald-400" />
          <div className="text-center">
            <p className="text-lg font-bold text-white">{result?.imported} transações</p>
            <p className="text-sm text-gray-400">importadas com sucesso</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>Fechar</Button>
        {status === 'success' && (
          <Button className="flex-1" onClick={() => setStatus('idle')}>Importar mais</Button>
        )}
      </div>
    </div>
  );
}
