import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Key,
  Globe,
  Save,
  Trash2,
  Lock,
  History,
  RotateCcw
} from 'lucide-react';
import { cloudStorage, SyncStatus, PaecAppData } from '../services/cloudStorage';
import { getActiveSupabaseCredentials, isSupabaseConfigured } from '../services/supabaseClient';

interface CloudDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
  syncDetails?: string;
  appData: PaecAppData;
  onForceSync: () => Promise<void>;
}

export const CloudDatabaseModal: React.FC<CloudDatabaseModalProps> = ({
  isOpen,
  onClose,
  syncStatus,
  syncDetails,
  appData,
  onForceSync
}) => {
  const currentCreds = getActiveSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(currentCreds.url || '');
  const [supabaseKey, setSupabaseKey] = useState(currentCreds.key || '');
  const [connecting, setConnecting] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const isConnected = syncStatus === 'synced';

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setConnecting(true);
    setStatusFeedback(null);

    const res = await cloudStorage.configureAndSync(supabaseUrl, supabaseKey, appData);
    setConnecting(false);

    if (res.success) {
      setStatusFeedback({ type: 'success', message: res.message });
    } else {
      setStatusFeedback({ type: 'error', message: res.message });
    }
  };

  const handleManualSync = async () => {
    setConnecting(true);
    setStatusFeedback(null);
    try {
      await onForceSync();
      setStatusFeedback({ type: 'success', message: '¡Datos sincronizados exitosamente con la nube!' });
    } catch (e: any) {
      setStatusFeedback({ type: 'error', message: `Error al sincronizar: ${e.message || 'Fallo de conexión'}` });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (window.confirm('¿Deseas desconectar la base de datos en la nube y volver al modo de guardado local?')) {
      setSupabaseUrl('');
      setSupabaseKey('');
      await cloudStorage.configureAndSync('', '', appData);
      setStatusFeedback({ type: 'success', message: 'Desconectado. Ahora la aplicación usa almacenamiento local.' });
    }
  };

  const sqlQuickCopy = `-- Copiar y ejecutar en Supabase > SQL Editor para activar Sincronización en Tiempo Real:
CREATE TABLE IF NOT EXISTS sincronizacion_global (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL,
  version TEXT DEFAULT '1.0',
  client_id TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE sincronizacion_global ADD COLUMN IF NOT EXISTS client_id TEXT;
ALTER TABLE sincronizacion_global ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Acceso Publico" ON sincronizacion_global;
CREATE POLICY "Acceso Publico" ON sincronizacion_global FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE sincronizacion_global REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE sincronizacion_global;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlQuickCopy);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0F172A] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Configuración de Base de Datos en la Nube</span>
              </h2>
              <p className="text-xs text-slate-400">
                Guarda los expedientes PAEC en Supabase de forma permanente y multi-dispositivo
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto text-xs text-slate-700 flex-1">
          {/* Status Card */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isConnected
              ? 'bg-emerald-50/80 border-emerald-200'
              : 'bg-amber-50/80 border-amber-200'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">Estado Actual:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wider ${
                  isConnected ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {isConnected ? '🟢 Nube Supabase Conectada' : '🟡 Modo Guardado Local'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {isConnected
                  ? 'Los datos se sincronizan automáticamente en tiempo real en la nube.'
                  : 'Ingresa abajo tus 2 credenciales de Supabase para activar la sincronización en la nube.'}
              </p>
            </div>

            {isConnected && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleManualSync}
                  disabled={connecting}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${connecting ? 'animate-spin' : ''}`} />
                  <span>Sincronizar</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                  title="Desconectar base de datos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Feedback Alert */}
          {statusFeedback && (
            <div className={`p-3 rounded-lg flex items-center gap-2 font-medium ${
              statusFeedback.type === 'success'
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-rose-100 text-rose-900 border border-rose-300'
            }`}>
              {statusFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              )}
              <span>{statusFeedback.message}</span>
            </div>
          )}

          {/* Form: Direct Supabase Credentials */}
          <form onSubmit={handleSaveCredentials} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                Credenciales de Supabase
              </h3>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-emerald-700 hover:underline"
              >
                Abrir Supabase Dashboard ↗
              </a>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  1. Project URL (URL del Proyecto)
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    placeholder="https://tu-proyecto.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  2. Project API Key (Clave anon public)
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-slate-500">
                Se guardan de forma segura para esta aplicación.
              </span>
              <button
                type="submit"
                disabled={connecting || !supabaseUrl || !supabaseKey}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {connecting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>Guardar y Conectar Nube</span>
              </button>
            </div>
          </form>

          {/* Quick SQL Script for Supabase */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-slate-600" />
                Script SQL para Supabase (SQL Editor)
              </span>
              <button
                onClick={handleCopySql}
                className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-2xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedScript ? '¡Copiado!' : 'Copiar SQL'}</span>
              </button>
            </div>
            <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[10px] overflow-x-auto">
              <pre>{sqlQuickCopy}</pre>
            </div>
          </div>

          {/* Automatic History Snapshots List */}
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-blue-600" />
              Historial de Respaldos Automáticos
            </h4>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 text-xs">
              {cloudStorage.getHistorySnapshots().length === 0 ? (
                <p className="text-slate-500 text-2xs italic">Sin respaldos recientes en este navegador.</p>
              ) : (
                cloudStorage.getHistorySnapshots().map((snap) => (
                  <div key={snap.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">{snap.label}</p>
                      <p className="text-[10px] text-slate-500">{snap.timestamp} • {snap.data.estudiantes?.length || 0} estudiantes</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm(`¿Deseas restaurar la copia del ${snap.timestamp}?`)) {
                          await cloudStorage.saveAll(snap.data, true);
                          window.location.reload();
                        }
                      }}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded font-bold text-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between">
          <span className="text-2xs text-slate-500">
            Respaldo automático conforme a Ley TEA N° 21.545
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
